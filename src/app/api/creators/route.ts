import { NextRequest, NextResponse } from "next/server";
import { createCreator, listCreators } from "@/lib/store";
import type { CreatorTier, PlatformType } from "@/types/collab";

const VALID_PLATFORMS: PlatformType[] = ["Instagram", "YouTube", "Multi-platform"];
const VALID_TIERS: CreatorTier[] = ["Exclusive", "Roster", "Network"];

export async function GET() {
  try {
    const creators = await listCreators();
    return NextResponse.json({ creators });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch creators" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const niche = typeof body.niche === "string" ? body.niche.trim() : "";
    const followerCount = Number(body.followerCount);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Creator name is required (at least 2 characters)." },
        { status: 400 }
      );
    }
    if (!niche) {
      return NextResponse.json(
        { error: "Creator niche is required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(followerCount) || followerCount < 0) {
      return NextResponse.json(
        { error: "Valid follower count is required." },
        { status: 400 }
      );
    }

    const platform = VALID_PLATFORMS.includes(body.platform)
      ? (body.platform as PlatformType)
      : "Multi-platform";
    const tier = VALID_TIERS.includes(body.tier)
      ? (body.tier as CreatorTier)
      : "Exclusive";

    const creator = await createCreator({
      name,
      handle: typeof body.handle === "string" ? body.handle : undefined,
      platform,
      niche,
      followerCount,
      engagementRate:
        body.engagementRate !== undefined ? Number(body.engagementRate) : undefined,
      baseRate: body.baseRate !== undefined ? Number(body.baseRate) : undefined,
      email: typeof body.email === "string" ? body.email : undefined,
      managerName:
        typeof body.managerName === "string" ? body.managerName : undefined,
      tier,
    });

    return NextResponse.json({ creator }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create creator" },
      { status: 500 }
    );
  }
}
