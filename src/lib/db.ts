import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────

export type Farm = {
  id: string;
  name: string;
  subtitle: string;
  crop: string;
  estateType: string;
  region: string;
  established: string;
  area: string;
  blocks: number;
  sectors: number;
  plants: string;
  density: string;
  healthyPct: string;
  ndvi: string;
  yieldForecast: string;
  yieldDelta: string;
  totalTonnage: string;
  revenue: string;
  harvestWindow: string;
  confidence: string;
  soil: string;
  elevation: string;
  climate: string;
  irrigation: string;
  manager: string;
  coords: string;
  accent: "sage" | "olive" | "harvest";
  mapLabel: string;
  blockRows:       { id: string; area: number; plants: number; rows: number; density: number; meanCanopy: number; totalCanopy: number; centroidX: number; centroidY: number; ndvi: number; biomassTonnes: number; healthyCount: number; mildCount: number; severeCount: number }[];
  yearlyYield:     { year: string; expected: number; actual: number | null; crop: string }[];
  monthlyBand:     { m: string; low: number; mid: number; high: number }[];
  densityByBlock:  { block: string; density: number }[];
  canopy:          { date: string; pct: number }[];
  variance:        { sector: string; cv: number }[];
  indexTrend:      { d: string; NDVI: number; NDRE: number; SAVI: number }[];
  history:         { m: string; NDVI: number; NDRE: number; SAVI: number; Yield: number }[];
  captures:        { mission: string; date: string; pilot: string; drone: string; coverage: string; gsd: string }[];
  recommendations: { title: string; reason: string }[];
  alerts:          { level: "Critical" | "High" | "Medium" | "Low"; title: string; ago: string }[];
  interpretation:  { heading: string; body: string }[];
  kpis: {
    plants:  { total: string; avgDensity: string; missing: string; medianSpacing: string; meanSpacing: string };
    health:  { healthyPct: string; mild: string; severe: string; ndvi: string; ndviDelta: string };
    growth:  { canopy: string; uniformity: string; variance: string; stage: string; canopyDelta: string; meanCanopyPerPlant: string; medianCanopyPerPlant: string };
    history: { captures12mo: string; ndviDelta: string; yieldDelta: string; stress: string };
  };
};

export type FarmMeta = Pick<Farm,
  "id" | "name" | "subtitle" | "crop" | "estateType" | "region" |
  "established" | "area" | "blocks" | "sectors" | "plants" | "density" |
  "healthyPct" | "ndvi" | "yieldForecast" | "yieldDelta" | "totalTonnage" |
  "revenue" | "harvestWindow" | "confidence" | "soil" | "elevation" |
  "climate" | "irrigation" | "manager" | "coords" | "accent" | "mapLabel"
>;

export type Profile = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  avatarUrl: string;
};

// ── Internal helpers ──────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

const EMPTY_KPI: Farm["kpis"] = {
  plants:  { total: "—", avgDensity: "—", missing: "—", medianSpacing: "—", meanSpacing: "—" },
  health:  { healthyPct: "—", mild: "—", severe: "—", ndvi: "—", ndviDelta: "—" },
  growth:  { canopy: "—", uniformity: "—", variance: "—", stage: "—", canopyDelta: "—", meanCanopyPerPlant: "—", medianCanopyPerPlant: "—" },
  history: { captures12mo: "—", ndviDelta: "—", yieldDelta: "—", stress: "—" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToFarm(row: Record<string, any>): Farm {
  return {
    id:            row.id,
    name:          row.name           ?? "",
    subtitle:      row.subtitle       ?? "",
    crop:          row.crop           ?? "",
    estateType:    row.estate_type    ?? "",
    region:        row.region         ?? "",
    established:   row.established    ?? "",
    area:          row.area           ?? "",
    blocks:        row.blocks         ?? 0,
    sectors:       row.sectors        ?? 0,
    plants:        row.plants         ?? "",
    density:       row.density        ?? "",
    healthyPct:    row.healthy_pct    ?? "",
    ndvi:          row.ndvi           ?? "",
    yieldForecast: row.yield_forecast ?? "",
    yieldDelta:    row.yield_delta    ?? "",
    totalTonnage:  row.total_tonnage  ?? "",
    revenue:       row.revenue        ?? "",
    harvestWindow: row.harvest_window ?? "",
    confidence:    row.confidence     ?? "",
    soil:          row.soil           ?? "",
    elevation:     row.elevation      ?? "",
    climate:       row.climate        ?? "",
    irrigation:    row.irrigation     ?? "",
    manager:       row.manager        ?? "",
    coords:        row.coords         ?? "",
    accent:        row.accent         ?? "sage",
    mapLabel:      row.map_label      ?? "",
    blockRows:       row.block_rows       ?? [],
    yearlyYield:     row.yearly_yield     ?? [],
    monthlyBand:     row.monthly_band     ?? [],
    densityByBlock:  row.density_by_block ?? [],
    canopy:          row.canopy           ?? [],
    variance:        row.variance         ?? [],
    indexTrend:      row.index_trend      ?? [],
    history:         row.history          ?? [],
    captures:        row.captures         ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recommendations: (row.farm_recommendations ?? []).map((r: any) => ({
      title: r.title, reason: r.reason,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alerts: (row.farm_alerts ?? [])
      .filter((a: any) => !a.is_resolved)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((a: any) => ({
        level: a.level as "Critical" | "High" | "Medium" | "Low",
        title: a.title,
        ago:   timeAgo(a.created_at),
      })),
    interpretation: row.interpretation ?? [],
    kpis:           row.kpis           ?? EMPTY_KPI,
  };
}

function metaToRow(farm: Partial<FarmMeta>): Record<string, unknown> {
  const map: Record<string, unknown> = {
    name:           farm.name,
    subtitle:       farm.subtitle,
    crop:           farm.crop,
    estate_type:    farm.estateType,
    region:         farm.region,
    established:    farm.established,
    area:           farm.area,
    blocks:         farm.blocks,
    sectors:        farm.sectors,
    plants:         farm.plants,
    density:        farm.density,
    healthy_pct:    farm.healthyPct,
    ndvi:           farm.ndvi,
    yield_forecast: farm.yieldForecast,
    yield_delta:    farm.yieldDelta,
    total_tonnage:  farm.totalTonnage,
    revenue:        farm.revenue,
    harvest_window: farm.harvestWindow,
    confidence:     farm.confidence,
    soil:           farm.soil,
    elevation:      farm.elevation,
    climate:        farm.climate,
    irrigation:     farm.irrigation,
    manager:        farm.manager,
    coords:         farm.coords,
    accent:         farm.accent,
    map_label:      farm.mapLabel,
  };
  return Object.fromEntries(Object.entries(map).filter(([, v]) => v !== undefined));
}

// ── Select fragment ───────────────────────────────────────────────────────

const FARM_SELECT = `
  *,
  farm_recommendations ( id, title, reason, priority, status ),
  farm_alerts:alerts   ( id, level, title, body, created_at, is_resolved )
` as const;

// ── Query functions ───────────────────────────────────────────────────────

export async function getFarms(): Promise<Farm[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("farms")
    .select(FARM_SELECT)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map(rowToFarm);
}

export async function getFarm(id: string): Promise<Farm | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("farms")
    .select(FARM_SELECT)
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToFarm(data);
}

export async function createFarm(input: Omit<FarmMeta, "id">): Promise<Farm> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("farms")
    .insert({ ...metaToRow(input), user_id: user!.id })
    .select(FARM_SELECT)
    .single();
  if (error) throw error;
  return rowToFarm(data);
}

export async function updateFarm(id: string, input: Partial<FarmMeta>): Promise<Farm> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("farms")
    .update(metaToRow(input))
    .eq("id", id)
    .select(FARM_SELECT)
    .single();
  if (error) throw error;
  return rowToFarm(data);
}

export async function deleteFarm(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("farms").delete().eq("id", id);
  if (error) throw error;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!data) return null;
  return {
    id:          data.id,
    firstName:   data.first_name   ?? "",
    lastName:    data.last_name    ?? "",
    displayName: data.display_name ?? "",
    phone:       data.phone        ?? "",
    avatarUrl:   data.avatar_url   ?? "",
  };
}
