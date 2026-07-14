import { NextResponse } from "next/server";
import { getConfidenceCommentary } from "@/lib/nim";
import { getCurrentSeasonContext } from "@/lib/f1-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { raceName, p1, p2, p3, fastestLap, dnf } = body;

    if (!raceName || !p1 || !p2 || !p3 || !fastestLap) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const seasonContext = await getCurrentSeasonContext(raceName);
    const commentary = await getConfidenceCommentary({
      raceName,
      p1,
      p2,
      p3,
      fastestLap,
      dnf,
      seasonContext,
    });

    if (!commentary) {
      return NextResponse.json({
        success: true,
        commentary: "AI Coach is currently unavailable. Your predictions look solid though — lock them in!",
      });
    }

    return NextResponse.json({ success: true, commentary });
  } catch (error: unknown) {
    console.error("AI Commentary API error:", error);
    const message = error instanceof Error ? error.message : "Unable to generate commentary";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
