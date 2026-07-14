import { NextResponse } from "next/server";
import { getConfidenceCommentary } from "@/lib/nim";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { raceName, p1, p2, p3, fastestLap, dnf } = body;

    if (!raceName || !p1 || !p2 || !p3 || !fastestLap) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const commentary = await getConfidenceCommentary({
      raceName,
      p1,
      p2,
      p3,
      fastestLap,
      dnf,
    });

    if (!commentary) {
      return NextResponse.json({
        success: true,
        commentary: "AI Coach is currently unavailable. Your predictions look solid though — lock them in!",
      });
    }

    return NextResponse.json({ success: true, commentary });
  } catch (error: any) {
    console.error("AI Commentary API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

