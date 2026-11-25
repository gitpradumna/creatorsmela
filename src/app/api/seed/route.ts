import { NextRequest, NextResponse } from "next/server";
import { seedCreatorsMelaData } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = body.force === undefined ? true : Boolean(body.force);
    const result = await seedCreatorsMelaData(force);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 }
    );
  }
}
