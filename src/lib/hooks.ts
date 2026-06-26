"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFarm, deleteFarm, getFarms, getProfile, updateFarm } from "@/lib/db";
import type { Farm, FarmMeta } from "@/lib/db";

export type { Farm, FarmMeta, Profile } from "@/lib/db";

// ── Profile ───────────────────────────────────────────────────────────────

export function useProfile() {
  const { data: profile = null, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  return { profile, loading: isLoading };
}

// ── Farms list ────────────────────────────────────────────────────────────

export function useFarms() {
  const qc = useQueryClient();
  const { data: managedFarms = [], isLoading: loading } = useQuery({
    queryKey: ["farms"],
    queryFn: getFarms,
  });

  const addMutation = useMutation({
    mutationFn: (input: Omit<FarmMeta, "id">) => createFarm(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farms"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<FarmMeta> }) =>
      updateFarm(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farms"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFarm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farms"] }),
  });

  return {
    managedFarms,
    loading,
    addFarm:    (input: Omit<FarmMeta, "id">) => addMutation.mutateAsync(input),
    updateFarm: (f: FarmMeta) => updateMutation.mutateAsync({ id: f.id, input: f }),
    deleteFarm: (id: string)  => deleteMutation.mutateAsync(id),
  };
}

// ── Selected farm ─────────────────────────────────────────────────────────

const EMPTY_FARM: Farm = {
  id: "", name: "", subtitle: "", crop: "", estateType: "", region: "",
  established: "", area: "", blocks: 0, sectors: 0, plants: "", density: "",
  healthyPct: "", ndvi: "", yieldForecast: "", yieldDelta: "", totalTonnage: "",
  revenue: "", harvestWindow: "", confidence: "", soil: "", elevation: "",
  climate: "", irrigation: "", manager: "", coords: "", accent: "sage", mapLabel: "",
  blockRows: [], yearlyYield: [], monthlyBand: [], densityByBlock: [], canopy: [],
  variance: [], indexTrend: [], history: [], captures: [], recommendations: [],
  alerts: [], interpretation: [],
  kpis: {
    plants:  { total: "—", avgDensity: "—", missing: "—" },
    health:  { healthyPct: "—", mild: "—", severe: "—", ndvi: "—", ndviDelta: "—" },
    growth:  { canopy: "—", uniformity: "—", variance: "—", stage: "—", canopyDelta: "—" },
    history: { captures12mo: "—", ndviDelta: "—", yieldDelta: "—", stress: "—" },
  },
};

export function useFarm() {
  const { managedFarms, loading } = useFarms();

  const [farmId, setFarmIdState] = useState<string>(() => {
    try { return localStorage.getItem("agritech.farm") ?? ""; } catch { return ""; }
  });

  const setFarmId = useCallback((id: string) => {
    setFarmIdState(id);
    try { localStorage.setItem("agritech.farm", id); } catch {}
  }, []);

  // Auto-select first farm if nothing stored
  useEffect(() => {
    if (farmId || managedFarms.length === 0) return;
    setFarmId(managedFarms[0].id);
  }, [managedFarms, farmId, setFarmId]);

  // Re-validate stored ID (farm may have been deleted)
  useEffect(() => {
    if (!farmId || managedFarms.length === 0) return;
    if (!managedFarms.some(f => f.id === farmId)) setFarmId(managedFarms[0].id);
  }, [managedFarms, farmId, setFarmId]);

  const farm: Farm =
    managedFarms.find(f => f.id === farmId) ?? managedFarms[0] ?? EMPTY_FARM;

  return { farmId, setFarmId, farm, loading };
}

// ── Utilities ─────────────────────────────────────────────────────────────

export function farmImage(_id: string, crop: string): string {
  return crop === "Oil Palm" ? "/farm-oilpalm.jpg" : "/farm-pineapple.jpg";
}
