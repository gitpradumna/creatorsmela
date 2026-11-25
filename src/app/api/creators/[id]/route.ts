import { NextRequest, NextResponse } from "next/server";
import { deleteCreator, updateCreator } from "@/lib/store";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateCreator(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    return NextResponse.json({ creator: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update creator" },
      { status: 500 }
    );
  }
}

export { PATCH as PUT };

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteCreator(id);
    if (!deleted) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete creator";
    const statusCode = msg.includes("Paid deals") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status: statusCode });
  }
}
