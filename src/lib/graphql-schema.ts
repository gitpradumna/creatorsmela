import { buildSchema } from "graphql";
import { dispatchDealAutomations } from "@/lib/automation";
import {
  createBrand,
  createCreator,
  createDeal,
  deleteBrand,
  deleteCreator,
  deleteDeal,
  getCreatorById,
  getDashboardPayload,
  getDealById,
  getStorageMode,
  listAutomationLogs,
  listDeals,
  seedCreatorsMelaData,
  updateDeal,
} from "@/lib/store";
import type {
  AutomationLogDTO,
  CreatorTier,
  DealStatus,
  PlatformType,
} from "@/types/collab";

export const GRAPHQL_SDL = `
  type HealthStatus {
    ok: Boolean!
    storageMode: String!
    creatorsCount: Int!
    dealsCount: Int!
    timestamp: String!
  }

  type Creator {
    id: ID!
    name: String!
    handle: String!
    platform: String!
    niche: String!
    followerCount: Float!
    engagementRate: Float!
    baseRate: Float!
    email: String!
    managerName: String!
    tier: String!
    createdAt: String!
    updatedAt: String!
  }

  type Brand {
    id: ID!
    name: String!
    sector: String!
    contactName: String!
    contactEmail: String!
    website: String!
    notes: String!
    createdAt: String!
    updatedAt: String!
    dealsCount: Int
    totalPipelineValue: Float
    confirmedOrPaidValue: Float
  }

  type Deal {
    id: ID!
    creatorId: ID!
    brandId: ID
    creatorName: String
    brandName: String!
    brandSector: String!
    campaignTitle: String!
    deliverables: String!
    dealValue: Float!
    agencyFeePct: Float!
    status: String!
    dueDate: String!
    notes: String!
    lastAutomatedStatus: String
    confirmedAt: String
    paidAt: String
    createdAt: String!
    updatedAt: String!
  }

  type CreatorWithDeals {
    id: ID!
    name: String!
    handle: String!
    platform: String!
    niche: String!
    followerCount: Float!
    engagementRate: Float!
    baseRate: Float!
    email: String!
    managerName: String!
    tier: String!
    createdAt: String!
    updatedAt: String!
    deals: [Deal!]!
    totalPipelineValue: Float!
    confirmedOrPaidValue: Float!
    paidValue: Float!
  }

  type AutomationChannels {
    slack: Boolean!
    sheets: Boolean!
    email: Boolean!
    webhook: Boolean!
  }

  type AutomationConfig {
    id: ID!
    triggerOnConfirmed: Boolean!
    triggerOnPaid: Boolean!
    channels: AutomationChannels!
    slackWebhookUrl: String!
    sheetsWebhookUrl: String!
    customWebhookUrl: String!
    managerEmail: String!
    useLoopbackTestSink: Boolean!
    updatedAt: String!
  }

  type AutomationLog {
    id: ID!
    dealId: String!
    creatorId: String!
    creatorName: String!
    brandName: String!
    dealValue: Float!
    previousStatus: String!
    newStatus: String!
    channel: String!
    mode: String!
    status: String!
    httpStatus: Int!
    latencyMs: Int!
    idempotencyKey: String!
    summary: String!
    responseBody: String
    triggeredAt: String!
  }

  type DashboardMetrics {
    totalPipelineValue: Float!
    pendingValue: Float!
    confirmedValue: Float!
    paidValue: Float!
    agencyCommissionConfirmedAndPaid: Float!
    netCreatorPayoutConfirmedAndPaid: Float!
    totalCreators: Int!
    totalDeals: Int!
    pendingCount: Int!
    confirmedCount: Int!
    paidCount: Int!
    conversionRate: Int!
    automationsFiredCount: Int!
  }

  type DashboardPayload {
    storageMode: String!
    creators: [CreatorWithDeals!]!
    brands: [Brand!]!
    deals: [Deal!]!
    metrics: DashboardMetrics!
    automationConfig: AutomationConfig!
    automationLogs: [AutomationLog!]!
  }

  type DealMutationResult {
    deal: Deal!
    automationsTriggered: [AutomationLog!]!
  }

  type SeedResult {
    seeded: Boolean!
    creatorsCreated: Int!
    brandsCreated: Int!
    dealsCreated: Int!
  }

  type Query {
    health: HealthStatus!
    dashboard: DashboardPayload!
    creators: [CreatorWithDeals!]!
    brands: [Brand!]!
    deals(status: String, creatorId: String, niche: String, search: String): [Deal!]!
    automationLogs(limit: Int): [AutomationLog!]!
  }

  type Mutation {
    createCreator(
      name: String!
      niche: String!
      followerCount: Float!
      handle: String
      platform: String
      managerName: String
      tier: String
    ): Creator!

    createBrand(
      name: String!
      sector: String
      contactName: String
      contactEmail: String
      website: String
      notes: String
    ): Brand!

    createDeal(
      creatorId: ID!
      brandId: ID
      brandName: String!
      dealValue: Float!
      status: String
      brandSector: String
      campaignTitle: String
      deliverables: String
      agencyFeePct: Float
      dueDate: String
      notes: String
    ): DealMutationResult!

    updateDealStatus(id: ID!, status: String!): DealMutationResult!
    deleteCreator(id: ID!): Boolean!
    deleteBrand(id: ID!): Boolean!
    deleteDeal(id: ID!): Boolean!
    seedSampleData(force: Boolean): SeedResult!
  }
`;

export const collabGraphQLSchema = buildSchema(GRAPHQL_SDL);

const VALID_STATUSES: DealStatus[] = ["Pending", "Confirmed", "Paid"];

export function createGraphQLRootValue(requestOrigin?: string) {
  return {
    health: async () => {
      const [creators, deals] = await Promise.all([
        getDashboardPayload().then((d) => d.creators),
        listDeals(),
      ]);
      return {
        ok: true,
        storageMode: getStorageMode(),
        creatorsCount: creators.length,
        dealsCount: deals.length,
        timestamp: new Date().toISOString(),
      };
    },

    dashboard: async () => {
      return getDashboardPayload();
    },

    creators: async () => {
      const payload = await getDashboardPayload();
      return payload.creators;
    },

    brands: async () => {
      const payload = await getDashboardPayload();
      return payload.brands;
    },

    deals: async (args: {
      status?: string;
      creatorId?: string;
      niche?: string;
      search?: string;
    }) => {
      return listDeals({
        status: args.status,
        creatorId: args.creatorId,
        niche: args.niche,
        search: args.search,
      });
    },

    automationLogs: async (args: { limit?: number }) => {
      return listAutomationLogs(args.limit ?? 60);
    },

    createCreator: async (args: {
      name: string;
      niche: string;
      followerCount: number;
      handle?: string;
      platform?: string;
      managerName?: string;
      tier?: string;
    }) => {
      return createCreator({
        name: args.name,
        niche: args.niche,
        followerCount: args.followerCount,
        handle: args.handle,
        platform: (args.platform as PlatformType) || "Multi-platform",
        managerName: args.managerName,
        tier: (args.tier as CreatorTier) || "Exclusive",
      });
    },

    createBrand: async (args: {
      name: string;
      sector?: string;
      contactName?: string;
      contactEmail?: string;
      website?: string;
      notes?: string;
    }) => {
      return createBrand({
        name: args.name,
        sector: args.sector,
        contactName: args.contactName,
        contactEmail: args.contactEmail,
        website: args.website,
        notes: args.notes,
      });
    },

    createDeal: async (args: {
      creatorId: string;
      brandId?: string;
      brandName: string;
      dealValue: number;
      status?: string;
      brandSector?: string;
      campaignTitle?: string;
      deliverables?: string;
      agencyFeePct?: number;
      dueDate?: string;
      notes?: string;
    }) => {
      const status: DealStatus = VALID_STATUSES.includes(args.status as DealStatus)
        ? (args.status as DealStatus)
        : "Pending";
      const creator = await getCreatorById(args.creatorId);
      if (!creator) throw new Error("Creator not found");

      const deal = await createDeal({
        creatorId: args.creatorId,
        brandId: args.brandId,
        brandName: args.brandName,
        dealValue: args.dealValue,
        status,
        brandSector: args.brandSector,
        campaignTitle: args.campaignTitle,
        deliverables: args.deliverables,
        agencyFeePct: args.agencyFeePct,
        dueDate: args.dueDate,
        notes: args.notes,
      });

      const automationsTriggered = await dispatchDealAutomations({
        deal,
        creator,
        previousStatus: "New",
        requestOrigin,
      });

      return { deal, automationsTriggered };
    },

    updateDealStatus: async (args: { id: string; status: string }) => {
      if (!VALID_STATUSES.includes(args.status as DealStatus)) {
        throw new Error(
          "Invalid deal status. Must be Pending, Confirmed, or Paid."
        );
      }
      const nextStatus = args.status as DealStatus;
      const existing = await getDealById(args.id);
      if (!existing) throw new Error("Deal not found");
      if (existing.status === "Paid" && nextStatus !== "Paid") {
        throw new Error("Deals marked as Paid cannot change status.");
      }

      const result = await updateDeal(args.id, { status: nextStatus });
      if (!result) throw new Error("Deal not found");

      let automationsTriggered: AutomationLogDTO[] = [];
      if (result.previous.status !== result.updated.status) {
        const creator = await getCreatorById(result.updated.creatorId);
        if (creator) {
          automationsTriggered = await dispatchDealAutomations({
            deal: result.updated,
            creator,
            previousStatus: result.previous.status,
            requestOrigin,
          });
          if (automationsTriggered.length > 0) {
            await updateDeal(args.id, {
              lastAutomatedStatus: result.updated.status,
            });
          }
        }
      }

      return {
        deal: result.updated,
        automationsTriggered,
      };
    },

    deleteCreator: async (args: { id: string }) => {
      return deleteCreator(args.id);
    },

    deleteBrand: async (args: { id: string }) => {
      return deleteBrand(args.id);
    },

    deleteDeal: async (args: { id: string }) => {
      return deleteDeal(args.id);
    },

    seedSampleData: async (args: { force?: boolean }) => {
      return seedCreatorsMelaData(Boolean(args.force));
    },
  };
}
