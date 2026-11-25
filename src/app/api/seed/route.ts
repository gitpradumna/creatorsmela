import { NextRequest, NextResponse } from "next/server";
import { clearDatabaseData, seedCreatorsMelaData } from "@/lib/store";

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

export async function DELETE() {
  try {
    const result = await clearDatabaseData();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to clear database",
      },
      { status: 500 }
    );
  }
}
