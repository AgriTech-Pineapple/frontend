"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { useFarm } from "@/lib/hooks";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

export default function Page() {
  const { farm } = useFarm();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`Farm Intelligence · ${farm.name}`} title="Historical Monitoring" description="Long-range trends across imagery captures." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Captures (12 mo)" value={farm.kpis.history.captures12mo} hint="surveys logged" />
        <KpiCard label="NDVI Δ vs 2025" value={farm.kpis.history.ndviDelta} hint="estate mean" accent="olive" delta="Improving" />
        <KpiCard label="Yield Δ vs 2025" value={farm.kpis.history.yieldDelta} hint="t/ha" accent="harvest" />
        <KpiCard label="Stress events" value={farm.kpis.history.stress} hint="last 6 months" accent="clay" />
      </div>

      <Card className="p-6 border-border/60 shadow-none">
        <h3 className="font-display text-lg font-semibold">6-month trends</h3>
        <p className="text-xs text-muted-foreground mb-4">NDVI, NDRE, SAVI and yield (t/ha) across the last six months of captures.</p>
        <div className="h-80">
          <ResponsiveContainer>
            <LineChart data={farm.history}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="r" orientation="right" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="l" type="monotone" dataKey="NDVI" stroke="var(--sage-deep)" strokeWidth={2} dot={false} />
              <Line yAxisId="l" type="monotone" dataKey="NDRE" stroke="var(--olive)" strokeWidth={2} dot={false} />
              <Line yAxisId="l" type="monotone" dataKey="SAVI" stroke="var(--harvest)" strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="Yield" name="Yield t/ha" stroke="var(--clay)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border/60 shadow-none">
        <div className="border-b border-border/60 p-5"><h3 className="font-display text-lg font-semibold">Recent captures</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Mission</th>
                <th className="px-5 py-3 text-left font-medium">Pilot</th>
                <th className="px-5 py-3 text-left font-medium">Drone</th>
                <th className="px-5 py-3 text-left font-medium">Coverage</th>
                <th className="px-5 py-3 text-left font-medium">GSD</th>
              </tr>
            </thead>
            <tbody>
              {farm.captures.map((c) => (
                <tr key={c.mission} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-5 py-3 whitespace-nowrap">{c.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.mission}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.pilot}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.drone}</td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">{c.coverage}</td>
                  <td className="px-5 py-3 font-medium tabular-nums">{c.gsd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
