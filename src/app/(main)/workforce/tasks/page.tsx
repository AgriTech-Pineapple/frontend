"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tasks = [
  { id: "T-2148", title: "Harvest Block A-2 sector 3", team: "Bravo", lead: "A. Tan", due: "Today 17:00", progress: 72, status: "In Progress" },
  { id: "T-2151", title: "Foliar feed Block B-1", team: "Charlie", lead: "P. Ocampo", due: "Fri 09:00", progress: 0, status: "Not Started" },
  { id: "T-2143", title: "Drip line inspection Block C-3", team: "Charlie", lead: "P. Ocampo", due: "Yesterday", progress: 40, status: "Overdue" },
  { id: "T-2138", title: "Replanting · Block D-1 north", team: "Delta", lead: "I. Cruz", due: "Mon 14:00", progress: 100, status: "Completed" },
  { id: "T-2156", title: "Drone survey · Sector 5", team: "Skyline", lead: "D. Mariano", due: "Today 06:30", progress: 100, status: "Completed" },
  { id: "T-2160", title: "Soil moisture sampling", team: "Science", lead: "L. Santos", due: "Wed 11:00", progress: 25, status: "In Progress" },
];

const statusTone = (s: string) => {
  if (s === "Not Started") return "bg-muted text-muted-foreground";
  if (s === "In Progress") return "bg-harvest/25 text-clay";
  if (s === "Completed") return "bg-sage/15 text-sage-deep";
  return "bg-clay/15 text-clay";
};

export default function Page() {
  const notStarted = tasks.filter((t) => t.status === "Not Started").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter((t) => t.status === "Overdue").length;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Workforce" title="Tasks" description="Block-level work assignments with real-time progress." actions={<Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">New task</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Not started" value={String(notStarted)} />
        <KpiCard label="In progress" value={String(inProgress)} accent="harvest" />
        <KpiCard label="Completed today" value={String(completed)} accent="sage" />
        <KpiCard label="Overdue" value={String(overdue)} accent="clay" />
      </div>
      <Card className="border-border/60 shadow-none">
        <div className="border-b border-border/60 p-5"><h3 className="font-display text-lg font-semibold">All tasks</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Task</th>
              <th className="px-5 py-3 text-left font-medium">Team</th>
              <th className="px-5 py-3 text-left font-medium">Due</th>
              <th className="px-5 py-3 text-left font-medium">Progress</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t border-border/60 hover:bg-muted/20">
                <td className="px-5 py-3">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">{t.id} · {t.lead}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{t.team}</td>
                <td className="px-5 py-3 text-muted-foreground">{t.due}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-sage-deep" style={{ width: `${t.progress}%` }} />
                    </div>
                    <span className="text-xs">{t.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge variant="secondary" className={`border-0 font-normal ${statusTone(t.status)}`}>{t.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
