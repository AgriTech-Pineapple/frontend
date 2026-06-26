"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { useFarm } from "@/lib/hooks";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Page() {
  const { farm } = useFarm();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`Farm Intelligence · ${farm.name}`} title="Growth Analysis" description="Canopy distribution, uniformity and variance across cultivated blocks." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Avg canopy cover" value={farm.kpis.growth.canopy} hint="estate-wide" delta={farm.kpis.growth.canopyDelta} />
        <KpiCard label="Growth uniformity" value={farm.kpis.growth.uniformity} hint="index 0–100" accent="olive" />
        <KpiCard label="Mean variance" value={farm.kpis.growth.variance} hint="block-to-block" accent="harvest" />
        <KpiCard label="Stage" value={farm.kpis.growth.stage} hint="this season" accent="sage" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Canopy cover progression</h3>
          <p className="text-xs text-muted-foreground mb-4">Cumulative % cover this season</p>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={farm.canopy}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--olive)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--olive)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="wk" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="c" stroke="var(--olive)" strokeWidth={2} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Variance by block</h3>
          <p className="text-xs text-muted-foreground mb-4">Higher = less uniform growth</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={farm.variance}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="block" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="v" fill="var(--clay)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
