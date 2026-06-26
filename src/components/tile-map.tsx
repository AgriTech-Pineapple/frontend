"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map, TileLayer, GeoJSON } from "leaflet";
import { cn } from "@/lib/utils";
import { useFarm } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";

const TILER_BASE =
  process.env.NEXT_PUBLIC_TILER_URL ?? "http://localhost:3001";

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
  pixel_x:      number | null;
  pixel_y:      number | null;
  // Health / ML fields
  is_noise:                    boolean | null;
  ndvi:                        number | null;
  ndvi_mean:                   number | null;
  ndvi_category:               string | null;
  predicted_growth_stage_name: string | null;
  predicted_yield_kg:          number | null;
  predicted_nitrogen_status:   string | null;
  ndre:                        number | null;
  ndre_category:               string | null;
};

function healthColor(props: PlantProperties): string {
  if (props.is_noise) return "#94a3b8";
  switch (props.ndvi_category) {
    case "Very Good Vegetation": return "#16a34a";
    case "Good Vegetation":      return "#22c55e";
    case "Moderate Vegetation":  return "#eab308";
    case "Sparse Vegetation":    return "#f97316";
    case "Bare / Stressed":      return "#ef4444";
    default:
      if (props.ndvi != null) {
        if (props.ndvi >= 0.5) return "#16a34a";
        if (props.ndvi >= 0.3) return "#22c55e";
        if (props.ndvi >= 0.1) return "#eab308";
        return "#ef4444";
      }
      return "#22c55e";
  }
}

export function TileMap({
  className,
  opacity = 1,
  label,
  layer,
  onPlantSelect,
  onViewChange,
  plantsSeed = 0,
}: {
  className?: string;
  /** 0–1 */
  opacity?: number;
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

  const [status, setStatus]       = useState<"loading" | "ready" | "offline">("loading");
  const [showPlants, setShowPlants] = useState(true);

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

  useEffect(() => {
    if (!farmId || !containerRef.current || mapRef.current) return;

    let map: Map;
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
            const plantsLayer = L.geoJSON(plants, {
              pointToLayer: (feat, latlng) => {
                const props = feat.properties as PlantProperties;
                const marker = L.circleMarker(latlng, {
                  radius: 4,
                  fillColor: healthColor(props),
                  color: "#fff",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.85,
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

        const plantsLayer = L.geoJSON(plants, {
          pointToLayer: (feat: any, latlng: any) => {
            const props = feat.properties as PlantProperties;
            const marker = L.circleMarker(latlng, {
              radius: 4, fillColor: healthColor(props),
              color: "#fff", weight: 1, opacity: 1, fillOpacity: 0.85,
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
      } catch { /* tiler unreachable — keep old markers */ }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantsSeed, farmId]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/40">
          <span className="text-xs text-muted-foreground animate-pulse">
            Loading map…
          </span>
        </div>
      )}

      {status === "offline" && (
        <div className="absolute top-3 left-3 z-10 rounded-md bg-background/85 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur pointer-events-none">
          Tiler offline — run the tiler service to display imagery
        </div>
      )}

      {label && (
        <div className="absolute bottom-3 left-3 z-10 rounded-md bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur pointer-events-none">
          {label}
        </div>
      )}

      {/* View-options dropdown — floats above the Leaflet panes (max z-index ~800) */}
      <div className="absolute top-3 right-3 z-[1000]">
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
          <DropdownMenuContent align="end" className="w-52 z-[1001]">
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
