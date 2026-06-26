"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const teams = [
  { name: "Alpha", lead: "E. Rivera", size: 28, focus: "Field operations", load: 82, perf: 94 },
  { name: "Bravo", lead: "A. Tan", size: 32, focus: "Harvesting", load: 91, perf: 92 },
  { name: "Charlie", lead: "P. Ocampo", size: 24, focus: "Irrigation", load: 68, perf: 90 },
  { name: "Delta", lead: "I. Cruz", size: 26, focus: "Planting", load: 74, perf: 93 },
  { name: "Science", lead: "L. Santos", size: 12, focus: "Agronomy & QA", load: 60, perf: 97 },
  { name: "Skyline", lead: "D. Mariano", size: 8, focus: "Drone operations", load: 71, perf: 95 },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Workforce" title="Teams" description="Team structure, workload distribution and comparative performance." actions={<Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">Reorganize</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Active teams" value="6" hint="130 workers assigned" />
        <KpiCard label="Avg utilization" value="74%" hint="weekly mean" accent="olive" />
        <KpiCard label="Top performer" value="Science" hint="97 perf · 12 ppl" accent="sage" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Workload by team</h3>
          <p className="text-xs text-muted-foreground mb-4">% capacity utilized this week</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={teams} layout="vertical">
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[0,100]} />
                <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={64} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="load" fill="var(--olive)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Performance comparison</h3>
          <p className="text-xs text-muted-foreground mb-4">Composite score · last 30 days</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={teams}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={[80, 100]} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="perf" fill="var(--sage-deep)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((t) => (
          <Card key={t.name} className="p-5 border-border/60 shadow-none">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.focus}</p>
              </div>
              <Badge variant="secondary" className="bg-sage/15 text-sage-deep border-0 font-normal">{t.size} members</Badge>
            </div>
            <p className="mt-3 text-sm">Lead · <span className="text-muted-foreground">{t.lead}</span></p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md bg-muted/30 p-2.5"><p className="text-muted-foreground">Workload</p><p className="font-display text-lg">{t.load}%</p></div>
              <div className="rounded-md bg-muted/30 p-2.5"><p className="text-muted-foreground">Performance</p><p className="font-display text-lg">{t.perf}</p></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
