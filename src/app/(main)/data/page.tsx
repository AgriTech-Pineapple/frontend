"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UploadCloud, Database, FileImage, Map as MapIcon } from "lucide-react";

const datasets = [
  { name: "Estate orthomosaic · 6 Jun 2026", type: "GeoTIFF", size: "4.2 GB", source: "MX-218", status: "Processed" },
  { name: "NDVI composite · 6 Jun 2026", type: "GeoTIFF", size: "812 MB", source: "MX-218", status: "Processed" },
  { name: "Terrain scan · Sector 5", type: "GeoTIFF", size: "1.1 GB", source: "MX-198", status: "Processing" },
  { name: "Field boundaries · 2026", type: "Shapefile", size: "12 MB", source: "GIS team", status: "Active" },
  { name: "Harvest records · May 2026", type: "CSV", size: "184 KB", source: "Field forms", status: "Active" },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="System" title="Data Management" description="Imagery uploads, GIS datasets and field-form data with processing status." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Datasets" value="184" hint="across estate" icon={<Database className="h-4 w-4"/>} />
        <KpiCard label="Storage used" value="612 GB" hint="of 2 TB" accent="olive" />
        <KpiCard label="Processing" value="3" hint="queued" accent="harvest" />
        <KpiCard label="Last sync" value="12 min ago" accent="sage" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { icon: FileImage, t: "Upload drone imagery", d: "Raw, multispectral, thermal or RGB captures.", a: "Upload imagery" },
          { icon: MapIcon, t: "Import GIS data", d: "Shapefiles, GeoJSON, KML, GeoTIFF.", a: "Import GIS" },
          { icon: UploadCloud, t: "Connect data source", d: "Sensors, weather stations, ERP exports.", a: "Connect" },
        ].map((c) => (
          <Card key={c.t} className="p-6 border-border/60 shadow-none border-dashed border-2 hover:border-sage/40 transition cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage/15 text-sage-deep"><c.icon className="h-5 w-5"/></div>
            <h3 className="mt-3 font-display text-lg font-semibold">{c.t}</h3>
            <p className="text-xs text-muted-foreground">{c.d}</p>
            <Button variant="outline" size="sm" className="mt-4 w-full">{c.a}</Button>
          </Card>
        ))}
      </div>
      <Card className="border-border/60 shadow-none">
        <div className="border-b border-border/60 p-5"><h3 className="font-display text-lg font-semibold">Datasets</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-5 py-3 text-left font-medium">Name</th><th className="px-5 py-3 text-left font-medium">Type</th><th className="px-5 py-3 text-left font-medium">Size</th><th className="px-5 py-3 text-left font-medium">Source</th><th className="px-5 py-3 text-left font-medium">Status</th></tr>
          </thead>
          <tbody>
            {datasets.map((d) => (
              <tr key={d.name} className="border-t border-border/60 hover:bg-muted/20">
                <td className="px-5 py-3 font-medium">{d.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{d.type}</td>
                <td className="px-5 py-3 text-muted-foreground">{d.size}</td>
                <td className="px-5 py-3 text-muted-foreground">{d.source}</td>
                <td className="px-5 py-3"><Badge variant="secondary" className={`border-0 font-normal ${d.status==="Processed"||d.status==="Active"?"bg-sage/15 text-sage-deep":d.status==="Processing"?"bg-harvest/25 text-clay":"bg-muted text-muted-foreground"}`}>{d.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
