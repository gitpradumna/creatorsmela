import { NextRequest, NextResponse } from "next/server";
import { dispatchDealAutomations } from "@/lib/automation";
import { deleteDeal, getCreatorById, getDealById, updateDeal } from "@/lib/store";
import type { AutomationLogDTO, DealStatus } from "@/types/collab";

const VALID_STATUSES: DealStatus[] = ["Pending", "Confirmed", "Paid"];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid deal status. Must be Pending, Confirmed, or Paid." },
        { status: 400 }
      );
    }

    if (body.status !== undefined) {
      const existing = await getDealById(id);
      if (!existing) {
        return NextResponse.json({ error: "Deal not found" }, { status: 404 });
      }
      if (existing.status === "Paid" && body.status !== "Paid") {
        return NextResponse.json(
          { error: "Deals marked as Paid cannot change status." },
          { status: 409 }
        );
      }
    }

    const patch: Record<string, unknown> = {};
    const allowedFields = [
      "creatorId",
      "brandName",
      "brandSector",
      "campaignTitle",
      "deliverables",
      "dealValue",
      "agencyFeePct",
      "status",
      "dueDate",
      "notes",
    ];
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        patch[key] = body[key];
      }
    }

    const result = await updateDeal(id, patch);
    if (!result) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const { previous, updated } = result;
    let automationsTriggered: AutomationLogDTO[] = [];

    if (previous.status !== updated.status) {
      const creator = await getCreatorById(updated.creatorId);
      if (creator) {
        const origin = new URL(req.url).origin;
        automationsTriggered = await dispatchDealAutomations({
          deal: updated,
          creator,
          previousStatus: previous.status,
          requestOrigin: origin,
        });

        if (automationsTriggered.length > 0) {
          await updateDeal(id, { lastAutomatedStatus: updated.status });
        }
      }
    }

    return NextResponse.json({
      deal: updated,
      previousStatus: previous.status,
      automationsTriggered,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update deal";
    const statusCode =
      msg.includes("cannot change status") ||
      msg.includes("cannot be changed") ||
      msg.includes("locked")
        ? 409
        : 500;
    return NextResponse.json({ error: msg }, { status: statusCode });
  }
}

export { PATCH as PUT };

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteDeal(id);
    if (!deleted) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete deal" },
      { status: 500 }
    );
  }
}
