"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map, TileLayer, GeoJSON } from "leaflet";
import type { FeatureCollection } from "geojson";
import { cn } from "@/lib/utils";
import { useFarm } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Info, Layers, SlidersHorizontal } from "lucide-react";
import { MapStatusOverlay, type MapLegend } from "@/components/map-status-overlay";
import InfoCard from "@/components/ui/info-card";

const TILER_BASE = process.env.NEXT_PUBLIC_TILER_URL;

type TiffInfo = {
  bboxWGS84: [number, number, number, number]; // [west, south, east, north]
  crs: string;
  mtime?: number;
};

export type PlantProperties = {
  plant_id:     string | null;
  instance_id:  number | null;
  sector_id:    number | null;
  sector_label: string | null;
  row_index:    number | null;
  col_index:    number | null;
  area_px:      number | null;
  canopy_area:  number | null;
  pixel_x:      number | null;
  pixel_y:      number | null;
  // Health / ML fields
  is_noise:                    boolean | null;
  ndvi:                        number | null;
  ndvi_mean:                   number | null;
  ndvi_category:               string | null;
  osavi:                       number | null;
  health_status:               string | null;
  health_status_code:          number | null;
  health_color:                string | null;
  health_score:                number | null;
  predicted_growth_stage_name: string | null;
  predicted_yield_kg:          number | null;
  predicted_nitrogen_status:   string | null;
  ndre:                        number | null;
  ndre_category:               string | null;
};

export type PlantColorMode = "composite" | "ndvi" | "ndre" | "osavi";

/** Falls back to a status-based color when the backend's own health_color is absent. */
export function statusColor(status: string | null): string {
  switch (status) {
    case "Healthy":       return "#16a34a";
    case "Moderate":      return "#eab308";
    case "Stressed":      return "#f97316";
    case "Critical":      return "#ef4444";
    case "BoundaryLimit": return "#94a3b8";
    default:              return "#94a3b8";
  }
}

// Real vegetation index readings (NDVI/NDRE/OSAVI) rarely span the theoretical
// -1..1 range — actual plant data here falls mostly within roughly -0.2..1.0.
// Stretching the gradient over that narrower range (instead of -1..1) is what
// makes red/yellow/green all actually show up instead of everything landing
// in the green end of the scale and looking uniform.
const INDEX_DOMAIN_MIN = -0.2;
const INDEX_DOMAIN_MAX = 1.0;

/** Diverging red -> amber -> green ramp over a raw vegetation index. Saturated stops
 *  (no pale midpoint) so the ramp stays bright and legible over aerial imagery. */
export function indexRamp(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "#94a3b8";
  const t = Math.max(0, Math.min(1, (v - INDEX_DOMAIN_MIN) / (INDEX_DOMAIN_MAX - INDEX_DOMAIN_MIN)));
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const k = t / 0.5;
    r = 220 + (245 - 220) * k; g = 38 + (158 - 38) * k; b = 38 + (11 - 38) * k;
  } else {
    const k = (t - 0.5) / 0.5;
    r = 245 + (22 - 245) * k; g = 158 + (163 - 158) * k; b = 11 + (74 - 11) * k;
  }
  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
}

function plantColor(props: PlantProperties, mode: PlantColorMode): string {
  switch (mode) {
    case "ndvi":  return indexRamp(props.ndvi);
    case "ndre":  return indexRamp(props.ndre);
    case "osavi": return indexRamp(props.osavi);
    default:      return props.health_color || statusColor(props.health_status);
  }
}

const COLOR_MODE_LABEL: Record<PlantColorMode, string> = {
  composite: "Composite", ndvi: "NDVI", ndre: "NDRE", osavi: "OSAVI",
};

function legendFor(mode: PlantColorMode): MapLegend {
  if (mode === "composite") {
    return {
      title: "Composite · health",
      swatches: [
        { color: "#16a34a", label: "Healthy" },
        { color: "#eab308", label: "Moderate" },
        { color: "#f97316", label: "Stressed" },
        { color: "#ef4444", label: "Critical" },
      ],
    };
  }
  // High/Mid breakpoints per index, matching the thresholds used across the GIS pages
  // (NDVI: High >= 0.6, Mid >= 0.3 · NDRE: High >= 0.6, Mid >= 0.2 · OSAVI: same as NDVI).
  const breakpoints: Record<Exclude<PlantColorMode, "composite">, [number, number]> = {
    ndvi:  [0.6, 0.3],
    ndre:  [0.6, 0.2],
    osavi: [0.6, 0.3],
  };
  const [high, mid] = breakpoints[mode as Exclude<PlantColorMode, "composite">];
  return {
    title: COLOR_MODE_LABEL[mode],
    swatches: [
      { color: indexRamp(mid - 0.1),  label: `< ${mid}  Low` },
      { color: indexRamp((mid + high) / 2), label: `${mid} – ${high}  Mid` },
      { color: indexRamp(high + 0.1), label: `≥ ${high}  High` },
    ],
  };
}

export function TileMap({
  className,
  opacity = 1,
  plantsOpacity = 1,
  label,
  layer,
  onPlantSelect,
  onViewChange,
  plantsSeed = 0,
}: {
  className?: string;
  /** 0–1, applied to the raster tile overlay. */
  opacity?: number;
  /** 0–1, applied to the plant datapoint markers. */
  plantsOpacity?: number;
  label?: string;
  /** Named tile layer (e.g. "ndvi", "ndre", "osavi"). Omit for the base orthomosaic. */
  layer?: string;
  onPlantSelect?: (props: PlantProperties | null) => void;
  /** Fires after every pan/zoom ends — lets the parent track the current viewport. */
  onViewChange?: (center: [number, number], zoom: number) => void;
  /** Increment to force a plants-layer refresh without reinitialising the map. */
  plantsSeed?: number;
}) {
  const { farm } = useFarm();
  const farmId   = farm?.id ?? "";
  const tileBase = farmId
    ? (layer ? `${TILER_BASE}/tiles/${farmId}/${layer}` : `${TILER_BASE}/tiles/${farmId}`)
    : null;

  const containerRef     = useRef<HTMLDivElement>(null);
  const mapRef           = useRef<Map | null>(null);
  const layerRef         = useRef<TileLayer | null>(null);
  const plantsLayerRef   = useRef<GeoJSON | null>(null);
  const leafletRef       = useRef<any>(null);
  const tokenRef         = useRef<string>("");
  const onPlantSelectRef  = useRef(onPlantSelect);
  const onViewChangeRef   = useRef(onViewChange);
  // Ref keeps the async plant-fetch closure in sync with current showPlants state
  const showPlantsRef     = useRef(true);
  // Refs keep the pointToLayer closures (only run at feature-creation time) in sync
  // with the latest color mode / marker opacity without needing to recreate markers.
  const plantColorModeRef = useRef<PlantColorMode>("composite");
  const plantsOpacityRef  = useRef(plantsOpacity);

  const [status, setStatus]       = useState<"loading" | "ready" | "offline">("loading");
  const [showPlants, setShowPlants] = useState(true);
  const [plantColorMode, setPlantColorMode] = useState<PlantColorMode>("composite");
  // null = no plant batch in progress; 0-100 = percent of features added to the map so far
  const [plantsProgress, setPlantsProgress] = useState<number | null>(null);

  useEffect(() => { onPlantSelectRef.current = onPlantSelect; }, [onPlantSelect]);
  useEffect(() => { onViewChangeRef.current  = onViewChange;  }, [onViewChange]);

  // Keep tokenRef current and update the live tile layer URL whenever the
  // Supabase session token rotates (default 1-hour expiry auto-refreshed by the SDK).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      tokenRef.current = session?.access_token ?? "";
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      tokenRef.current = session?.access_token ?? "";
      // Rewrite the tile layer URL so in-flight and future tiles use the fresh token
      if (layerRef.current && tileBase && tokenRef.current) {
        layerRef.current.setUrl(
          `${tileBase}/{z}/{x}/{y}.png?token=${tokenRef.current}`,
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [tileBase]);

  // Toggle plant markers without reinitialising the map
  useEffect(() => {
    showPlantsRef.current = showPlants;
    const plantsLayer = plantsLayerRef.current;
    const map         = mapRef.current;
    if (!plantsLayer || !map) return;
    if (showPlants) plantsLayer.addTo(map);
    else            plantsLayer.remove();
  }, [showPlants]);

  // Recolor existing markers in place when the datapoint color mode changes —
  // avoids refetching/rebuilding thousands of markers just to swap their fill.
  useEffect(() => {
    plantColorModeRef.current = plantColorMode;
    plantsLayerRef.current?.eachLayer((l: any) => {
      const props = l.feature?.properties as PlantProperties | undefined;
      if (!props) return;
      l.setStyle({ fillColor: plantColor(props, plantColorMode) });
    });
  }, [plantColorMode]);

  // Adjust marker opacity in place — independent of the raster tile opacity below.
  useEffect(() => {
    plantsOpacityRef.current = plantsOpacity;
    plantsLayerRef.current?.setStyle({ opacity: plantsOpacity, fillOpacity: plantsOpacity });
  }, [plantsOpacity]);

  useEffect(() => {
    if (!farmId || !containerRef.current || mapRef.current) return;

    let map: Map;
    let resizeObserver: ResizeObserver | undefined;
    // Prevents the async IIFE from initialising the map after the effect has
    // been cleaned up (React 18 Strict Mode double-invokes effects).
    let cancelled = false;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        leafletRef.current = L;

        // Resolve token immediately — the auth effect's getSession() is also
        // async and may not have settled into tokenRef yet.
        const { data: { session: _initSession } } = await createClient().auth.getSession();
        const token = _initSession?.access_token ?? tokenRef.current;
        if (!tokenRef.current) tokenRef.current = token;

        // Fetch GeoTIFF bounding box in WGS84 from the tiler
        let bounds: ReturnType<typeof L.latLngBounds> | null = null;
        let version = "";
        let tilerOffline = false;
        try {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 4000);
          const r = await fetch(`${tileBase}/info`, {
            signal: controller.signal,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          clearTimeout(t);
          if (r.ok) {
            const info: TiffInfo = await r.json();
            const [west, south, east, north] = info.bboxWGS84;
            bounds = L.latLngBounds([south, west], [north, east]);
            // Cache-bust tile URLs when the TIF file changes on disk
            if (info.mtime) version = String(info.mtime);
          }
          // Non-ok (4xx/5xx): tiler is running but this layer's file is missing or
          // not yet ready — proceed with the default map centre and let individual
          // tile requests fail gracefully via errorTileUrl.
        } catch {
          // Network error or timeout: tiler is genuinely unreachable.
          tilerOffline = true;
        }

        // Check cancelled after every await point — cleanup may have run while
        // we were waiting for the network, preventing a double-initialisation.
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current, {
          center: bounds ? bounds.getCenter() : [3.5, 109],
          zoom: bounds ? 14 : 6,
          maxZoom: 23,
          zoomControl: false,
          attributionControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Leaflet only measures the container once, at construction time. If the
        // container's real size settles later (grid/flex layout resolving, a modal
        // finishing its transition, a sidebar toggle) the tile grid is never told
        // and stays positioned for the old size. A ResizeObserver keeps it in sync
        // for the whole lifetime of the map, not just the initial mount.
        resizeObserver = new ResizeObserver(() => map.invalidateSize());
        resizeObserver.observe(containerRef.current);

        // Esri World Imagery satellite base — no API key required
        // Esri's URL uses /{z}/{y}/{x} (row before column), which Leaflet resolves correctly
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 23, maxNativeZoom: 19 },
        ).addTo(map);

        // XYZ tile overlay from the tiler service
        const tileQs = [version ? `v=${version}` : "", token ? `token=${token}` : ""]
          .filter(Boolean).join("&");
        const overlay = L.tileLayer(
          `${tileBase}/{z}/{x}/{y}.png${tileQs ? `?${tileQs}` : ""}`,
          {
            maxZoom: 23,
            maxNativeZoom: 22,
            opacity,
            // Transparent 1×1 GIF so missing tiles are invisible
            errorTileUrl:
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          },
        ).addTo(map);

        layerRef.current = overlay;

        if (bounds) {
          map.fitBounds(bounds, { padding: [24, 24], maxZoom: 22 });
        }

        // Plant markers — server reprojects to WGS84, client just renders dots
        try {
          const plants = await fetch(`${TILER_BASE}/plants/${farmId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }).then((r) => r.json());
          if (plants.features?.length && !cancelled) {
            const plantsLayer = L.geoJSON(undefined, {
              pointToLayer: (feat, latlng) => {
                const props = feat.properties as PlantProperties;
                const marker = L.circleMarker(latlng, {
                  radius: 4,
                  fillColor: plantColor(props, plantColorModeRef.current),
                  color: "#fff",
                  weight: 1,
                  opacity: plantsOpacityRef.current,
                  fillOpacity: plantsOpacityRef.current,
                });

                const categoryLine = props.ndvi_category
                  ? `<br/><span style="color:#999;font-size:0.85em">${props.ndvi_category}</span>`
                  : "";
                marker.bindTooltip(
                  `<span style="font-weight:600">${props.plant_id ?? "—"}</span><br/>${props.sector_label ?? ""}${categoryLine}`,
                  { direction: "top", offset: [0, -6] },
                );

                marker.on("click", () => {
                  onPlantSelectRef.current?.(props);
                });

                return marker;
              },
            });
            plantsLayerRef.current = plantsLayer;
            // Use ref so we respect any toggle that happened while plants were loading
            if (showPlantsRef.current) plantsLayer.addTo(map);

            // Feed features in over several animation frames instead of all at once, and
            // track real progress so the UI can show an honest "still working" indicator
            // instead of the map appearing to hang while thousands of markers are built.
            const features = plants.features;
            const BATCH_SIZE = 300;
            let i = 0;
            setPlantsProgress(0);
            const addBatch = () => {
              if (cancelled) return;
              const end = Math.min(i + BATCH_SIZE, features.length);
              const batch: FeatureCollection = { type: "FeatureCollection", features: features.slice(i, end) };
              plantsLayer.addData(batch);
              i = end;
              setPlantsProgress(Math.round((i / features.length) * 100));
              if (i < features.length) requestAnimationFrame(addBatch);
              else setPlantsProgress(null);
            };
            addBatch();
          }
        } catch { /* no plants data — silently skip */ }

        map.on("moveend", () => {
          const c = map.getCenter();
          onViewChangeRef.current?.([c.lat, c.lng], map.getZoom());
        });

        mapRef.current = map;
        setStatus(tilerOffline ? "offline" : "ready");
      } catch (err) {
        console.error("[TileMap]", err);
        setStatus("offline");
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      map?.remove();
      mapRef.current         = null;
      layerRef.current       = null;
      plantsLayerRef.current = null;
    };
  // Re-run when the active farm changes so the correct farm's tiles are loaded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId]);

  // Sync opacity prop changes to the live layer without reinitialising
  useEffect(() => {
    layerRef.current?.setOpacity(opacity);
  }, [opacity]);

  // Re-fetch plant markers when plantsSeed increments (i.e. after a save in the editor).
  // Skips seed=0 because the initial load is handled inside the map-init effect above.
  useEffect(() => {
    if (!plantsSeed || !farmId) return;
    const map = mapRef.current;
    const L   = leafletRef.current;
    if (!map || !L) return;

    let cancelled = false;
    (async () => {
      try {
        const plants = await fetch(`${TILER_BASE}/plants/${farmId}`, {
          headers: tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {},
        }).then(r => r.json());
        if (cancelled) return;

        if (plantsLayerRef.current) {
          plantsLayerRef.current.remove();
          plantsLayerRef.current = null;
        }

        if (!plants.features?.length) return;

        const plantsLayer = L.geoJSON(undefined, {
          pointToLayer: (feat: any, latlng: any) => {
            const props = feat.properties as PlantProperties;
            const marker = L.circleMarker(latlng, {
              radius: 4, fillColor: plantColor(props, plantColorModeRef.current),
              color: "#fff", weight: 1, opacity: plantsOpacityRef.current, fillOpacity: plantsOpacityRef.current,
            });
            const categoryLine = props.ndvi_category
              ? `<br/><span style="color:#999;font-size:0.85em">${props.ndvi_category}</span>`
              : "";
            marker.bindTooltip(
              `<span style="font-weight:600">${props.plant_id ?? "—"}</span><br/>${props.sector_label ?? ""}${categoryLine}`,
              { direction: "top", offset: [0, -6] },
            );
            marker.on("click", () => { onPlantSelectRef.current?.(props); });
            return marker;
          },
        });
        plantsLayerRef.current = plantsLayer;
        if (showPlantsRef.current) plantsLayer.addTo(map);

        const features = plants.features;
        const BATCH_SIZE = 300;
        let i = 0;
        setPlantsProgress(0);
        const addBatch = () => {
          if (cancelled) return;
          const end = Math.min(i + BATCH_SIZE, features.length);
          const batch: FeatureCollection = { type: "FeatureCollection", features: features.slice(i, end) };
          plantsLayer.addData(batch);
          i = end;
          setPlantsProgress(Math.round((i / features.length) * 100));
          if (i < features.length) requestAnimationFrame(addBatch);
          else setPlantsProgress(null);
        };
        addBatch();
      } catch { /* tiler unreachable — keep old markers */ }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantsSeed, farmId]);

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <MapStatusOverlay
        status={status}
        label={label}
        plantsProgress={plantsProgress}
        legend={showPlants ? legendFor(plantColorMode) : null}
      />

      {/* Layers + view-options dropdowns — float above the Leaflet panes (max z-index ~800) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/85 backdrop-blur shadow-sm border border-border/60 hover:bg-background"
            >
              <Info className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-auto border-none bg-transparent p-0 shadow-none"
          >
            <InfoCard />
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/85 backdrop-blur shadow-sm border border-border/60 hover:bg-background"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          {/* z-index must clear the fullscreen map modal's z-[9999] overlay — this content
              renders through a Radix portal straight to <body>, as a sibling of that modal,
              so it needs a higher value to win the stacking order when both are open. */}
          <DropdownMenuContent align="end" className="w-44 z-[10000]">
            <DropdownMenuLabel className="text-xs">Datapoint color</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={plantColorMode}
              onValueChange={(v) => setPlantColorMode(v as PlantColorMode)}
            >
              <DropdownMenuRadioItem value="composite">Composite</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ndvi">NDVI</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ndre">NDRE</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="osavi">OSAVI</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/85 backdrop-blur shadow-sm border border-border/60 hover:bg-background"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 z-[10000]">
            <DropdownMenuLabel className="text-xs">View options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showPlants}
              onCheckedChange={setShowPlants}
            >
              Plant datapoints
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
