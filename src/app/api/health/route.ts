import { NextResponse } from "next/server";
import { getStorageMode, listCreators, listDeals } from "@/lib/store";

export async function GET() {
  try {
    const [creators, deals] = await Promise.all([listCreators(), listDeals()]);
    return NextResponse.json({
      ok: true,
      storageMode: getStorageMode(),
      creatorsCount: creators.length,
      dealsCount: deals.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        storageMode: getStorageMode(),
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
