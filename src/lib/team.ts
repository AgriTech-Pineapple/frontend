import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────

/** org_admin | farm_manager | worker | drone_operator */
export type OrgRole = "org_admin" | "farm_manager" | "worker" | "drone_operator";

export const ORG_ROLES: OrgRole[] = ["org_admin", "farm_manager", "worker", "drone_operator"];

export const ORG_ROLE_LABEL: Record<OrgRole, string> = {
  org_admin: "Org Admin",
  farm_manager: "Farm Manager",
  worker: "Worker",
  drone_operator: "Drone Operator",
};

export type OrgMembership = {
  organizationId: string;
  organizationName: string;
  role: OrgRole;
};

export type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  /** org_admin | farm_manager | worker | drone_operator */
  orgRole: OrgRole;
  joinedAt: string;
};

export type FarmAssignment = { userId: string; farmId: string };

export type WorkerRecord = {
  id: string;
  workerRef: string;
  firstName: string;
  lastName: string;
  role: string;
  farmId: string | null;
  location: string;
  status: string;
  performancePct: number;
  phone: string;
};

// ── Org membership (gates the Users & Roles page) ───────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getMyOrgMemberships(): Promise<OrgMembership[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id, role, joined_at, organizations(name)")
    .eq("user_id", user.id)
    .order("joined_at");
  return (data ?? []).map((m: any) => ({
    organizationId: m.organization_id,
    organizationName: (m.organizations as any)?.name ?? "",
    role: m.role,
  }));
}

/** The first (oldest) membership — most users belong to exactly one org. */
export async function getMyOrgMembership(): Promise<OrgMembership | null> {
  const memberships = await getMyOrgMemberships();
  return memberships[0] ?? null;
}

/** Platform-admin flag + memberships for the signed-in user, in one call. */
export async function getMyAccess(): Promise<{
  isPlatformAdmin: boolean;
  memberships: OrgMembership[];
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isPlatformAdmin: false, memberships: [] };
  const [{ data: profile }, memberships] = await Promise.all([
    supabase.from("profiles").select("is_platform_admin").eq("id", user.id).single(),
    getMyOrgMemberships(),
  ]);
  return { isPlatformAdmin: !!profile?.is_platform_admin, memberships };
}

// ── Members ─────────────────────────────────────────────────────────────────

export async function getOrgMembers(organizationId: string): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("org_list_members", { org_id: organizationId });
  if (error) throw error;
  return (data ?? []).map((m: any) => ({
    id: m.id,
    email: m.email ?? "",
    firstName: m.first_name ?? "",
    lastName: m.last_name ?? "",
    displayName: m.display_name ?? "",
    phone: m.phone ?? "",
    orgRole: m.org_role ?? "",
    joinedAt: m.joined_at ?? "",
  }));
}

export async function getFarmManagerAssignments(farmIds: string[]): Promise<FarmAssignment[]> {
  if (farmIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("farm_managers")
    .select("user_id, farm_id")
    .in("farm_id", farmIds);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ userId: r.user_id, farmId: r.farm_id }));
}

export type AddOrgMemberInput = {
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: OrgRole;
  method: "email" | "link" | "password";
  password?: string;
  /** only used when role === "farm_manager" */
  scopeAllFarms: boolean;
  farmIds: string[];
};

/**
 * Creates a new member account via the `org-add-member` edge function, gated
 * on the caller being a platform admin or org_admin of organizationId
 * (checked server-side, not just in the UI).
 */
export async function addOrgMember(input: AddOrgMemberInput): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("org-add-member", {
    body: { ...input, redirectTo: `${window.location.origin}/auth/set-password` },
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

/** Change a member's org role. Guards (last org admin, etc.) run in the RPC. */
export async function setMemberRole(
  organizationId: string,
  userId: string,
  role: OrgRole
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("org_set_member_role", {
    org_id: organizationId,
    target_user: userId,
    new_role: role,
  });
  if (error) throw error;
}

export async function setMemberFarmScope(
  organizationId: string,
  userId: string,
  farmIds: string[]
): Promise<void> {
  const supabase = createClient();
  const { error: delError } = await supabase
    .from("farm_managers")
    .delete()
    .eq("user_id", userId)
    .in("farm_id", (await getOrgFarmIds(organizationId)));
  if (delError) throw delError;
  if (farmIds.length > 0) {
    const { error: insError } = await supabase
      .from("farm_managers")
      .insert(farmIds.map((farmId) => ({ farm_id: farmId, user_id: userId })));
    if (insError) throw insError;
  }
}

async function getOrgFarmIds(organizationId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("farms")
    .select("id")
    .eq("organization_id", organizationId);
  if (error) throw error;
  return (data ?? []).map((f: any) => f.id);
}

export async function removeMember(organizationId: string, targetUser: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("org_owner_remove_member", {
    target_user: targetUser,
    org_id: organizationId,
  });
  if (error) throw error;
}

// ── Workers (HR records — a login is optional, via org-add-member) ─────────

export async function getWorkers(organizationId: string): Promise<WorkerRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((w: any) => ({
    id: w.id,
    workerRef: w.worker_ref,
    firstName: w.first_name,
    lastName: w.last_name,
    role: w.role,
    farmId: w.farm_id,
    location: w.location,
    status: w.status,
    performancePct: w.performance_pct,
    phone: w.phone,
  }));
}

export type AddWorkerInput = {
  organizationId: string;
  farmId: string | null;
  firstName: string;
  lastName: string;
  role: string;
  location: string;
  phone: string;
};

export async function addWorker(input: AddWorkerInput): Promise<void> {
  const supabase = createClient();
  const workerRef = `WK-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const { error } = await supabase.from("workers").insert({
    organization_id: input.organizationId,
    farm_id: input.farmId,
    worker_ref: workerRef,
    first_name: input.firstName,
    last_name: input.lastName,
    role: input.role,
    location: input.location,
    status: "on_duty",
    performance_pct: 0,
    phone: input.phone,
  });
  if (error) throw error;
}

export async function removeWorker(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("workers").delete().eq("id", id);
  if (error) throw error;
}
