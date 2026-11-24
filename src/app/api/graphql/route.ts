import { graphql } from "graphql";
import { NextRequest, NextResponse } from "next/server";
import {
  collabGraphQLSchema,
  createGraphQLRootValue,
  GRAPHQL_SDL,
} from "@/lib/graphql-schema";

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/graphql",
    database: "Supabase PostgreSQL",
    supabaseNativePgGraphql: "${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1",
    sampleQueries: {
      dashboard: `query GetDashboard {
  dashboard {
    storageMode
    metrics {
      totalPipelineValue
      confirmedValue
      paidValue
      totalCreators
      totalDeals
    }
    creators {
      id
      name
      niche
      followerCount
      deals {
        id
        brandName
        dealValue
        status
      }
    }
  }
}`,
      filterDeals: `query PaidDeals {
  deals(status: "Paid") {
    id
    brandName
    creatorName
    dealValue
    status
  }
}`,
    },
    schemaSDL: GRAPHQL_SDL,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body.query === "string" ? body.query : "";
    if (!query.trim()) {
      return NextResponse.json(
        { errors: [{ message: "GraphQL query string is required." }] },
        { status: 400 }
      );
    }

    const origin = new URL(req.url).origin;
    const result = await graphql({
      schema: collabGraphQLSchema,
      source: query,
      rootValue: createGraphQLRootValue(origin),
      variableValues:
        body.variables && typeof body.variables === "object"
          ? body.variables
          : undefined,
      operationName:
        typeof body.operationName === "string" ? body.operationName : undefined,
    });

    return NextResponse.json(result, {
      status: result.errors && !result.data ? 400 : 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        errors: [
          {
            message:
              error instanceof Error ? error.message : "GraphQL execution error",
          },
        ],
      },
      { status: 500 }
    );
  }
}
