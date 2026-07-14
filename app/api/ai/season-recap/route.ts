import { NextResponse } from "next/server";
import { getSeasonRecap } from "@/lib/nim";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { history, mode } = body;

    if (!history || !mode || (mode !== "analyzer" && mode !== "roaster")) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const recap = await getSeasonRecap({ history }, mode);

    if (!recap) {
      return NextResponse.json({ success: false, error: "NVIDIA NIM was unable to generate a recap." }, { status: 500 });
    }

    return NextResponse.json({ success: true, recap });
  } catch (error: any) {
    console.error("AI Season Recap API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
