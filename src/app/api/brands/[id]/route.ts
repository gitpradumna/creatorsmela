import { NextRequest, NextResponse } from "next/server";
import { deleteBrand } from "@/lib/store";

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete brand" },
      { status: 500 }
    );
  }
}
