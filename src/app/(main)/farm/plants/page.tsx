"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard, FieldMap } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { useFarm } from "@/lib/hooks";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

export default function Page() {
  const { farm } = useFarm();

  const HA_TO_ACRE = 2.47105;
  const densityByBlock = farm.blockRows.map((b) => ({ block: b.id, density: Math.round(b.density / HA_TO_ACRE) }));
  const surveyedPlants = farm.blockRows.reduce((sum, b) => sum + b.plants, 0);
  const surveyedArea = farm.blockRows.reduce((sum, b) => sum + b.area, 0) * HA_TO_ACRE;
  const avgDensity = surveyedArea > 0 ? Math.round(surveyedPlants / surveyedArea) : 0;
  const densities = densityByBlock.map((d) => d.density);
  const densityDomain: [number, number] = densities.length
    ? [Math.floor(Math.min(...densities) * 0.9 / 100) * 100, Math.ceil(Math.max(...densities) * 1.1 / 100) * 100]
    : [0, 0];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`Farm Intelligence · ${farm.name}`} title="Plant Count Analysis" description="AI-detected plant population and per-block density." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total plants" value={farm.kpis.plants.total} hint="estate-wide" />
        <KpiCard label="Avg density" value={farm.kpis.plants.avgDensity} hint="target 2,200" accent="olive" />
        <KpiCard label="Blank spots" value="Not available" hint="data not available yet" accent="harvest" />
        <KpiCard label="Median spacing" value={farm.kpis.plants.medianSpacing} hint="nearest-neighbour" accent="sage" />
        <KpiCard label="Mean spacing" value={farm.kpis.plants.meanSpacing} hint="nearest-neighbour" accent="olive" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Density by block</h3>
          <p className="text-xs text-muted-foreground mb-4">Plants per acre — from the latest sector survey</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={densityByBlock}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="block" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={densityDomain} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(value) => [`${value}/ac`, "Density"] as [string, string]} />
                <ReferenceLine y={avgDensity} stroke="var(--sage-deep)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Avg ${avgDensity.toLocaleString('en-US')}`, position: "right", fontSize: 10, fill: "var(--sage-deep)" }} />
                <Bar dataKey="density" fill="var(--olive)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Detected gaps</h3>
          <FieldMap className="h-64 mt-3" overlay="none" showPins={false} label="Not available yet" />
          <p className="mt-4 text-sm text-muted-foreground">
            Gap detection data isn&apos;t available at the moment.
          </p>
        </Card>
      </div>
    </div>
  );
}
