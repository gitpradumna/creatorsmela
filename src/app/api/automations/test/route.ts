import { NextRequest, NextResponse } from "next/server";
import { dispatchDealAutomations } from "@/lib/automation";
import { listCreators, listDeals } from "@/lib/store";
import type { CreatorDTO, DealDTO } from "@/types/collab";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const [creators, deals] = await Promise.all([listCreators(), listDeals()]);

    let targetDeal: DealDTO | undefined = deals.find((d) => d.id === body.dealId);
    if (!targetDeal) {
      targetDeal =
        deals.find((d) => d.status === "Confirmed" || d.status === "Paid") ||
        deals[0];
    }

    let targetCreator: CreatorDTO | undefined = targetDeal
      ? creators.find((c) => c.id === targetDeal!.creatorId)
      : creators[0];

    if (!targetDeal || !targetCreator) {
      const now = new Date().toISOString();
      targetCreator = {
        id: "sample-creator",
        name: "Hemant Show",
        handle: "@hemantshoww",
        platform: "Multi-platform",
        niche: "Comedy & Sketches",
        followerCount: 3_000_000,
        engagementRate: 7.4,
        baseRate: 420_000,
        email: "hemant@creatorsmela.com",
        managerName: "Ananya Kapoor",
        tier: "Exclusive",
        createdAt: now,
        updatedAt: now,
      };
      targetDeal = {
        id: "sample-deal",
        creatorId: targetCreator.id,
        creatorName: targetCreator.name,
        brandName: "Lenskart",
        brandSector: "EYEWEAR",
        campaignTitle: "Test Automation Dispatch",
        deliverables: "1 YT Integration + 2 IG Reels",
        dealValue: 480_000,
        agencyFeePct: 15,
        status: "Confirmed",
        dueDate: "2026-12-10",
        notes: "Manual automation test event",
        createdAt: now,
        updatedAt: now,
      };
    }

    const origin = new URL(req.url).origin;
    const logs = await dispatchDealAutomations({
      deal: {
        ...targetDeal,
        status:
          targetDeal.status === "Pending" ? "Confirmed" : targetDeal.status,
      },
      creator: targetCreator,
      previousStatus: "Pending",
      requestOrigin: origin,
      forceAll: true,
    });

    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to run test automation",
      },
      { status: 500 }
    );
  }
}
