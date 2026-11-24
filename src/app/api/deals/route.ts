import { NextRequest, NextResponse } from "next/server";
import { dispatchDealAutomations } from "@/lib/automation";
import { createDeal, getCreatorById, listDeals } from "@/lib/store";
import type { DealStatus } from "@/types/collab";

const VALID_STATUSES: DealStatus[] = ["Pending", "Confirmed", "Paid"];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deals = await listDeals({
      status: searchParams.get("status"),
      creatorId: searchParams.get("creatorId"),
      niche: searchParams.get("niche"),
      search: searchParams.get("search"),
    });
    return NextResponse.json({ deals });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const creatorId = typeof body.creatorId === "string" ? body.creatorId.trim() : "";
    const brandName = typeof body.brandName === "string" ? body.brandName.trim() : "";
    const dealValue = Number(body.dealValue);
    const status: DealStatus = VALID_STATUSES.includes(body.status)
      ? body.status
      : "Pending";

    if (!creatorId) {
      return NextResponse.json(
        { error: "creatorId is required." },
        { status: 400 }
      );
    }
    if (!brandName) {
      return NextResponse.json(
        { error: "brandName is required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(dealValue) || dealValue < 0) {
      return NextResponse.json(
        { error: "Valid dealValue is required." },
        { status: 400 }
      );
    }

    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found." }, { status: 404 });
    }

    const deal = await createDeal({
      creatorId,
      brandId: typeof body.brandId === "string" ? body.brandId : undefined,
      brandName,
      brandSector: typeof body.brandSector === "string" ? body.brandSector : undefined,
      campaignTitle:
        typeof body.campaignTitle === "string" ? body.campaignTitle : undefined,
      deliverables:
        typeof body.deliverables === "string" ? body.deliverables : undefined,
      dealValue,
      agencyFeePct:
        body.agencyFeePct !== undefined ? Number(body.agencyFeePct) : 15,
      status,
      dueDate: typeof body.dueDate === "string" ? body.dueDate : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    const origin = new URL(req.url).origin;
    const automationsTriggered = await dispatchDealAutomations({
      deal,
      creator,
      previousStatus: "New",
      requestOrigin: origin,
    });

    return NextResponse.json(
      { deal, automationsTriggered },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create deal" },
      { status: 500 }
    );
  }
}
