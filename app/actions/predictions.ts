"use server";

import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export interface PredictionPayload {
  raceId: string;
  predictedP1: string;
  predictedP2: string;
  predictedP3: string;
  predictedFastestLap: string;
  predictedDNF: string | null;
  isJoker: boolean;
}

export async function submitPrediction(payload: PredictionPayload) {
  try {
    const user = await syncUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const { raceId, predictedP1, predictedP2, predictedP3, predictedFastestLap, predictedDNF, isJoker } = payload;

    // Fetch the race
    const race = await db.race.findUnique({
      where: { id: raceId },
    });

    if (!race) {
      return { success: false, error: "Race not found." };
    }

    // Check lock status
    const now = new Date();
    if (race.locked || now >= new Date(race.qualiDateTime)) {
      return { success: false, error: "Predictions are locked for this race weekend." };
    }

    // Validate podium inputs (drivers must be unique)
    if (predictedP1 === predictedP2 || predictedP1 === predictedP3 || predictedP2 === predictedP3) {
      return { success: false, error: "Podium picks (P1, P2, P3) must be unique drivers." };
    }

    // Validate Joker limit (at most 1 per season)
    if (isJoker) {
      const existingJoker = await db.prediction.findFirst({
        where: {
          userId: user.id,
          isJoker: true,
          race: {
            season: race.season,
          },
          NOT: {
            raceId: race.id,
          },
        },
      });

      if (existingJoker) {
        return {
          success: false,
          error: "You have already used your Joker prediction for this season.",
        };
      }
    }

    // Upsert prediction
    const prediction = await db.prediction.upsert({
      where: {
        userId_raceId: {
          userId: user.id,
          raceId: race.id,
        },
      },
      update: {
        predictedP1,
        predictedP2,
        predictedP3,
        predictedFastestLap,
        predictedDNF,
        isJoker,
        submittedAt: new Date(),
      },
      create: {
        userId: user.id,
        raceId: race.id,
        predictedP1,
        predictedP2,
        predictedP3,
        predictedFastestLap,
        predictedDNF,
        isJoker,
      },
    });

    revalidatePath(`/races/${raceId}`);
    revalidatePath("/calendar");
    return { success: true, prediction };
  } catch (error: any) {
    console.error("Submit prediction error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
