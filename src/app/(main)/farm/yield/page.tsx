"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFarm } from "@/lib/hooks";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Page() {
  const { farm } = useFarm();
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`Farm Intelligence · ${farm.name}`} title="Yield Forecast" description="AI-driven projections for the upcoming harvest window." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Season forecast" value={farm.yieldForecast} hint={`${farm.confidence} model confidence`} delta={farm.yieldDelta} />
        <KpiCard label="Total tonnage" value={farm.totalTonnage} hint="estate-wide" accent="olive" />
        <KpiCard label="Harvest window" value={farm.harvestWindow} hint="peak months" accent="harvest" />
        <KpiCard label="Revenue projection" value={farm.revenue} hint="@ market spot" accent="clay" />
      </div>
      <Card className="p-6 border-border/60 shadow-none">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">6-month forecast band</h3>
            <p className="text-xs text-muted-foreground">Lower / expected / upper bound — tonnes per hectare, by month</p>
          </div>
          <Badge variant="outline" className="font-normal">Updated 2h ago</Badge>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={farm.monthlyBand}>
              <defs>
                <linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--sage)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--sage)" stopOpacity={0.05} /></linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="high" stroke="none" fill="url(#bd)" stackId="1" />
              <Area type="monotone" dataKey="mid" stroke="var(--sage-deep)" strokeWidth={2} fill="none" />
              <Area type="monotone" dataKey="low" stroke="none" fill="var(--background)" stackId="2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
