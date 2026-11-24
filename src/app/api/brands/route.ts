import { NextRequest, NextResponse } from "next/server";
import { createBrand, listBrands } from "@/lib/store";

export async function GET() {
  try {
    const brands = await listBrands();
    return NextResponse.json({ brands });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Brand name is required (at least 2 characters)." },
        { status: 400 }
      );
    }

    const brand = await createBrand({
      name,
      sector: typeof body.sector === "string" ? body.sector : undefined,
      contactName:
        typeof body.contactName === "string" ? body.contactName : undefined,
      contactEmail:
        typeof body.contactEmail === "string" ? body.contactEmail : undefined,
      website: typeof body.website === "string" ? body.website : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register brand" },
      { status: 500 }
    );
  }
}
