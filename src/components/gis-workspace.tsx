"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FieldMap, LegendSwatch } from "@/components/farm-ui";
import { TileMap } from "@/components/tile-map";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Layers, Search, Maximize2, Compass } from "lucide-react";

const layers = [
  { url: "/gis/map", label: "Composite", o: "health" as const },
  { url: "/gis/ndvi", label: "NDVI", o: "ndvi" as const },
  { url: "/gis/ndre", label: "NDRE", o: "ndre" as const },
  { url: "/gis/health", label: "Health", o: "health" as const },
  { url: "/gis/terrain", label: "Terrain", o: "terrain" as const },
  { url: "/gis/yield", label: "Yield", o: "yield" as const },
];

export function GisWorkspace({
  overlay, title, description, legend, tileLayer,
}: {
  overlay: "ndvi" | "ndre" | "health" | "terrain" | "yield" | "plain";
  title: string;
  description: string;
  legend: { color: string; label: string }[];
  /** When set, renders a live TileMap from the tiler instead of the CSS mock. */
  tileLayer?: string;
}) {
  const pathname = usePathname();
  const [opacity, setOpacity] = useState(78);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="GIS Mapping"
        title={title}
        description={description}
        actions={
          <>
            <Button variant="outline" size="sm">Export GeoTIFF</Button>
            <Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">Compare dates</Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted/30 p-1 w-fit">
        {layers.map((l) => (
          <Link
            key={l.url}
            href={l.url}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              pathname === l.url ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card className="p-4 border-border/60 shadow-none">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium"><Layers className="h-3.5 w-3.5" /> Layers</div>
              <Badge variant="outline" className="font-normal text-[10px]">7 active</Badge>
            </div>
            <ul className="space-y-2.5 text-sm">
              {["Estate boundaries", "Block divisions", "Irrigation lines", "Pathways", "Drone flight paths", "Sample points", "Stress hotspots"].map((n, i) => (
                <li key={n} className="flex items-center gap-2">
                  <Checkbox defaultChecked={i < 5} id={n} />
                  <label htmlFor={n} className="text-xs text-muted-foreground cursor-pointer">{n}</label>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4 border-border/60 shadow-none">
            <p className="mb-2 text-sm font-medium">Opacity</p>
            <Slider
              value={[opacity]}
              onValueChange={([v]) => setOpacity(v)}
              max={100}
              step={1}
            />
            <p className="mt-3 mb-2 text-sm font-medium">Date</p>
            <select className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs">
              <option>6 Jun 2026 · MX-218</option>
              <option>30 May 2026 · MX-212</option>
              <option>22 May 2026 · MX-207</option>
            </select>
          </Card>
          <Card className="p-4 border-border/60 shadow-none">
            <p className="mb-3 text-sm font-medium">Legend</p>
            <div className="space-y-2">
              {legend.map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-6 rounded-sm" style={{ background: l.color }} />
                  <span className="text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-0 border-border/60 shadow-none overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Find block, coordinate…" className="h-8 w-56 rounded-md border border-input bg-muted/30 pl-7 pr-2 text-xs" />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Compass className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          {tileLayer ? (
            <TileMap
              className="h-[560px] rounded-none border-0"
              layer={tileLayer}
              opacity={opacity / 100}
              label={`${title} · 6 Jun 2026`}
            />
          ) : (
            <FieldMap className="h-[560px] rounded-none border-0" overlay={overlay} label={`${title} · 6 Jun 2026`} />
          )}
          <div className="border-t border-border/60 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>EPSG:4326 · WGS 84</span>
            <LegendSwatch items={legend.slice(0, 4)} />
          </div>
        </Card>
      </div>
    </div>
  );
}
