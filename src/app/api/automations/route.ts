import { NextRequest, NextResponse } from "next/server";
import {
  getAutomationConfig,
  listAutomationLogs,
  updateAutomationConfig,
} from "@/lib/store";

export async function GET() {
  try {
    const [config, logs] = await Promise.all([
      getAutomationConfig(),
      listAutomationLogs(60),
    ]);
    return NextResponse.json({ config, logs });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch automations",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config = await updateAutomationConfig({
      triggerOnConfirmed:
        typeof body.triggerOnConfirmed === "boolean"
          ? body.triggerOnConfirmed
          : undefined,
      triggerOnPaid:
        typeof body.triggerOnPaid === "boolean" ? body.triggerOnPaid : undefined,
      channels: body.channels,
      slackWebhookUrl:
        typeof body.slackWebhookUrl === "string"
          ? body.slackWebhookUrl.trim()
          : undefined,
      sheetsWebhookUrl:
        typeof body.sheetsWebhookUrl === "string"
          ? body.sheetsWebhookUrl.trim()
          : undefined,
      customWebhookUrl:
        typeof body.customWebhookUrl === "string"
          ? body.customWebhookUrl.trim()
          : undefined,
      managerEmail:
        typeof body.managerEmail === "string"
          ? body.managerEmail.trim()
          : undefined,
      useLoopbackTestSink:
        typeof body.useLoopbackTestSink === "boolean"
          ? body.useLoopbackTestSink
          : undefined,
    });
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update automation config",
      },
      { status: 500 }
    );
  }
}
