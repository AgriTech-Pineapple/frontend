"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard, FieldMap } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { useFarm } from "@/lib/hooks";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

export default function Page() {
  const { farm } = useFarm();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`Farm Intelligence · ${farm.name}`} title="Plant Count Analysis" description="AI-detected plant population and per-block density." />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total plants" value={farm.kpis.plants.total} hint="estate-wide" />
        <KpiCard label="Avg density" value={farm.kpis.plants.avgDensity} hint="target 2,200" accent="olive" />
        <KpiCard label="Blank spots" value={farm.kpis.plants.missing} hint="vs expected" accent="harvest" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Density by block</h3>
          <p className="text-xs text-muted-foreground mb-4">Plants per hectare — target 2,200</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={farm.densityByBlock}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="block" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[2000, 2300]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine y={2200} stroke="var(--sage-deep)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Target 2,200", position: "right", fontSize: 10, fill: "var(--sage-deep)" }} />
                <Bar dataKey="d" fill="var(--olive)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Detected gaps</h3>
          <FieldMap className="h-64 mt-3" overlay="plain" label="Blank-spot clusters" />
          <ul className="mt-4 space-y-2 text-sm">
            {farm.blockRows.slice(0, 3).map((b, i) => (
              <li key={b.id} className="flex justify-between">
                <span>Block {b.id} {["north","east","strip"][i]}</span>
                <span className="text-muted-foreground tabular-nums">{Math.round((b.plants * 0.006) - i * 100)} gaps</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
