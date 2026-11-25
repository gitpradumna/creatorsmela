import { buildSeedDeals, SEED_BRANDS, SEED_CREATORS } from "@/lib/seed-data";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  AutomationChannel,
  AutomationConfigDTO,
  AutomationLogDTO,
  BrandDTO,
  BrandWithStatsDTO,
  CreatorDTO,
  CreatorTier,
  CreatorWithDealsDTO,
  DashboardMetrics,
  DashboardPayload,
  DealDTO,
  DealStatus,
  PlatformType,
} from "@/types/collab";

interface CreatorRow {
  id: string;
  name: string;
  handle: string;
  platform: PlatformType;
  niche: string;
  follower_count: number;
  engagement_rate: number;
  base_rate: number;
  email: string;
  manager_name: string;
  tier: CreatorTier;
  created_at: string;
  updated_at: string;
}

interface BrandRow {
  id: string;
  name: string;
  sector: string;
  contact_name: string;
  contact_email: string;
  website: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface DealRow {
  id: string;
  creator_id: string;
  brand_id: string | null;
  brand_name: string;
  brand_sector: string;
  campaign_title: string;
  deliverables: string;
  deal_value: number;
  agency_fee_pct: number;
  status: DealStatus;
  due_date: string;
  notes: string;
  last_automated_status: DealStatus | null;
  confirmed_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AutomationConfigRow {
  singleton_key: string;
  trigger_on_confirmed: boolean;
  trigger_on_paid: boolean;
  channel_slack: boolean;
  channel_sheets: boolean;
  channel_email: boolean;
  channel_webhook: boolean;
  slack_webhook_url: string;
  sheets_webhook_url: string;
  custom_webhook_url: string;
  manager_email: string;
  use_loopback_test_sink: boolean;
  updated_at: string;
}

interface AutomationLogRow {
  id: string;
  deal_id: string;
  creator_id: string;
  creator_name: string;
  brand_name: string;
  deal_value: number;
  previous_status: string;
  new_status: DealStatus;
  channel: AutomationChannel;
  mode: "live" | "simulated";
  status: "delivered" | "failed";
  http_status: number;
  latency_ms: number;
  idempotency_key: string;
  summary: string;
  payload: Record<string, unknown>;
  response_body: string;
  triggered_at: string;
}

function mapCreatorRow(row: CreatorRow): CreatorDTO {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle || "",
    platform: row.platform,
    niche: row.niche,
    followerCount: Number(row.follower_count),
    engagementRate: Number(row.engagement_rate ?? 4.8),
    baseRate: Number(row.base_rate ?? 75000),
    email: row.email || "",
    managerName: row.manager_name || "Talent Ops Desk",
    tier: row.tier || "Exclusive",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBrandRow(row: BrandRow): BrandDTO {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector || "CONSUMER",
    contactName: row.contact_name || "",
    contactEmail: row.contact_email || "",
    website: row.website || "",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDealRow(row: DealRow, creatorName?: string): DealDTO {
  return {
    id: row.id,
    creatorId: row.creator_id,
    brandId: row.brand_id ?? null,
    creatorName,
    brandName: row.brand_name,
    brandSector: row.brand_sector || "COLLAB",
    campaignTitle: row.campaign_title || "",
    deliverables: row.deliverables || "1 IG Reel + 2 Stories",
    dealValue: Number(row.deal_value),
    agencyFeePct: Number(row.agency_fee_pct ?? 15),
    status: row.status,
    dueDate: row.due_date || "",
    notes: row.notes || "",
    lastAutomatedStatus: row.last_automated_status ?? null,
    confirmedAt: row.confirmed_at ?? null,
    paidAt: row.paid_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapConfigRow(row: AutomationConfigRow): AutomationConfigDTO {
  return {
    id: row.singleton_key,
    triggerOnConfirmed: row.trigger_on_confirmed,
    triggerOnPaid: row.trigger_on_paid,
    channels: {
      slack: row.channel_slack,
      sheets: row.channel_sheets,
      email: row.channel_email,
    },
    slackWebhookUrl: row.slack_webhook_url || "",
    sheetsWebhookUrl: row.sheets_webhook_url || "",
    managerEmail: row.manager_email || "talent-ops@creatorsmela.com",
    updatedAt: row.updated_at,
  };
}

function mapLogRow(row: AutomationLogRow): AutomationLogDTO {
  return {
    id: row.id,
    dealId: row.deal_id,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    brandName: row.brand_name,
    dealValue: Number(row.deal_value),
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    channel: row.channel,
    mode: row.mode,
    status: row.status,
    httpStatus: Number(row.http_status),
    latencyMs: Number(row.latency_ms),
    idempotencyKey: row.idempotency_key,
    summary: row.summary,
    payload: row.payload || {},
    responseBody: row.response_body || "",
    triggeredAt: row.triggered_at,
  };
}

export function getStorageMode(): "supabase-postgres" {
  return "supabase-postgres";
}

export interface CreateCreatorInput {
  name: string;
  handle?: string;
  platform?: PlatformType;
  niche: string;
  followerCount: number;
  engagementRate?: number;
  baseRate?: number;
  email?: string;
  managerName?: string;
  tier?: CreatorTier;
}

export interface CreateBrandInput {
  name: string;
  sector?: string;
  contactName?: string;
  contactEmail?: string;
  website?: string;
  notes?: string;
}

export interface CreateDealInput {
  creatorId: string;
  brandId?: string;
  brandName: string;
  brandSector?: string;
  campaignTitle?: string;
  deliverables?: string;
  dealValue: number;
  agencyFeePct?: number;
  status: DealStatus;
  dueDate?: string;
  notes?: string;
}

export interface DealFilters {
  status?: string | null;
  creatorId?: string | null;
  niche?: string | null;
  search?: string | null;
}

export async function listCreators(): Promise<CreatorDTO[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data || []) as CreatorRow[]).map(mapCreatorRow);
}

export async function getCreatorById(id: string): Promise<CreatorDTO | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(error.message);
  }
  return data ? mapCreatorRow(data as CreatorRow) : null;
}

export async function createCreator(input: CreateCreatorInput): Promise<CreatorDTO> {
  const supabase = getSupabaseClient();
  const cleanHandle = input.handle?.trim()
    ? input.handle.trim().startsWith("@")
      ? input.handle.trim()
      : `@${input.handle.trim()}`
    : `@${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;

  const { data, error } = await supabase
    .from("creators")
    .insert({
      name: input.name.trim(),
      handle: cleanHandle,
      platform: input.platform || "Multi-platform",
      niche: input.niche.trim(),
      follower_count: Number(input.followerCount),
      engagement_rate: input.engagementRate ?? 4.8,
      base_rate: input.baseRate ?? 75000,
      email: input.email?.trim() || "",
      manager_name: input.managerName?.trim() || "Talent Ops Desk",
      tier: input.tier || "Exclusive",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapCreatorRow(data as CreatorRow);
}

export async function updateCreator(
  id: string,
  patch: Partial<CreateCreatorInput>
): Promise<CreatorDTO | null> {
  const supabase = getSupabaseClient();
  const updateRow: Record<string, unknown> = {};
  if (patch.name !== undefined) updateRow.name = patch.name.trim();
  if (patch.handle !== undefined) updateRow.handle = patch.handle.trim();
  if (patch.platform !== undefined) updateRow.platform = patch.platform;
  if (patch.niche !== undefined) updateRow.niche = patch.niche.trim();
  if (patch.followerCount !== undefined)
    updateRow.follower_count = Number(patch.followerCount);
  if (patch.engagementRate !== undefined)
    updateRow.engagement_rate = Number(patch.engagementRate);
  if (patch.baseRate !== undefined) updateRow.base_rate = Number(patch.baseRate);
  if (patch.email !== undefined) updateRow.email = patch.email.trim();
  if (patch.managerName !== undefined)
    updateRow.manager_name = patch.managerName.trim();
  if (patch.tier !== undefined) updateRow.tier = patch.tier;

  const { data, error } = await supabase
    .from("creators")
    .update(updateRow)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(error.message);
  }
  return data ? mapCreatorRow(data as CreatorRow) : null;
}

export async function deleteCreator(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: paidDeals, error: checkErr } = await supabase
    .from("deals")
    .select("id")
    .eq("creator_id", id)
    .eq("status", "Paid")
    .limit(1);

  if (checkErr) {
    if (checkErr.code === "22P02") return false;
    throw new Error(checkErr.message);
  }
  if (paidDeals && paidDeals.length > 0) {
    throw new Error("Cannot delete a creator who has Paid deals.");
  }

  const { data, error } = await supabase
    .from("creators")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "22P02") return false;
    throw new Error(error.message);
  }
  return Boolean(data && data.length > 0);
}

export async function listBrands(): Promise<BrandDTO[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data || []) as BrandRow[]).map(mapBrandRow);
}

export async function findBrandByName(name: string): Promise<BrandDTO | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .ilike("name", name.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapBrandRow(data as BrandRow) : null;
}

export async function getBrandById(id: string): Promise<BrandDTO | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(error.message);
  }
  return data ? mapBrandRow(data as BrandRow) : null;
}

export async function createBrand(input: CreateBrandInput): Promise<BrandDTO> {
  const supabase = getSupabaseClient();
  const cleanName = input.name.trim();
  const existing = await findBrandByName(cleanName);
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("brands")
    .insert({
      name: cleanName,
      sector: (input.sector || "CONSUMER").trim().toUpperCase(),
      contact_name: input.contactName?.trim() || "",
      contact_email: input.contactEmail?.trim() || "",
      website: input.website?.trim() || "",
      notes: input.notes?.trim() || "",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapBrandRow(data as BrandRow);
}

export async function updateBrand(
  id: string,
  patch: Partial<CreateBrandInput>
): Promise<BrandDTO | null> {
  const supabase = getSupabaseClient();
  const existing = await getBrandById(id);
  if (!existing) return null;

  const updateRow: Record<string, unknown> = {};
  if (patch.name !== undefined) {
    const cleanName = patch.name.trim();
    const conflict = await findBrandByName(cleanName);
    if (conflict && conflict.id !== id) {
      throw new Error(`Brand "${cleanName}" is already registered.`);
    }
    updateRow.name = cleanName;
  }
  if (patch.sector !== undefined) {
    updateRow.sector = (patch.sector.trim() || "CONSUMER").toUpperCase();
  }
  if (patch.contactName !== undefined) {
    updateRow.contact_name = patch.contactName.trim();
  }
  if (patch.contactEmail !== undefined) {
    updateRow.contact_email = patch.contactEmail.trim();
  }
  if (patch.website !== undefined) {
    updateRow.website = patch.website.trim();
  }
  if (patch.notes !== undefined) {
    updateRow.notes = patch.notes.trim();
  }

  const { data, error } = await supabase
    .from("brands")
    .update(updateRow)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  const updated = mapBrandRow(data as BrandRow);

  // Sync brand name/sector on non-Paid deals so settled Paid deals remain untouched
  if (patch.name !== undefined || patch.sector !== undefined) {
    await supabase
      .from("deals")
      .update({
        brand_name: updated.name,
        brand_sector: updated.sector,
      })
      .eq("brand_id", id)
      .neq("status", "Paid");
  }

  return updated;
}

export async function deleteBrand(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: paidDeals, error: checkErr } = await supabase
    .from("deals")
    .select("id")
    .eq("brand_id", id)
    .eq("status", "Paid")
    .limit(1);

  if (checkErr) {
    if (checkErr.code === "22P02") return false;
    throw new Error(checkErr.message);
  }
  if (paidDeals && paidDeals.length > 0) {
    throw new Error("Cannot delete a brand that has Paid deals.");
  }

  const { data, error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "22P02") return false;
    throw new Error(error.message);
  }
  return Boolean(data && data.length > 0);
}

export async function listDeals(filters?: DealFilters): Promise<DealDTO[]> {
  const supabase = getSupabaseClient();
  const creators = await listCreators();
  const creatorMap = new Map(creators.map((c) => [c.id, c]));

  let query = supabase
    .from("deals")
    .select("*")
    .order("updated_at", { ascending: false });

  if (filters?.status && filters.status !== "All") {
    query = query.eq("status", filters.status);
  }
  if (filters?.creatorId && filters.creatorId !== "All") {
    query = query.eq("creator_id", filters.creatorId);
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === "22P02") return [];
    throw new Error(error.message);
  }

  let deals = ((data || []) as DealRow[]).map((d) =>
    mapDealRow(d, creatorMap.get(d.creator_id)?.name)
  );

  if (filters?.niche && filters.niche !== "All") {
    deals = deals.filter(
      (d) =>
        creatorMap.get(d.creatorId)?.niche.toLowerCase() ===
        filters.niche!.toLowerCase()
    );
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    deals = deals.filter((d) => {
      const creator = creatorMap.get(d.creatorId);
      return (
        d.brandName.toLowerCase().includes(q) ||
        d.brandSector.toLowerCase().includes(q) ||
        d.campaignTitle.toLowerCase().includes(q) ||
        d.deliverables.toLowerCase().includes(q) ||
        (creator?.name.toLowerCase().includes(q) ?? false) ||
        (creator?.niche.toLowerCase().includes(q) ?? false)
      );
    });
  }

  return deals;
}

export async function getDealById(id: string): Promise<DealDTO | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  const dealRow = data as DealRow;
  const creator = await getCreatorById(dealRow.creator_id);
  return mapDealRow(dealRow, creator?.name);
}

export async function createDeal(input: CreateDealInput): Promise<DealDTO> {
  const supabase = getSupabaseClient();
  const creator = await getCreatorById(input.creatorId);
  if (!creator) {
    throw new Error("Creator not found. Please register the creator first.");
  }

  let brandRecord: BrandDTO | null = null;
  if (input.brandId) {
    brandRecord = await getBrandById(input.brandId);
  }
  if (!brandRecord && input.brandName.trim()) {
    brandRecord = await findBrandByName(input.brandName);
  }
  if (!brandRecord) {
    throw new Error(
      `Brand "${input.brandName.trim()}" is not registered. Please register the brand first before creating a deal.`
    );
  }

  const resolvedBrandId = brandRecord.id;
  const resolvedBrandName = brandRecord.name;
  const resolvedSector =
    input.brandSector?.trim().toUpperCase() || brandRecord.sector || "COLLAB";

  const nowIso = new Date().toISOString();
  const status = input.status || "Pending";
  const confirmedAt =
    status === "Confirmed" || status === "Paid" ? nowIso : null;
  const paidAt = status === "Paid" ? nowIso : null;

  const { data, error } = await supabase
    .from("deals")
    .insert({
      creator_id: input.creatorId,
      brand_id: resolvedBrandId,
      brand_name: resolvedBrandName,
      brand_sector: resolvedSector,
      campaign_title:
        input.campaignTitle?.trim() || `${input.brandName.trim()} Collaboration`,
      deliverables: input.deliverables?.trim() || "1 IG Reel + 2 Stories",
      deal_value: Number(input.dealValue),
      agency_fee_pct: input.agencyFeePct ?? 15,
      status,
      due_date: input.dueDate || "",
      notes: input.notes?.trim() || "",
      last_automated_status:
        status === "Confirmed" || status === "Paid" ? status : null,
      confirmed_at: confirmedAt,
      paid_at: paidAt,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapDealRow(data as DealRow, creator.name);
}

export async function updateDeal(
  id: string,
  patch: Partial<CreateDealInput> & { lastAutomatedStatus?: DealStatus | null }
): Promise<{ previous: DealDTO; updated: DealDTO } | null> {
  const supabase = getSupabaseClient();
  const { data: existingData, error: findErr } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (findErr) {
    if (findErr.code === "22P02") return null;
    throw new Error(findErr.message);
  }
  if (!existingData) return null;

  const existing = existingData as DealRow;
  const creator = await getCreatorById(patch.creatorId || existing.creator_id);
  const previous = mapDealRow(existing, creator?.name);

  const definedKeys = Object.keys(patch).filter(
    (k) => patch[k as keyof typeof patch] !== undefined
  );
  const isAutomationStampOnly =
    definedKeys.length === 1 && definedKeys[0] === "lastAutomatedStatus";

  const nextStatus = patch.status ?? existing.status;
  if (existing.status === "Paid" && !isAutomationStampOnly) {
    throw new Error("Paid deals cannot be edited or have their status changed.");
  }

  const updateRow: Record<string, unknown> = {};
  if (patch.creatorId !== undefined) {
    const targetCreator = await getCreatorById(patch.creatorId);
    if (!targetCreator) {
      throw new Error("Creator not found. Please register the creator first.");
    }
    updateRow.creator_id = targetCreator.id;
  }
  if (patch.brandId !== undefined || patch.brandName !== undefined) {
    let brandRecord: BrandDTO | null = null;
    if (patch.brandId) {
      brandRecord = await getBrandById(patch.brandId);
    }
    if (!brandRecord && patch.brandName?.trim()) {
      brandRecord = await findBrandByName(patch.brandName);
    }
    if (!brandRecord) {
      throw new Error(
        `Brand "${patch.brandName?.trim() || ""}" is not registered.`
      );
    }
    updateRow.brand_id = brandRecord.id;
    updateRow.brand_name = brandRecord.name;
    updateRow.brand_sector =
      patch.brandSector?.trim().toUpperCase() || brandRecord.sector || "COLLAB";
  } else if (patch.brandSector !== undefined) {
    updateRow.brand_sector = patch.brandSector.trim().toUpperCase();
  }
  if (patch.campaignTitle !== undefined)
    updateRow.campaign_title = patch.campaignTitle.trim();
  if (patch.deliverables !== undefined)
    updateRow.deliverables = patch.deliverables.trim();
  if (patch.dealValue !== undefined)
    updateRow.deal_value = Number(patch.dealValue);
  if (patch.agencyFeePct !== undefined)
    updateRow.agency_fee_pct = Number(patch.agencyFeePct);
  if (patch.status !== undefined) updateRow.status = patch.status;
  if (patch.dueDate !== undefined) updateRow.due_date = patch.dueDate;
  if (patch.notes !== undefined) updateRow.notes = patch.notes.trim();
  if (patch.lastAutomatedStatus !== undefined)
    updateRow.last_automated_status = patch.lastAutomatedStatus;

  const nowIso = new Date().toISOString();
  if (nextStatus === "Confirmed" && !existing.confirmed_at) {
    updateRow.confirmed_at = nowIso;
  }
  if (nextStatus === "Paid") {
    if (!existing.confirmed_at) updateRow.confirmed_at = nowIso;
    if (!existing.paid_at) updateRow.paid_at = nowIso;
  }

  const { data: updatedData, error: updErr } = await supabase
    .from("deals")
    .update(updateRow)
    .eq("id", id)
    .select("*")
    .single();

  if (updErr) throw new Error(updErr.message);

  return {
    previous,
    updated: mapDealRow(updatedData as DealRow, creator?.name),
  };
}

export async function deleteDeal(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const existing = await getDealById(id);
  if (!existing) return false;
  if (existing.status === "Paid") {
    throw new Error("Paid deals cannot be deleted.");
  }

  const { data, error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "22P02") return false;
    throw new Error(error.message);
  }
  return Boolean(data && data.length > 0);
}

export async function getAutomationConfig(): Promise<AutomationConfigDTO> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("automation_configs")
    .select("*")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return mapConfigRow(data as AutomationConfigRow);

  const { data: created, error: insertErr } = await supabase
    .from("automation_configs")
    .insert({
      singleton_key: "default",
      manager_email:
        process.env.TALENT_MANAGER_EMAIL || "talent-ops@creatorsmela.com",
    })
    .select("*")
    .single();

  if (insertErr) throw new Error(insertErr.message);
  return mapConfigRow(created as AutomationConfigRow);
}

export async function updateAutomationConfig(
  patch: Partial<Omit<AutomationConfigDTO, "id" | "updatedAt">>
): Promise<AutomationConfigDTO> {
  const supabase = getSupabaseClient();
  const current = await getAutomationConfig();

  const updateRow: Record<string, unknown> = {
    singleton_key: "default",
    trigger_on_confirmed:
      patch.triggerOnConfirmed ?? current.triggerOnConfirmed,
    trigger_on_paid: patch.triggerOnPaid ?? current.triggerOnPaid,
    channel_slack: patch.channels?.slack ?? current.channels.slack,
    channel_sheets: patch.channels?.sheets ?? current.channels.sheets,
    channel_email: patch.channels?.email ?? current.channels.email,
    channel_webhook: false,
    slack_webhook_url: patch.slackWebhookUrl ?? current.slackWebhookUrl,
    sheets_webhook_url: patch.sheetsWebhookUrl ?? current.sheetsWebhookUrl,
    manager_email: patch.managerEmail ?? current.managerEmail,
  };

  const { data, error } = await supabase
    .from("automation_configs")
    .upsert(updateRow, { onConflict: "singleton_key" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapConfigRow(data as AutomationConfigRow);
}

export async function listAutomationLogs(limit = 60): Promise<AutomationLogDTO[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("automation_logs")
    .select("*")
    .order("triggered_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return ((data || []) as AutomationLogRow[]).map(mapLogRow);
}

export async function appendAutomationLogs(
  logs: Omit<AutomationLogDTO, "id">[]
): Promise<AutomationLogDTO[]> {
  if (logs.length === 0) return [];
  const supabase = getSupabaseClient();

  const rowsToInsert = logs.map((l) => ({
    deal_id: l.dealId,
    creator_id: l.creatorId,
    creator_name: l.creatorName,
    brand_name: l.brandName,
    deal_value: l.dealValue,
    previous_status: l.previousStatus,
    new_status: l.newStatus,
    channel: l.channel,
    mode: l.mode,
    status: l.status,
    http_status: l.httpStatus,
    latency_ms: l.latencyMs,
    idempotency_key: l.idempotencyKey,
    summary: l.summary,
    payload: l.payload,
    response_body: l.responseBody || "",
    triggered_at: l.triggeredAt,
  }));

  const { data, error } = await supabase
    .from("automation_logs")
    .insert(rowsToInsert)
    .select("*");

  if (error) throw new Error(error.message);
  return ((data || []) as AutomationLogRow[]).map(mapLogRow);
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const [creators, brands, deals, automationConfig, automationLogs] =
    await Promise.all([
      listCreators(),
      listBrands(),
      listDeals(),
      getAutomationConfig(),
      listAutomationLogs(60),
    ]);

  const dealsByCreator = new Map<string, DealDTO[]>();
  for (const deal of deals) {
    const arr = dealsByCreator.get(deal.creatorId) ?? [];
    arr.push(deal);
    dealsByCreator.set(deal.creatorId, arr);
  }

  const creatorsWithDeals: CreatorWithDealsDTO[] = creators.map((c) => {
    const cDeals = dealsByCreator.get(c.id) ?? [];
    const totalPipelineValue = cDeals.reduce((acc, d) => acc + d.dealValue, 0);
    const confirmedOrPaidValue = cDeals
      .filter((d) => d.status === "Confirmed" || d.status === "Paid")
      .reduce((acc, d) => acc + d.dealValue, 0);
    const paidValue = cDeals
      .filter((d) => d.status === "Paid")
      .reduce((acc, d) => acc + d.dealValue, 0);
    return {
      ...c,
      deals: cDeals,
      totalPipelineValue,
      confirmedOrPaidValue,
      paidValue,
    };
  });

  const brandsWithStats: BrandWithStatsDTO[] = brands.map((b) => {
    const bDeals = deals.filter(
      (d) =>
        d.brandId === b.id ||
        d.brandName.toLowerCase() === b.name.toLowerCase()
    );
    const totalPipelineValue = bDeals.reduce((acc, d) => acc + d.dealValue, 0);
    const confirmedOrPaidValue = bDeals
      .filter((d) => d.status === "Confirmed" || d.status === "Paid")
      .reduce((acc, d) => acc + d.dealValue, 0);
    return {
      ...b,
      dealsCount: bDeals.length,
      totalPipelineValue,
      confirmedOrPaidValue,
    };
  });

  const pendingDeals = deals.filter((d) => d.status === "Pending");
  const confirmedDeals = deals.filter((d) => d.status === "Confirmed");
  const paidDeals = deals.filter((d) => d.status === "Paid");
  const activeClosedDeals = [...confirmedDeals, ...paidDeals];

  const pendingValue = pendingDeals.reduce((s, d) => s + d.dealValue, 0);
  const confirmedValue = confirmedDeals.reduce((s, d) => s + d.dealValue, 0);
  const paidValue = paidDeals.reduce((s, d) => s + d.dealValue, 0);
  const totalPipelineValue = pendingValue + confirmedValue + paidValue;

  const agencyCommissionConfirmedAndPaid = activeClosedDeals.reduce(
    (s, d) => s + Math.round((d.dealValue * (d.agencyFeePct ?? 15)) / 100),
    0
  );
  const netCreatorPayoutConfirmedAndPaid =
    confirmedValue + paidValue - agencyCommissionConfirmedAndPaid;

  const conversionRate =
    deals.length > 0
      ? Math.round((activeClosedDeals.length / deals.length) * 100)
      : 0;

  const metrics: DashboardMetrics = {
    totalPipelineValue,
    pendingValue,
    confirmedValue,
    paidValue,
    agencyCommissionConfirmedAndPaid,
    netCreatorPayoutConfirmedAndPaid,
    totalCreators: creators.length,
    totalDeals: deals.length,
    pendingCount: pendingDeals.length,
    confirmedCount: confirmedDeals.length,
    paidCount: paidDeals.length,
    conversionRate,
    automationsFiredCount: automationLogs.length,
  };

  return {
    storageMode: getStorageMode(),
    creators: creatorsWithDeals,
    brands: brandsWithStats,
    deals,
    metrics,
    automationConfig,
    automationLogs,
  };
}

/**
 * Deletes all creator, brand, deal, and notification log records from Supabase PostgreSQL.
 */
export async function clearDatabaseData(): Promise<{ cleared: boolean }> {
  const supabase = getSupabaseClient();
  const wipeTargets = [
    { table: "automation_logs", col: "id" },
    { table: "deals", col: "id" },
    { table: "brands", col: "id" },
    { table: "creators", col: "id" },
  ] as const;

  for (const target of wipeTargets) {
    const { error: wipeErr } = await supabase
      .from(target.table)
      .delete()
      .not(target.col, "is", null);
    if (wipeErr) {
      throw new Error(`Failed to clear ${target.table}: ${wipeErr.message}`);
    }
  }

  return { cleared: true };
}

export async function seedCreatorsMelaData(force = true): Promise<{
  seeded: boolean;
  creatorsCreated: number;
  brandsCreated: number;
  dealsCreated: number;
}> {
  const supabase = getSupabaseClient();
  if (!force) {
    const existing = await listCreators();
    if (existing.length > 0) {
      return {
        seeded: false,
        creatorsCreated: 0,
        brandsCreated: 0,
        dealsCreated: 0,
      };
    }
  }

  // Delete all existing rows across every data table in dependency order
  await clearDatabaseData();

  const { data: insertedCreators, error: creatorSeedErr } = await supabase
    .from("creators")
    .insert(
      SEED_CREATORS.map((c) => ({
        name: c.name.trim(),
        handle: c.handle.trim(),
        platform: c.platform,
        niche: c.niche.trim(),
        follower_count: c.followerCount,
        engagement_rate: c.engagementRate,
        base_rate: c.baseRate,
        email: c.email.trim(),
        manager_name: c.managerName.trim(),
        tier: c.tier,
      }))
    )
    .select("*");
  if (creatorSeedErr) {
    throw new Error(`Failed to seed creators: ${creatorSeedErr.message}`);
  }

  const creatorIdByName = new Map<string, string>();
  for (const row of (insertedCreators || []) as CreatorRow[]) {
    creatorIdByName.set(row.name, row.id);
  }

  const { data: insertedBrands, error: brandSeedErr } = await supabase
    .from("brands")
    .insert(
      SEED_BRANDS.map((b) => ({
        name: b.name.trim(),
        sector: b.sector.trim().toUpperCase(),
        contact_name: b.contactName.trim(),
        contact_email: b.contactEmail.trim(),
        website: b.website.trim(),
        notes: b.notes.trim(),
      }))
    )
    .select("*");
  if (brandSeedErr) {
    throw new Error(`Failed to seed brands: ${brandSeedErr.message}`);
  }

  const brandIdByName = new Map<string, string>();
  for (const row of (insertedBrands || []) as BrandRow[]) {
    brandIdByName.set(row.name.toLowerCase(), row.id);
  }

  const nowIso = new Date().toISOString();
  const seedDeals = buildSeedDeals();
  const dealInsertRows = seedDeals
    .map((d) => {
      const creatorId = creatorIdByName.get(d.creatorName);
      const brandId = brandIdByName.get(d.brandName.toLowerCase());
      if (!creatorId || !brandId) return null;
      const isClosed = d.status === "Confirmed" || d.status === "Paid";
      return {
        creator_id: creatorId,
        brand_id: brandId,
        brand_name: d.brandName.trim(),
        brand_sector: d.brandSector.trim().toUpperCase(),
        campaign_title: d.campaignTitle.trim(),
        deliverables: d.deliverables.trim(),
        deal_value: d.dealValue,
        agency_fee_pct: d.agencyFeePct,
        status: d.status,
        due_date: d.dueDate,
        notes: d.notes.trim(),
        last_automated_status: isClosed ? d.status : null,
        confirmed_at: isClosed ? nowIso : null,
        paid_at: d.status === "Paid" ? nowIso : null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const { data: insertedDeals, error: dealSeedErr } = await supabase
    .from("deals")
    .insert(dealInsertRows)
    .select("*");
  if (dealSeedErr) {
    throw new Error(`Failed to seed deals: ${dealSeedErr.message}`);
  }

  const seededDeals = (insertedDeals || []) as DealRow[];
  const creatorNameById = new Map<string, string>(
    [...creatorIdByName.entries()].map(([name, id]) => [id, name])
  );
  const seededLogs: Omit<AutomationLogDTO, "id">[] = seededDeals
    .filter((d) => d.status === "Confirmed" || d.status === "Paid")
    .map((deal) => {
      const creatorName = creatorNameById.get(deal.creator_id) || "Creator";
      return {
        dealId: deal.id,
        creatorId: deal.creator_id,
        creatorName,
        brandName: deal.brand_name,
        dealValue: Number(deal.deal_value),
        previousStatus: "Pending",
        newStatus: deal.status,
        channel: "slack",
        mode: "simulated",
        status: "delivered",
        httpStatus: 200,
        latencyMs: 118,
        idempotencyKey: `${deal.id}:Pending->${deal.status}:slack`,
        summary: `Slack #deals-ops alerted: ${creatorName} × ${deal.brand_name} moved to ${deal.status}`,
        payload: {
          channel: "#deals-ops",
          creator: creatorName,
          brand: deal.brand_name,
          valueINR: Number(deal.deal_value),
          status: deal.status,
        },
        responseBody: "ok",
        triggeredAt: deal.updated_at,
      };
    });

  await appendAutomationLogs(seededLogs);
  return {
    seeded: true,
    creatorsCreated: creatorIdByName.size,
    brandsCreated: brandIdByName.size,
    dealsCreated: seededDeals.length,
  };
}
