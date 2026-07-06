"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageHeader } from "@/components/page-header";
import { FieldMap } from "@/components/farm-ui";
import { TileMap, statusColor, type PlantProperties } from "@/components/tile-map";
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
  /** true = render TileMap from the tiler; false = CSS mock */
  hasTiles: boolean;
  /** tiler layer name; undefined = default /tiles/ endpoint (RGB) */
  tileLayer?: string;
}[] = [
  { key: "composite", label: "Composite", overlay: "health", hasTiles: true, tileLayer: undefined },
  { key: "ndvi", label: "NDVI", overlay: "ndvi", hasTiles: true, tileLayer: "ndvi" },
  { key: "ndre", label: "NDRE", overlay: "ndre", hasTiles: true, tileLayer: "ndre" },
  { key: "health", label: "Health", overlay: "health", hasTiles: false },
  { key: "terrain", label: "Terrain", overlay: "terrain", hasTiles: false },
  { key: "yield", label: "Yield", overlay: "yield", hasTiles: false },
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
  /** 0-100, applied to the plant datapoint markers (not the base imagery). */
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
        plantsOpacity={opacity / 100}
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
            <p className="mb-2 text-sm font-medium">Datapoint opacity</p>
            <Slider value={[opacity]} onValueChange={(v) => setOpacity(v[0])} max={100} step={1} />
            <p className="mt-3 mb-2 text-sm font-medium">Date</p>
            <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs">
              {farm.captures.slice(0, 3).map((c) => (
                <option key={c.mission}>{c.date} · {c.mission}</option>
              ))}
            </select>
          </Card>
          {selectedPlant && (
            <Card className="p-4 border-border/60 shadow-none">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Plant detail</p>
                <button onClick={() => setSelectedPlant(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {selectedPlant.health_status && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: selectedPlant.health_color || statusColor(selectedPlant.health_status) }}
                  />
                  <span className="text-xs font-medium">{selectedPlant.health_status}</span>
                  {selectedPlant.health_score != null && (
                    <span className="text-[11px] text-muted-foreground ml-auto">Score {selectedPlant.health_score.toFixed(0)}</span>
                  )}
                </div>
              )}
              <dl className="space-y-1.5 text-xs">
                {[
                  ["ID",       selectedPlant.plant_id],
                  ["Sector",   selectedPlant.sector_label],
                  ["Row",      selectedPlant.row_index],
                  ["Column",   selectedPlant.col_index],
                  ["NDVI",     selectedPlant.ndvi != null ? selectedPlant.ndvi.toFixed(3) : null],
                  ["NDRE",     selectedPlant.ndre != null ? selectedPlant.ndre.toFixed(3) : null],
                  ["OSAVI",    selectedPlant.osavi != null ? selectedPlant.osavi.toFixed(3) : null],
                  ["Health",   selectedPlant.health_status != null && selectedPlant.health_score != null
                                 ? `${selectedPlant.health_status} (${selectedPlant.health_score.toFixed(2)})`
                                 : (selectedPlant.health_status ?? (selectedPlant.health_score != null ? selectedPlant.health_score.toFixed(2) : null))],
                  ["Growth",   selectedPlant.predicted_growth_stage_name],
                  ["Nitrogen", selectedPlant.predicted_nitrogen_status],
                  ["Est. yield", selectedPlant.predicted_yield_kg != null ? `${selectedPlant.predicted_yield_kg.toFixed(1)} kg` : null],
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
