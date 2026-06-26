"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageHeader } from "@/components/page-header";
import { FieldMap } from "@/components/farm-ui";
import { TileMap, type PlantProperties } from "@/components/tile-map";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Maximize2, Pencil, Search, X } from "lucide-react";
import { useFarm } from "@/lib/hooks";
import { PlantEditorOverlay } from "@/components/plant-editor-overlay";

type LayerKey = "composite" | "ndvi" | "ndre" | "health" | "terrain" | "yield";

const layers: {
  key: LayerKey;
  label: string;
  overlay: "ndvi" | "ndre" | "health" | "terrain" | "yield";
  legend: { color: string; label: string }[];
  /** true = render TileMap from the tiler; false = CSS mock */
  hasTiles: boolean;
  /** tiler layer name; undefined = default /tiles/ endpoint (RGB) */
  tileLayer?: string;
}[] = [
  { key: "composite", label: "Composite", overlay: "health", hasTiles: true, tileLayer: undefined, legend: [
    { color: "oklch(0.55 0.16 130)", label: "Healthy" },
    { color: "oklch(0.78 0.14 95)", label: "Mild stress" },
    { color: "oklch(0.62 0.16 50)", label: "Severe stress" },
    { color: "oklch(0.7 0.04 100)", label: "Bare ground" },
  ]},
  { key: "ndvi", label: "NDVI", overlay: "ndvi", hasTiles: true, tileLayer: "ndvi", legend: [
    { color: "oklch(0.55 0.16 130)", label: "0.7 – 1.0" },
    { color: "oklch(0.75 0.14 110)", label: "0.5 – 0.7" },
    { color: "oklch(0.78 0.12 80)", label: "0.3 – 0.5" },
    { color: "oklch(0.62 0.15 45)", label: "< 0.3" },
  ]},
  { key: "ndre", label: "NDRE", overlay: "ndre", hasTiles: true, tileLayer: "ndre", legend: [
    { color: "oklch(0.5 0.1 145)", label: "0.5+" },
    { color: "oklch(0.62 0.09 130)", label: "0.35 – 0.5" },
    { color: "oklch(0.75 0.07 110)", label: "< 0.35" },
    { color: "oklch(0.7 0.04 100)", label: "Bare" },
  ]},
  { key: "health", label: "Health", overlay: "health", hasTiles: false, legend: [
    { color: "oklch(0.55 0.16 130)", label: "Healthy" },
    { color: "oklch(0.78 0.14 95)", label: "Mild stress" },
    { color: "oklch(0.62 0.16 50)", label: "Severe stress" },
    { color: "oklch(0.7 0.04 100)", label: "Bare ground" },
  ]},
  { key: "terrain", label: "Terrain", overlay: "terrain", hasTiles: false, legend: [
    { color: "oklch(0.65 0.06 80)", label: "Elevation low" },
    { color: "oklch(0.55 0.05 90)", label: "Mid" },
    { color: "oklch(0.45 0.04 100)", label: "High" },
  ]},
  { key: "yield", label: "Yield", overlay: "yield", hasTiles: false, legend: [
    { color: "oklch(0.78 0.14 90)", label: "> 65 t/ha" },
    { color: "oklch(0.68 0.16 75)", label: "55 – 65" },
    { color: "oklch(0.6 0.15 50)", label: "< 55" },
  ]},
];

function MapView({
  layer,
  active,
  opacity,
  plantsSeed,
  onPlantSelect,
  onViewChange,
  className,
}: {
  layer: (typeof layers)[number];
  active: LayerKey;
  opacity: number;
  plantsSeed?: number;
  onPlantSelect: (p: PlantProperties | null) => void;
  onViewChange?: (center: [number, number], zoom: number) => void;
  className: string;
}) {
  if (layer.hasTiles) {
    return (
      <TileMap
        key={active}
        className={className}
        layer={layer.tileLayer}
        opacity={opacity / 100}
        label={`${layer.label} · ${active}`}
        plantsSeed={plantsSeed}
        onPlantSelect={layer.key === "composite" ? onPlantSelect : undefined}
        onViewChange={onViewChange}
      />
    );
  }
  return (
    <FieldMap
      className={className}
      overlay={layer.overlay}
      label={layer.label}
    />
  );
}

export default function Page() {
  const [active, setActive]     = useState<LayerKey>("composite");
  const [opacity, setOpacity]   = useState(100);
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [plantsSeed, setPlantsSeed] = useState(0);
  const [mapView,  setMapView]  = useState<{ center: [number, number]; zoom: number } | undefined>();
  const [selectedPlant, setSelectedPlant] = useState<PlantProperties | null>(null);
  const { farm } = useFarm();
  const layer = layers.find((l) => l.key === active)!;

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`GIS Mapping · ${farm.name}`}
        title="GIS Mapping"
        description="Interactive layered map of the selected estate. Switch layers to inspect vegetation indices, terrain or yield."
        actions={
          <Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">Export GeoTIFF</Button>
        }
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/30 p-1 w-fit">
        {layers.map((l) => (
          <button
            key={l.key}
            onClick={() => setActive(l.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              active === l.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card className="p-4 border-border/60 shadow-none">
            <p className="mb-2 text-sm font-medium">Active layer</p>
            <p className="font-display text-lg font-semibold">{layer.label}</p>
            <p className="text-xs text-muted-foreground mt-1">Showing {farm.name} · last capture 6 Jun 2026.</p>
          </Card>
          <Card className="p-4 border-border/60 shadow-none">
            <p className="mb-2 text-sm font-medium">Opacity</p>
            <Slider value={[opacity]} onValueChange={(v) => setOpacity(v[0])} max={100} step={1} />
            <p className="mt-3 mb-2 text-sm font-medium">Date</p>
            <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs">
              {farm.captures.slice(0, 3).map((c) => (
                <option key={c.mission}>{c.date} · {c.mission}</option>
              ))}
            </select>
          </Card>
          <Card className="p-4 border-border/60 shadow-none">
            <p className="mb-3 text-sm font-medium">Legend</p>
            <div className="space-y-2">
              {layer.legend.map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-6 rounded-sm" style={{ background: l.color }} />
                  <span className="text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {selectedPlant && (
            <Card className="p-4 border-border/60 shadow-none">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Plant detail</p>
                <button onClick={() => setSelectedPlant(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {selectedPlant.ndvi_category && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: (() => {
                      if (selectedPlant.is_noise) return "#94a3b8";
                      switch (selectedPlant.ndvi_category) {
                        case "Very Good Vegetation": return "#16a34a";
                        case "Good Vegetation":      return "#22c55e";
                        case "Moderate Vegetation":  return "#eab308";
                        case "Sparse Vegetation":    return "#f97316";
                        case "Bare / Stressed":      return "#ef4444";
                        default: return "#22c55e";
                      }
                    })() }}
                  />
                  <span className="text-xs font-medium">{selectedPlant.ndvi_category}</span>
                  {selectedPlant.ndvi != null && (
                    <span className="text-[11px] text-muted-foreground ml-auto">NDVI {selectedPlant.ndvi.toFixed(3)}</span>
                  )}
                </div>
              )}
              <dl className="space-y-1.5 text-xs">
                {[
                  ["ID",       selectedPlant.plant_id],
                  ["Sector",   selectedPlant.sector_label],
                  ["Row",      selectedPlant.row_index],
                  ["Column",   selectedPlant.col_index],
                  ["Area",     selectedPlant.area_px != null ? `${selectedPlant.area_px} px` : null],
                  ["Growth",   selectedPlant.predicted_growth_stage_name],
                  ["Nitrogen", selectedPlant.predicted_nitrogen_status],
                  ["Est. yield", selectedPlant.predicted_yield_kg != null ? `${selectedPlant.predicted_yield_kg.toFixed(1)} kg` : null],
                  ["NDRE",     selectedPlant.ndre_category],
                ].map(([label, value]) =>
                  value != null ? (
                    <div key={label as string} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground shrink-0">{label}</dt>
                      <dd
                        className="font-medium text-right truncate"
                        style={label === "Nitrogen" && value === "Deficient" ? { color: "#ef4444" } : undefined}
                      >
                        {String(value)}
                      </dd>
                    </div>
                  ) : null
                )}
              </dl>
            </Card>
          )}
        </div>

        <Card className="p-0 border-border/60 shadow-none overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Find block, coordinate…" className="h-8 w-56 rounded-md border border-input bg-muted/30 pl-7 pr-2 text-xs" />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2.5 text-xs" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Manual Mapping
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(true)}><Maximize2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <MapView
            layer={layer}
            active={active}
            opacity={opacity}
            plantsSeed={plantsSeed}
            onPlantSelect={setSelectedPlant}
            onViewChange={(center, zoom) => setMapView({ center, zoom })}
            className="h-[560px] rounded-none border-0"
          />
          <div className="border-t border-border/60 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {farm.name}</span>
            <span>Last capture · 6 Jun 2026</span>
          </div>
        </Card>
      </div>

      {editOpen && (
        <PlantEditorOverlay
          onClose={() => setEditOpen(false)}
          onSaved={() => setPlantsSeed(s => s + 1)}
          tileLayer={layer.tileLayer}
          initialView={mapView}
        />
      )}

      {expanded && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="relative w-[95vw] h-[90vh] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/60 bg-background"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-[9999] flex items-center justify-center rounded-full bg-background/90 p-1.5 shadow-md backdrop-blur hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <MapView
              layer={layer}
              active={active}
              opacity={opacity}
              onPlantSelect={setSelectedPlant}
              className="h-full w-full"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
