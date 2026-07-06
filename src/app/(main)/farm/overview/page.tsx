"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { KpiCard, FieldMap } from "@/components/farm-ui";
import { TileMap } from "@/components/tile-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, X } from "lucide-react";
import { useFarm } from "@/lib/hooks";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Page() {
  const { farm } = useFarm();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

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

  const HA_TO_ACRE = 2.47105;
  const surveyedPlants = farm.blockRows.reduce((sum, b) => sum + b.plants, 0);
  const surveyedArea = farm.blockRows.reduce((sum, b) => sum + b.area, 0) * HA_TO_ACRE;
  const surveyedCanopy = farm.blockRows.reduce((sum, b) => sum + b.totalCanopy, 0);
  const surveyedDensity = surveyedArea > 0 ? Math.round(surveyedPlants / surveyedArea) : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Farm Intelligence"
        title={farm.name}
        description={`${farm.subtitle} · established ${farm.established} · ${farm.blocks} blocks across ${farm.area}.`}
        actions={
          <div className="flex flex-col items-stretch gap-2 md:w-auto md:min-w-[260px]">
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Change Farm
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Generate report</Button>
              <Button size="sm" className="flex-1 bg-sage-deep hover:bg-sage-deep/90">Edit metadata</Button>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total area" value={farm.area} hint={`${farm.blocks} blocks`} />
        <KpiCard label="Plant population" value={farm.plants} hint={`≈ ${farm.density}`} accent="olive" />
        <KpiCard label="Healthy canopy" value={farm.healthyPct} hint="last imagery 4h ago" accent="sage" delta={farm.kpis.health.ndviDelta} />
        <KpiCard label="Yield Prediction" value={farm.yieldForecast} hint={`${farm.confidence} confidence`} accent="harvest" delta={farm.yieldDelta} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3 border-border/60 shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Estate boundary</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal">Composite layer</Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(true)}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <TileMap className="h-80 rounded-xl" label={`${farm.name} · composite layer`} />
        </Card>

        <Card className="p-6 lg:col-span-2 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Estate metadata</h3>
          <dl className="mt-4 divide-y divide-border/60 text-sm">
            {[
              ["Crop", farm.crop], ["Estate type", farm.estateType], ["Established", farm.established],
              ["Soil profile", farm.soil], ["Avg elevation", farm.elevation],
              ["Climate zone", farm.climate], ["Irrigation", farm.irrigation], ["Manager", farm.manager],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card className="p-6 border-border/60 shadow-none">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Yield Prediction</h3>
            <p className="text-xs text-muted-foreground">Yearly expected vs actual yield (t/ha) · {farm.crop} planted each year</p>
          </div>
          <Badge variant="secondary" className="bg-sage/15 text-sage-deep border-0">{farm.yieldDelta}</Badge>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={farm.yearlyYield}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(value, name) => {
                  if (name === "crop") return ["", ""] as [string, string];
                  return [`${value} t/ha`, name as string] as [string, string];
                }}
                labelFormatter={(label, payload: Array<{ payload?: Record<string, unknown> }>) => {
                  const c = payload?.[0]?.payload?.crop;
                  return c ? `${label} · ${c}` : label;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="expected" name="Expected" stroke="var(--olive)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--sage-deep)" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border/60 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Block parameters</h3>
            <p className="text-xs text-muted-foreground">Per-block plant count, canopy &amp; density from the latest drone sector survey</p>
          </div>
          <p className="text-xs text-muted-foreground">{farm.blockRows.length} of {farm.blocks} shown</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
          {[
            ["Plants surveyed", surveyedPlants.toLocaleString('en-US')],
            ["Area surveyed", `${surveyedArea.toFixed(4)} ac`],
            ["Avg density", `${surveyedDensity.toLocaleString('en-US')}/ac`],
            ["Total canopy", `${surveyedCanopy.toFixed(2)} m²`],
          ].map(([k, v]) => (
            <div key={k} className="bg-card px-5 py-3">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="font-num text-lg font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Block</th>
                <th className="px-5 py-3 text-left font-medium">Plants</th>
                <th className="px-5 py-3 text-left font-medium">Area</th>
                <th className="px-5 py-3 text-left font-medium">Density</th>
                <th className="px-5 py-3 text-left font-medium">Mean canopy</th>
                <th className="px-5 py-3 text-left font-medium">Total canopy</th>
              </tr>
            </thead>
            <tbody>
              {farm.blockRows.map((b) => (
                <tr key={b.id} className="border-t border-border/60 hover:bg-muted/20" title={`Centroid ${b.centroidX}, ${b.centroidY}`}>
                  <td className="px-5 py-3 font-medium">{b.id}</td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{b.plants.toLocaleString('en-US')}</td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{(b.area * HA_TO_ACRE).toFixed(4)} ac</td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{Math.round(b.density / HA_TO_ACRE).toLocaleString('en-US')}/ac</td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{b.meanCanopy.toLocaleString('en-US')} cm²</td>
                  <td className="px-5 py-3 font-medium tabular-nums">{b.totalCanopy.toFixed(2)} m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 border-border/60 shadow-none">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Mean canopy size by block</h3>
            <p className="text-xs text-muted-foreground">Average canopy area per plant (cm²) — from sector survey</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={farm.blockRows}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="id" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(value) => [`${value} cm²`, "Mean canopy"] as [string, string]}
              />
              <Bar dataKey="meanCanopy" fill="var(--olive)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
            <TileMap className="h-full w-full" label={`${farm.name} · composite layer`} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
