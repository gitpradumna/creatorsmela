import { NextRequest, NextResponse } from "next/server";
import { deleteBrand, updateBrand } from "@/lib/store";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateBrand(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    return NextResponse.json({ brand: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update brand";
    const statusCode = msg.includes("already registered") ? 409 : 500;
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
    const deleted = await deleteBrand(id);
    if (!deleted) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete brand";
    const statusCode = msg.includes("Paid deals") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status: statusCode });
  }
}
