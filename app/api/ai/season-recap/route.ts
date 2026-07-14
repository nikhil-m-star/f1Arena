import { NextResponse } from "next/server";
import { getSeasonRecap } from "@/lib/nim";
import { getCurrentSeasonContext } from "@/lib/f1-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { history, mode } = body;

    if (!history || !mode || (mode !== "analyzer" && mode !== "roaster")) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const seasonContext = await getCurrentSeasonContext();
    const recap = await getSeasonRecap({ history, seasonContext }, mode);

    if (!recap) {
      return NextResponse.json({ success: false, error: "NVIDIA NIM was unable to generate a recap." }, { status: 500 });
    }

    return NextResponse.json({ success: true, recap });
  } catch (error: unknown) {
    console.error("AI Season Recap API error:", error);
    const message = error instanceof Error ? error.message : "Unable to generate season recap";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
