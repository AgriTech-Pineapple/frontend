import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────

export type ServiceRequestStatus = "pending" | "contacted" | "approved" | "rejected";

export type ServiceRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ServiceRequestStatus;
  notes: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  userType: string;
  createdAt: string;
  lastSignInAt: string | null;
};

export type Role = {
  id: string;
  label: string;
  description: string;
};

export type AdminStats = {
  pendingRequests: number;
  totalRequests: number;
  users: number;
  farms: number;
  organizations: number;
  openAlerts: number;
};

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  crops: string[];
  country: string;
  totalArea: string;
  contactEmail: string;
  logoUrl: string;
  farmCount: number;
};

export type OrgFarmSummary = {
  id: string;
  name: string;
  subtitle: string;
  crop: string;
  region: string;
  area: string;
  blocks: number;
  sectors: number;
  plants: string;
  healthyPct: string;
  accent: "sage" | "olive" | "harvest";
};

// ── Service requests ──────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToRequest(r: any): ServiceRequest {
  return {
    id: r.id,
    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    status: r.status ?? "pending",
    notes: r.notes ?? "",
    createdAt: r.created_at ?? "",
  };
}

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToRequest);
}

export async function updateServiceRequest(
  id: string,
  input: { status?: ServiceRequestStatus; notes?: string }
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("service_requests")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export type InviteLink = {
  /** invite URL for new accounts, one-time sign-in URL for existing ones */
  link: string;
  /** true when the email already had an account (link is a sign-in magic link) */
  alreadyRegistered: boolean;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
async function invokeInviteFunction(
  requestId: string,
  mode: "email" | "link"
): Promise<any> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("invite-user", {
    body: {
      requestId,
      mode,
      redirectTo: `${window.location.origin}/auth/set-password`,
    },
  });
  if (error) {
    // FunctionsHttpError carries the function's JSON body in context
    let message = error.message;
    try {
      const body = await (error as { context?: Response }).context?.json();
      if (body?.error) message = body.error;
    } catch {
      // fall back to the generic message
    }
    throw new Error(message);
  }
  return data;
}

/**
 * Approve a request and send a Supabase invite email via the `invite-user`
 * edge function (runs with the service role; caller must be an admin).
 * Returns true if an invite was sent, false if the email already has an account.
 */
export async function approveAndInvite(requestId: string): Promise<boolean> {
  const data = await invokeInviteFunction(requestId, "email");
  return !data?.alreadyRegistered;
}

/**
 * Approve a request and get an invite link WITHOUT sending an email — no
 * mail rate limits apply. The admin shares the link through their own channel.
 * For emails that already have an account, returns a one-time sign-in link.
 */
export async function approveAndGetLink(requestId: string): Promise<InviteLink> {
  const data = await invokeInviteFunction(requestId, "link");
  if (!data?.link) {
    throw new Error("No invite link returned — try again.");
  }
  return { link: data.link, alreadyRegistered: !!data.alreadyRegistered };
}

export async function deleteServiceRequest(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("service_requests").delete().eq("id", id);
  if (error) throw error;
}

// ── Users & roles ─────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) throw error;
  return (data ?? []).map((u: any) => ({
    id: u.id,
    email: u.email ?? "",
    firstName: u.first_name ?? "",
    lastName: u.last_name ?? "",
    displayName: u.display_name ?? "",
    phone: u.phone ?? "",
    userType: u.user_type ?? "",
    createdAt: u.created_at ?? "",
    lastSignInAt: u.last_sign_in_at ?? null,
  }));
}

export async function getRoles(): Promise<Role[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("user_roles").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    label: r.label ?? r.id,
    description: r.description ?? "",
  }));
}

export async function updateUserRole(userId: string, userType: string): Promise<void> {
  const supabase = createClient();
  // RPC rather than a direct profiles update: RLS only lets admins edit
  // org-mates, while platform admins manage everyone
  const { error } = await supabase.rpc("admin_set_user_role", {
    target_user: userId,
    new_role: userType,
  });
  if (error) throw error;
}

export type RegisterUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: string;
  /** email: send invite mail · link: return invite URL · password: create ready-to-use account */
  method: "email" | "link" | "password";
  password?: string;
};

/**
 * Create an account directly from the admin console via the `register-user`
 * edge function. Returns the invite link when method is "link", else null.
 */
export async function registerUser(input: RegisterUserInput): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("register-user", {
    body: {
      ...input,
      redirectTo: `${window.location.origin}/auth/set-password`,
    },
  });
  if (error) {
    let message = error.message;
    try {
      const body = await (error as { context?: Response }).context?.json();
      if (body?.error) message = body.error;
    } catch {
      // fall back to the generic message
    }
    throw new Error(message);
  }
  return data?.link ?? null;
}

// ── Overview stats ────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createClient();

  const count = (table: string) =>
    supabase.from(table).select("*", { count: "exact", head: true });

  const [pending, requests, users, farms, orgs, alerts] = await Promise.all([
    count("service_requests").eq("status", "pending"),
    count("service_requests"),
    // profiles is RLS-scoped to org-mates; the admin RPC sees all users
    supabase.rpc("admin_list_users"),
    count("farms"),
    count("organizations"),
    count("alerts").eq("is_resolved", false),
  ]);

  return {
    pendingRequests: pending.count ?? 0,
    totalRequests: requests.count ?? 0,
    users: users.data?.length ?? 0,
    farms: farms.count ?? 0,
    organizations: orgs.count ?? 0,
    openAlerts: alerts.count ?? 0,
  };
}

// ── Organizations & their farms ───────────────────────────────────────────

export async function getAdminOrganizations(): Promise<AdminOrganization[]> {
  const supabase = createClient();
  const [{ data: orgs, error: orgsError }, { data: farms, error: farmsError }] =
    await Promise.all([
      supabase.from("organizations").select("*").order("name"),
      supabase.from("farms").select("organization_id"),
    ]);
  if (orgsError) throw orgsError;
  if (farmsError) throw farmsError;

  const farmCounts = new Map<string, number>();
  for (const f of farms ?? []) {
    farmCounts.set(f.organization_id, (farmCounts.get(f.organization_id) ?? 0) + 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (orgs ?? []).map((o: any) => ({
    id: o.id,
    name: o.name ?? "",
    slug: o.slug ?? "",
    crops: o.crops ?? [],
    country: o.country ?? "",
    totalArea: o.total_area ?? "",
    contactEmail: o.contact_email ?? "",
    logoUrl: o.logo_url ?? "",
    farmCount: farmCounts.get(o.id) ?? 0,
  }));
}

export async function getAdminOrganization(id: string): Promise<AdminOrganization | null> {
  const supabase = createClient();
  const { data: o, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !o) return null;
  const { count } = await supabase
    .from("farms")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", id);
  return {
    id: o.id,
    name: o.name ?? "",
    slug: o.slug ?? "",
    crops: o.crops ?? [],
    country: o.country ?? "",
    totalArea: o.total_area ?? "",
    contactEmail: o.contact_email ?? "",
    logoUrl: o.logo_url ?? "",
    farmCount: count ?? 0,
  };
}

export async function getOrganizationFarms(orgId: string): Promise<OrgFarmSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("farms")
    .select("id, name, subtitle, crop, region, area, blocks, sectors, plants, healthy_pct, accent")
    .eq("organization_id", orgId)
    .order("created_at");
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((f: any) => ({
    id: f.id,
    name: f.name ?? "",
    subtitle: f.subtitle ?? "",
    crop: f.crop ?? "",
    region: f.region ?? "",
    area: f.area ?? "",
    blocks: f.blocks ?? 0,
    sectors: f.sectors ?? 0,
    plants: f.plants ?? "",
    healthyPct: f.healthy_pct ?? "",
    accent: f.accent ?? "sage",
  }));
}
