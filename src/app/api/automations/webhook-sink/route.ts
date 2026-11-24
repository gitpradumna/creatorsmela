import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-creatorsmela-signature") || "";
    const eventHeader = req.headers.get("x-creatorsmela-event") || "unknown";
    const secret =
      process.env.WEBHOOK_SIGNING_SECRET || "creatorsmela-iris-dev-secret";

    const expected = `sha256=${crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")}`;

    const verifiedSignature =
      signatureHeader.length > 0 && signatureHeader === expected;

    return NextResponse.json({
      received: true,
      sink: "creatorsmela-iris-loopback",
      event: eventHeader,
      verifiedSignature,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        received: false,
        error: error instanceof Error ? error.message : "Sink error",
      },
      { status: 400 }
    );
  }
}
