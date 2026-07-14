import { NextResponse } from "next/server";
import { getConfidenceCommentary } from "@/lib/nim";

export const revalidate = 0;

export async function GET() {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  const keyLength = apiKey ? apiKey.length : 0;
  const maskedKey = apiKey ? `${apiKey.slice(0, 5)}...${apiKey.slice(-5)}` : "NOT_DEFINED";

  try {
    const commentary = await getConfidenceCommentary({
      raceName: "Australian Grand Prix",
      p1: "norris",
      p2: "max_verstappen",
      p3: "leclerc",
      fastestLap: "norris",
      dnf: null,
    });

    return NextResponse.json({
      success: true,
      env: {
        keyLength,
        maskedKey,
      },
      commentary,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      env: {
        keyLength,
        maskedKey,
      },
      error: error.message,
    });
  }
}
