"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Plus, MousePointer, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFarm } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";

const TILER_BASE    = process.env.NEXT_PUBLIC_TILER_URL    ?? "http://localhost:3001";
const MODIFIER_BASE = process.env.NEXT_PUBLIC_MODIFIER_URL ?? "http://localhost:3002";

// Plant markers are only rendered at or above this zoom level.
// Below it every marker is removed and a hint is shown instead.
const MIN_ZOOM_FOR_MARKERS = 22;

let _counter = 0;
function uid() { return `__new_${++_counter}`; }

type EditablePlant = {
  id: string;
  lat: number;
  lng: number;
  plant_id:     string | null;
  sector_id:    number | null;
  sector_label: string | null;
  row_index:    number | null;
  col_index:    number | null;
  area_px:      number | null;
  pixel_x:      number | null;
  pixel_y:      number | null;
  // Health / ML fields (read-only in editor)
  is_noise:                    boolean | null;
  ndvi:                        number | null;
  ndvi_mean:                   number | null;
  ndvi_category:               string | null;
  predicted_growth_stage_name: string | null;
  predicted_yield_kg:          number | null;
  predicted_nitrogen_status:   string | null;
  ndre:                        number | null;
  ndre_category:               string | null;
  isNew?: boolean;
};

function getHealthColor(plant: EditablePlant): string {
  if (plant.is_noise) return "#94a3b8";
  switch (plant.ndvi_category) {
    case "Very Good Vegetation": return "#16a34a";
    case "Good Vegetation":      return "#22c55e";
    case "Moderate Vegetation":  return "#eab308";
    case "Sparse Vegetation":    return "#f97316";
    case "Bare / Stressed":      return "#ef4444";
    default:
      if (plant.ndvi != null) {
        if (plant.ndvi >= 0.5) return "#16a34a";
        if (plant.ndvi >= 0.3) return "#22c55e";
        if (plant.ndvi >= 0.1) return "#eab308";
        return "#ef4444";
      }
      return "#22c55e";
  }
}

type Mode       = "select" | "add" | "group-select";
type SaveStatus = "idle" | "saving" | "saved" | "error";

// amber = single selected, indigo = part of a group, health color = default
function makeDotIcon(L: any, singleSelected: boolean, groupSelected = false, defaultColor = "#22c55e") {
  const bg   = singleSelected ? "#f59e0b" : groupSelected ? "#6366f1" : defaultColor;
  const size = (singleSelected || groupSelected) ? 11 : 8;
  const ring = singleSelected
    ? "rgba(245,158,11,0.4)"
    : groupSelected
    ? "rgba(99,102,241,0.35)"
    : `${defaultColor}55`;
  const cursor = (singleSelected || groupSelected) ? "grab" : "pointer";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid #fff;box-shadow:0 0 0 3px ${ring};cursor:${cursor};"></div>`,
    iconSize:   [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  });
}

export function PlantEditorOverlay({
  onClose,
  onSaved,
  tileLayer,
  initialView,
}: {
  onClose: () => void;
  /** Called after each successful save so the parent map can refresh its plant markers. */
  onSaved?: () => void;
  /** Named tiler layer (e.g. "ndvi"). Omit for the base orthomosaic. */
  tileLayer?: string;
  /** Viewport the main map was at when the editor was opened. */
  initialView?: { center: [number, number]; zoom: number };
}) {
  const { farm } = useFarm();
  const farmId   = farm?.id ?? "";

  const containerRef      = useRef<HTMLDivElement>(null);
  const mapRef            = useRef<any>(null);
  const markersRef        = useRef<Map<string, any>>(new Map());
  const leafletRef        = useRef<any>(null);
  const modeRef           = useRef<Mode>("select");
  // Keeps a ref in sync with selectedIds state so Leaflet callbacks always see the latest value
  const selectedIdsRef    = useRef<Set<string>>(new Set());
  // Rubber-band selection state (lives in refs to stay stable across Leaflet event closures)
  const selectionStartRef = useRef<any>(null);
  const selectionRectRef  = useRef<any>(null);

  // All plant data lives in refs — avoids re-rendering 14k rows on every change
  const allPlantsRef    = useRef<EditablePlant[]>([]);
  const allPlantsMapRef = useRef<Map<string, EditablePlant>>(new Map());

  // React state — only what drives visible UI
  const [selectedIds,   _setSelectedIds]  = useState<Set<string>>(new Set());
  const [selectedPlant, setSelectedPlant] = useState<EditablePlant | null>(null);
  const [totalCount,    setTotalCount]    = useState(0);
  const [mode,          setMode]          = useState<Mode>("select");
  const [saveStatus,    setSaveStatus]    = useState<SaveStatus>("idle");
  const [showZoomHint,  setShowZoomHint]  = useState(false);

  // Unified setter that keeps the ref and state in sync
  const setSelectedIds = useCallback((ids: Set<string>) => {
    selectedIdsRef.current = ids;
    _setSelectedIds(ids);
  }, []);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Lock body scroll; Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // ─── Field editing (single-plant panel) ───────────────────────────────────
  function updateField(field: keyof EditablePlant, raw: string) {
    if (!selectedPlant) return;

    const parsed: any =
      field === "sector_id" || field === "row_index" || field === "col_index"
        ? (raw === "" ? null : parseInt(raw, 10))
        : raw || null;

    const updated = { ...selectedPlant, [field]: parsed };
    allPlantsMapRef.current.set(selectedPlant.id, updated);
    const idx = allPlantsRef.current.findIndex(p => p.id === selectedPlant.id);
    if (idx !== -1) allPlantsRef.current[idx] = updated;
    setSelectedPlant(updated);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  function deleteSelected() {
    const ids = selectedIdsRef.current;
    if (ids.size === 0) return;

    for (const id of ids) {
      const m = markersRef.current.get(id);
      if (m) { m.remove(); markersRef.current.delete(id); }
      allPlantsMapRef.current.delete(id);
    }
    allPlantsRef.current = allPlantsRef.current.filter(p => !ids.has(p.id));

    setTotalCount(c => c - ids.size);
    setSelectedIds(new Set());
    setSelectedPlant(null);
  }

  // ─── Clear selection ──────────────────────────────────────────────────────
  function clearSelection() {
    setSelectedIds(new Set());
    setSelectedPlant(null);
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  async function save() {
    if (!farmId) {
      console.error("[modifier] farmId not set — cannot save");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3500);
      return;
    }
    setSaveStatus("saving");
    try {
      const features = allPlantsRef.current.map(p => ({
        type: "Feature",
        geometry:   { type: "Point", coordinates: [p.lng, p.lat] },
        properties: {
          plant_id:     p.plant_id,
          sector_id:    p.sector_id,
          sector_label: p.sector_label,
          row_index:    p.row_index,
          col_index:    p.col_index,
          area_px:      p.area_px,
          pixel_x:      p.pixel_x,
          pixel_y:      p.pixel_y,
        },
      }));
      const { data: { session } } = await createClient().auth.getSession();
      const res = await fetch(`${MODIFIER_BASE}/plants/${farmId}`, {
        method:  "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ type: "FeatureCollection", features }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`${res.status} — ${body.error ?? res.statusText}`);
      }
      setSaveStatus("saved");
      onSaved?.();
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("[modifier] save failed:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3500);
    }
  }

  // ─── Marker creation ──────────────────────────────────────────────────────
  // Markers are NOT draggable by default — only selected markers get drag enabled.
  const createMarkerInternal = useCallback((plant: EditablePlant, map: any, L: any) => {
    const marker = L.marker([plant.lat, plant.lng], {
      draggable: false,
      icon:      makeDotIcon(L, false, false, getHealthColor(plant)),
    });

    marker.bindTooltip(plant.plant_id ?? "New plant", {
      sticky: true, direction: "top", offset: [0, -10],
    });

    // Click → single-select this plant
    marker.on("click", (e: any) => {
      L.DomEvent.stopPropagation(e);
      const newIds = new Set([plant.id]);
      setSelectedIds(newIds);
      setSelectedPlant(allPlantsMapRef.current.get(plant.id) ?? null);
    });

    // ── Group-move: drag one selected marker → all selected markers move ──
    const prevPos = { lat: 0, lng: 0 };

    marker.on("dragstart", () => {
      const pos = marker.getLatLng();
      prevPos.lat = pos.lat;
      prevPos.lng = pos.lng;
    });

    marker.on("drag", () => {
      const selIds = selectedIdsRef.current;
      if (selIds.size <= 1) return; // single drag: Leaflet handles it natively

      const newPos = marker.getLatLng();
      const dLat = newPos.lat - prevPos.lat;
      const dLng = newPos.lng - prevPos.lng;
      prevPos.lat = newPos.lat;
      prevPos.lng = newPos.lng;

      // Shift every other selected marker by the same delta
      for (const id of selIds) {
        if (id === plant.id) continue;
        const m = markersRef.current.get(id);
        if (!m) continue;
        const p = m.getLatLng();
        m.setLatLng([p.lat + dLat, p.lng + dLng]);
      }
    });

    marker.on("dragend", () => {
      const selIds = selectedIdsRef.current;

      // Commit final positions for all selected plants to the ref store
      for (const id of selIds) {
        const m = markersRef.current.get(id);
        if (!m) continue;
        const { lat, lng } = m.getLatLng();
        const existing = allPlantsMapRef.current.get(id);
        if (!existing) continue;
        const updated = { ...existing, lat, lng };
        allPlantsMapRef.current.set(id, updated);
        const idx = allPlantsRef.current.findIndex(p => p.id === id);
        if (idx !== -1) allPlantsRef.current[idx] = updated;
      }

      // Refresh single-plant panel if applicable
      setSelectedPlant(prev => {
        if (!prev) return null;
        return allPlantsMapRef.current.get(prev.id) ?? null;
      });
    });

    marker.addTo(map);
    markersRef.current.set(plant.id, marker);
  }, [setSelectedIds]);

  // ─── Viewport culling + zoom gate ─────────────────────────────────────────
  const syncMarkersToViewport = useCallback(() => {
    const map = mapRef.current;
    const L   = leafletRef.current;
    if (!map || !L) return;

    const zoom   = map.getZoom();
    const selIds = selectedIdsRef.current;

    if (zoom < MIN_ZOOM_FOR_MARKERS) {
      // Strip all non-selected markers from the DOM
      for (const [id, marker] of markersRef.current) {
        if (selIds.has(id)) continue;
        marker.remove();
        markersRef.current.delete(id);
      }
      setShowZoomHint(true);
      return;
    }

    setShowZoomHint(false);

    const bounds = map.getBounds().pad(0.15); // 15% buffer beyond the visible edge

    // Create markers for plants now in view
    for (const plant of allPlantsRef.current) {
      if (markersRef.current.has(plant.id)) continue;
      if (bounds.contains([plant.lat, plant.lng])) {
        createMarkerInternal(plant, map, L);
        // Apply correct icon if this plant is already in the selection
        if (selIds.has(plant.id)) {
          const isSingle = selIds.size === 1;
          markersRef.current.get(plant.id)?.setIcon(makeDotIcon(L, isSingle, !isSingle, getHealthColor(plant)));
          markersRef.current.get(plant.id)?.dragging?.enable();
        }
      }
    }

    // Remove markers that have panned out of view (keep selected ones)
    for (const [id, marker] of markersRef.current) {
      if (selIds.has(id)) continue;
      const plant = allPlantsMapRef.current.get(id);
      if (!plant || !bounds.contains([plant.lat, plant.lng])) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
  }, [createMarkerInternal]);

  // ─── Map initialisation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    let map: any;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      const { data: { session: _editorSession } } = await createClient().auth.getSession();
      const token = _editorSession?.access_token ?? "";

      const initCenter = initialView?.center ?? ([3.5, 109] as [number, number]);
      const initZoom   = initialView?.zoom   ?? 6;

      map = L.map(containerRef.current, {
        center:             initCenter,
        zoom:               initZoom,
        maxZoom:            23,
        zoomControl:        false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Esri satellite basemap
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 23, maxNativeZoom: 19 },
      ).addTo(map);

      // Tiler imagery overlay
      try {
        const base = farmId
          ? (tileLayer ? `${TILER_BASE}/tiles/${farmId}/${tileLayer}` : `${TILER_BASE}/tiles/${farmId}`)
          : null;
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const r = base ? await fetch(`${base}/info`, {
          signal: ctrl.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }) : null;
        clearTimeout(t);
        if (r?.ok) {
          const info = await r.json();
          const tileUrl = token ? `${base}/{z}/{x}/{y}.png?token=${token}` : `${base}/{z}/{x}/{y}.png`;
          L.tileLayer(tileUrl, {
            maxZoom: 23, maxNativeZoom: 22, opacity: 0.65,
            errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          }).addTo(map);
          if (!initialView) {
            const [west, south, east, north] = info.bboxWGS84;
            map.fitBounds(L.latLngBounds([south, west], [north, east]), { padding: [24, 24], maxZoom: 22 });
          }
        }
      } catch { /* tiler offline — satellite base only */ }

      // Load all plant data into refs, then populate the viewport
      try {
        const geo = farmId
          ? await fetch(`${TILER_BASE}/plants/${farmId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }).then(r => r.json())
          : { features: [] };
        if (!cancelled && geo.features?.length) {
          const loaded: EditablePlant[] = geo.features.map((f: any, i: number) => ({
            id:           f.properties.plant_id ?? `__plant_${i}`,
            lat:          f.geometry.coordinates[1],
            lng:          f.geometry.coordinates[0],
            plant_id:     f.properties.plant_id,
            sector_id:    f.properties.sector_id,
            sector_label: f.properties.sector_label,
            row_index:    f.properties.row_index,
            col_index:    f.properties.col_index,
            area_px:      f.properties.area_px,
            pixel_x:      f.properties.pixel_x,
            pixel_y:      f.properties.pixel_y,
            is_noise:                    f.properties.is_noise                    ?? null,
            ndvi:                        f.properties.ndvi                        ?? null,
            ndvi_mean:                   f.properties.ndvi_mean                   ?? null,
            ndvi_category:               f.properties.ndvi_category               ?? null,
            predicted_growth_stage_name: f.properties.predicted_growth_stage_name ?? null,
            predicted_yield_kg:          f.properties.predicted_yield_kg          ?? null,
            predicted_nitrogen_status:   f.properties.predicted_nitrogen_status   ?? null,
            ndre:                        f.properties.ndre                        ?? null,
            ndre_category:               f.properties.ndre_category               ?? null,
          }));
          allPlantsRef.current    = loaded;
          allPlantsMapRef.current = new Map(loaded.map(p => [p.id, p]));
          setTotalCount(loaded.length);
          mapRef.current = map;
          syncMarkersToViewport();
        }
      } catch { /* no plants available */ }

      // Viewport culling on pan / zoom
      map.on("moveend", syncMarkersToViewport);
      map.on("zoomend", syncMarkersToViewport);

      // ── Add mode: place a new plant on click ──────────────────────────────
      map.on("click", (e: any) => {
        if (modeRef.current !== "add") return;
        const { lat, lng } = e.latlng;
        const plant: EditablePlant = {
          id: uid(), lat, lng,
          plant_id: null, sector_id: null, sector_label: null,
          row_index: null, col_index: null, area_px: null,
          pixel_x: null, pixel_y: null,
          is_noise: null, ndvi: null, ndvi_mean: null, ndvi_category: null,
          predicted_growth_stage_name: null, predicted_yield_kg: null,
          predicted_nitrogen_status: null, ndre: null, ndre_category: null,
          isNew: true,
        };
        allPlantsRef.current.push(plant);
        allPlantsMapRef.current.set(plant.id, plant);
        createMarkerInternal(plant, map, L);
        setTotalCount(c => c + 1);
        setSelectedIds(new Set([plant.id]));
        setSelectedPlant(plant);
        setMode("select");
      });

      // ── Group-select mode: rubber-band rectangle ──────────────────────────
      // Only fires on the empty map canvas — Leaflet's interactive elements
      // (markers) call stopPropagation internally, so those clicks are ignored.
      map.on("mousedown", (e: any) => {
        if (modeRef.current !== "group-select") return;
        // Skip if the native event originated on an interactive layer element
        const target = e.originalEvent?.target as HTMLElement | null;
        if (target?.closest?.(".leaflet-interactive")) return;

        selectionStartRef.current = e.latlng;
        map.dragging.disable();
        selectionRectRef.current = L.rectangle(
          [e.latlng, e.latlng],
          { color: "#6366f1", weight: 1.5, fillOpacity: 0.08, dashArray: "5 4", interactive: false },
        ).addTo(map);
      });

      map.on("mousemove", (e: any) => {
        if (!selectionStartRef.current || !selectionRectRef.current) return;
        selectionRectRef.current.setBounds([selectionStartRef.current, e.latlng]);
      });

      map.on("mouseup", (e: any) => {
        if (!selectionStartRef.current) return;
        const start = selectionStartRef.current;
        const end   = e.latlng;
        selectionStartRef.current = null;

        if (selectionRectRef.current) {
          selectionRectRef.current.remove();
          selectionRectRef.current = null;
        }
        map.dragging.enable();

        // Ignore tiny clicks (< ~1 m) — marker click handlers deal with single clicks
        if (
          Math.abs(start.lat - end.lat) < 0.00001 &&
          Math.abs(start.lng - end.lng) < 0.00001
        ) return;

        // Don't select when zoomed out (no markers visible to select)
        if (map.getZoom() < MIN_ZOOM_FOR_MARKERS) return;

        const bounds = L.latLngBounds(start, end);
        const newIds = new Set<string>();
        for (const plant of allPlantsRef.current) {
          if (bounds.contains([plant.lat, plant.lng])) newIds.add(plant.id);
        }
        setSelectedIds(newIds);
        setSelectedPlant(
          newIds.size === 1
            ? (allPlantsMapRef.current.get([...newIds][0]) ?? null)
            : null,
        );
      });

      if (!mapRef.current) mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      try { map?.remove(); } catch { /* ignore */ }
      mapRef.current    = null;
      leafletRef.current = null;
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Sync Leaflet marker icons whenever the selection changes ─────────────
  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;

    const isSingle = selectedIds.size === 1;

    for (const [id, marker] of markersRef.current) {
      const isSelected = selectedIds.has(id);
      const plant      = allPlantsMapRef.current.get(id);
      const hColor     = plant ? getHealthColor(plant) : "#22c55e";
      marker.setIcon(makeDotIcon(L, isSingle && isSelected, !isSingle && isSelected, hColor));
      if (isSelected) marker.dragging?.enable();
      else            marker.dragging?.disable();
    }
  }, [selectedIds]);

  // ─── Render ───────────────────────────────────────────────────────────────
  const hasGroup  = selectedIds.size > 1;
  const hasSingle = selectedIds.size === 1 && selectedPlant !== null;

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div
        className="relative flex w-[95vw] h-[90vh] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/60 bg-background"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Map area (left) ── */}
        <div className="flex-1 relative">
          {mode === "add" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-sage-deep text-white px-4 py-1.5 text-xs font-medium shadow-lg pointer-events-none select-none">
              Click the map to place a plant
            </div>
          )}
          {mode === "group-select" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-indigo-600 text-white px-4 py-1.5 text-xs font-medium shadow-lg pointer-events-none select-none">
              Click and drag to select a group of plants
            </div>
          )}
          {showZoomHint && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 rounded-full bg-background/90 border border-border/60 px-4 py-2 text-xs text-muted-foreground shadow-md backdrop-blur pointer-events-none select-none">
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
              Zoom in to view plant datapoints
            </div>
          )}
          <div ref={containerRef} className="h-full w-full" />
        </div>

        {/* ── Side panel (right) ── */}
        <div className="w-[272px] shrink-0 flex flex-col border-l border-border/60">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div>
              <h2 className="font-display text-sm font-semibold">Manual Mapping</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{totalCount} plants loaded</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Close editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode toolbar */}
          <div className="px-4 py-3 border-b border-border/60 space-y-2">
            {/* Add datapoint */}
            <Button
              size="sm"
              variant={mode === "add" ? "default" : "outline"}
              className={cn("w-full gap-2", mode === "add" && "bg-sage-deep hover:bg-sage-deep/90")}
              onClick={() => setMode(m => m === "add" ? "select" : "add")}
            >
              <Plus className="h-3.5 w-3.5" />
              {mode === "add" ? "Cancel add" : "Add datapoint"}
            </Button>

            {/* Group select */}
            <Button
              size="sm"
              variant={mode === "group-select" ? "default" : "outline"}
              className={cn(
                "w-full gap-2",
                mode === "group-select" && "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600",
              )}
              onClick={() => setMode(m => m === "group-select" ? "select" : "group-select")}
            >
              {/* Dashed-rect icon */}
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2"/>
              </svg>
              {mode === "group-select" ? "Cancel selection" : "Group select"}
            </Button>

            {mode === "add" && (
              <p className="text-[11px] text-center text-muted-foreground">
                Click anywhere on the map to place a new plant marker.
              </p>
            )}
            {mode === "group-select" && (
              <p className="text-[11px] text-center text-muted-foreground">
                Drag a rectangle on the map to select multiple plants at once.
              </p>
            )}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">

            {/* ── Group panel ── */}
            {hasGroup && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{selectedIds.size} plants selected</span>
                  <Badge variant="secondary" className="text-[10px] border-0 bg-indigo-500/15 text-indigo-500 px-1.5">
                    Group
                  </Badge>
                </div>

                <div className="rounded-md bg-muted/40 px-3 py-2.5 space-y-1.5">
                  <p className="text-[11px] font-medium">Move group</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Drag any{" "}
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 align-middle" />{" "}
                    highlighted marker on the map — all {selectedIds.size} selected plants move together.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={deleteSelected}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete {selectedIds.size} plants
                </Button>

                <button
                  className="w-full text-[11px] text-muted-foreground hover:text-foreground transition-colors text-center"
                  onClick={clearSelection}
                >
                  Clear selection
                </button>
              </div>
            )}

            {/* ── Single plant panel ── */}
            {hasSingle && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Plant details</span>
                  {selectedPlant.isNew && (
                    <Badge variant="secondary" className="text-[10px] border-0 bg-harvest/20 text-clay px-1.5">
                      New
                    </Badge>
                  )}
                </div>

                {selectedPlant.plant_id && (
                  <div
                    className="rounded-md bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground font-mono truncate"
                    title={selectedPlant.plant_id}
                  >
                    {selectedPlant.plant_id}
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs">Sector label</Label>
                  <input
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={selectedPlant.sector_label ?? ""}
                    onChange={e => updateField("sector_label", e.target.value)}
                    placeholder="e.g. A-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Sector ID</Label>
                    <input
                      type="number"
                      className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      value={selectedPlant.sector_id ?? ""}
                      onChange={e => updateField("sector_id", e.target.value)}
                      placeholder="—"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Row index</Label>
                    <input
                      type="number"
                      className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      value={selectedPlant.row_index ?? ""}
                      onChange={e => updateField("row_index", e.target.value)}
                      placeholder="—"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Column index</Label>
                  <input
                    type="number"
                    className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={selectedPlant.col_index ?? ""}
                    onChange={e => updateField("col_index", e.target.value)}
                    placeholder="—"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Position — drag marker to move
                  </Label>
                  <div className="rounded-md bg-muted/40 px-2.5 py-2 text-[11px] font-mono space-y-0.5 text-muted-foreground">
                    <div>Lat: {selectedPlant.lat.toFixed(6)}</div>
                    <div>Lng: {selectedPlant.lng.toFixed(6)}</div>
                  </div>
                </div>

                {/* ── Health data (read-only, from ML model) ── */}
                {!selectedPlant.isNew && selectedPlant.ndvi_category && (
                  <div className="space-y-2 pt-1 border-t border-border/50">
                    <Label className="text-xs text-muted-foreground">Health data</Label>

                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-white/20"
                        style={{ background: getHealthColor(selectedPlant) }}
                      />
                      <span className="text-xs font-medium">{selectedPlant.ndvi_category}</span>
                      {selectedPlant.ndvi != null && (
                        <span className="text-[11px] text-muted-foreground ml-auto tabular-nums">
                          NDVI {selectedPlant.ndvi.toFixed(3)}
                        </span>
                      )}
                    </div>

                    <div className="rounded-md bg-muted/40 px-2.5 py-2 space-y-1.5 text-[11px]">
                      {selectedPlant.predicted_growth_stage_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Growth stage</span>
                          <span className="font-medium">{selectedPlant.predicted_growth_stage_name}</span>
                        </div>
                      )}
                      {selectedPlant.predicted_nitrogen_status && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nitrogen</span>
                          <span
                            className="font-medium"
                            style={{ color: selectedPlant.predicted_nitrogen_status === "Deficient" ? "#ef4444" : "#16a34a" }}
                          >
                            {selectedPlant.predicted_nitrogen_status}
                          </span>
                        </div>
                      )}
                      {selectedPlant.predicted_yield_kg != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Est. yield</span>
                          <span className="font-medium">{selectedPlant.predicted_yield_kg.toFixed(1)} kg</span>
                        </div>
                      )}
                      {selectedPlant.ndvi_mean != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">NDVI mean</span>
                          <span className="font-medium tabular-nums">{selectedPlant.ndvi_mean.toFixed(3)}</span>
                        </div>
                      )}
                      {selectedPlant.ndre_category && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">NDRE</span>
                          <span className="font-medium">{selectedPlant.ndre_category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={deleteSelected}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete plant
                </Button>
              </div>
            )}

            {/* ── Empty state ── */}
            {!hasGroup && !hasSingle && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <MousePointer className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground max-w-[180px]">
                  Click a plant marker to select it, or use Group Select to select multiple.
                </p>
              </div>
            )}
          </div>

          {/* Save */}
          <div className="px-4 py-4 border-t border-border/60 space-y-2">
            <Button
              className={cn(
                "w-full gap-2",
                (saveStatus === "idle" || saveStatus === "saving") && "bg-sage-deep hover:bg-sage-deep/90",
                saveStatus === "saved" && "bg-sage-deep/80 hover:bg-sage-deep/80",
                saveStatus === "error" && "bg-destructive hover:bg-destructive",
              )}
              onClick={save}
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving" ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
              ) : saveStatus === "saved" ? (
                <><Save className="h-3.5 w-3.5" /> Saved!</>
              ) : saveStatus === "error" ? (
                <><Save className="h-3.5 w-3.5" /> Retry save</>
              ) : (
                <><Save className="h-3.5 w-3.5" /> Save changes</>
              )}
            </Button>
            {saveStatus === "error" && (
              <p className="text-[11px] text-destructive text-center">
                Server unreachable — changes were not saved.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
