"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyAccess, type OrgMembership, type OrgRole } from "@/lib/team";

/**
 * The signed-in user's active organization. Mirrors the useFarm localStorage
 * pattern: persisted under "agritech.org", auto-selects the first membership.
 * Most users have exactly one org; the top-bar switcher only renders when
 * there are several.
 */
export function useActiveOrg(): {
  memberships: OrgMembership[];
  activeOrg: OrgMembership | null;
  orgRole: OrgRole | null;
  isPlatformAdmin: boolean;
  setActiveOrgId: (id: string) => void;
  loading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["my-access"],
    queryFn: getMyAccess,
  });

  const [orgId, setOrgIdState] = useState<string>(() => {
    try { return localStorage.getItem("agritech.org") ?? ""; } catch { return ""; }
  });

  const setActiveOrgId = useCallback((id: string) => {
    setOrgIdState(id);
    try { localStorage.setItem("agritech.org", id); } catch {}
  }, []);

  const memberships = data?.memberships ?? [];

  // Auto-select the first org if nothing stored (or the stored org is gone)
  useEffect(() => {
    if (memberships.length === 0) return;
    if (!memberships.some((m) => m.organizationId === orgId)) {
      setActiveOrgId(memberships[0].organizationId);
    }
  }, [memberships, orgId, setActiveOrgId]);

  const activeOrg = memberships.find((m) => m.organizationId === orgId) ?? memberships[0] ?? null;

  return {
    memberships,
    activeOrg,
    orgRole: activeOrg?.role ?? null,
    isPlatformAdmin: data?.isPlatformAdmin ?? false,
    setActiveOrgId,
    loading: isLoading,
  };
}
