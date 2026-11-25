export type PlatformType = "Instagram" | "YouTube" | "Multi-platform";
export type CreatorTier = "Exclusive" | "Roster" | "Network";
export type DealStatus = "Pending" | "Confirmed" | "Paid";
export type AutomationChannel = "slack" | "sheets" | "email" | "webhook";

export interface CreatorDTO {
  id: string;
  name: string;
  handle: string;
  platform: PlatformType;
  niche: string;
  followerCount: number;
  engagementRate: number;
  baseRate: number;
  email: string;
  managerName: string;
  tier: CreatorTier;
  createdAt: string;
  updatedAt: string;
}

export interface BrandDTO {
  id: string;
  name: string;
  sector: string;
  contactName: string;
  contactEmail: string;
  website: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandWithStatsDTO extends BrandDTO {
  dealsCount: number;
  totalPipelineValue: number;
  confirmedOrPaidValue: number;
}

export interface DealDTO {
  id: string;
  creatorId: string;
  brandId?: string | null;
  creatorName?: string;
  brandName: string;
  brandSector: string;
  campaignTitle: string;
  deliverables: string;
  dealValue: number;
  agencyFeePct: number;
  status: DealStatus;
  dueDate: string;
  notes: string;
  lastAutomatedStatus?: DealStatus | null;
  confirmedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorWithDealsDTO extends CreatorDTO {
  deals: DealDTO[];
  totalPipelineValue: number;
  confirmedOrPaidValue: number;
  paidValue: number;
}

export interface AutomationChannelsConfig {
  slack: boolean;
  sheets: boolean;
  email: boolean;
  webhook: boolean;
}

export interface AutomationConfigDTO {
  id: string;
  triggerOnConfirmed: boolean;
  triggerOnPaid: boolean;
  channels: AutomationChannelsConfig;
  slackWebhookUrl: string;
  sheetsWebhookUrl: string;
  customWebhookUrl: string;
  managerEmail: string;
  useLoopbackTestSink: boolean;
  envConfigured?: {
    slack: boolean;
    sheets: boolean;
    email: boolean;
    webhook: boolean;
  };
  updatedAt: string;
}

export interface AutomationLogDTO {
  id: string;
  dealId: string;
  creatorId: string;
  creatorName: string;
  brandName: string;
  dealValue: number;
  previousStatus: string;
  newStatus: DealStatus;
  channel: AutomationChannel;
  mode: "live" | "loopback" | "simulated";
  status: "delivered" | "failed";
  httpStatus: number;
  latencyMs: number;
  idempotencyKey: string;
  summary: string;
  payload: Record<string, unknown>;
  responseBody?: string;
  triggeredAt: string;
}

export interface DashboardMetrics {
  totalPipelineValue: number;
  pendingValue: number;
  confirmedValue: number;
  paidValue: number;
  agencyCommissionConfirmedAndPaid: number;
  netCreatorPayoutConfirmedAndPaid: number;
  totalCreators: number;
  totalDeals: number;
  pendingCount: number;
  confirmedCount: number;
  paidCount: number;
  conversionRate: number;
  automationsFiredCount: number;
}

export interface DashboardPayload {
  storageMode: "supabase-postgres";
  creators: CreatorWithDealsDTO[];
  brands: BrandWithStatsDTO[];
  deals: DealDTO[];
  metrics: DashboardMetrics;
  automationConfig: AutomationConfigDTO;
  automationLogs: AutomationLogDTO[];
}
