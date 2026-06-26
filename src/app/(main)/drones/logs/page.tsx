"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const logs = [
  { id: "FL-3142", mission: "MX-218", drone: "M350-02", pilot: "D. Mariano", date: "6 Jun · 05:54", dur: "1h 12m", dist: "38 km", status: "Nominal" },
  { id: "FL-3138", mission: "MX-212", drone: "M350-01", pilot: "K. Reyes", date: "30 May · 06:12", dur: "2h 48m", dist: "94 km", status: "Nominal" },
  { id: "FL-3134", mission: "MX-207", drone: "P4RTK-03", pilot: "D. Mariano", date: "22 May · 06:08", dur: "1h 44m", dist: "52 km", status: "Aborted" },
  { id: "FL-3128", mission: "MX-201", drone: "M350-01", pilot: "D. Mariano", date: "14 May · 05:48", dur: "2h 50m", dist: "92 km", status: "Nominal" },
  { id: "FL-3122", mission: "MX-198", drone: "M350-02", pilot: "K. Reyes", date: "8 May · 06:20", dur: "1h 02m", dist: "32 km", status: "Nominal" },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Drone Operations" title="Flight Logs" description="Searchable archive of all flight events." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Flights (mo)" value="38" />
        <KpiCard label="Flight hours" value="62.4h" accent="olive" />
        <KpiCard label="Distance" value="1,842km" accent="sage" />
        <KpiCard label="Incidents" value="1" accent="clay" />
      </div>
      <Card className="border-border/60 shadow-none">
        <div className="border-b border-border/60 p-5"><h3 className="font-display text-lg font-semibold">Flight log</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Flight</th>
                <th className="px-5 py-3 text-left font-medium">Mission</th>
                <th className="px-5 py-3 text-left font-medium">Drone / Pilot</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Duration</th>
                <th className="px-5 py-3 text-left font-medium">Distance</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium">{l.id}</td>
                  <td className="px-5 py-3 text-muted-foreground">{l.mission}</td>
                  <td className="px-5 py-3 text-muted-foreground">{l.drone} · {l.pilot}</td>
                  <td className="px-5 py-3 text-muted-foreground">{l.date}</td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">{l.dur}</td>
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">{l.dist}</td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className={`border-0 font-normal ${l.status === "Nominal" ? "bg-sage/15 text-sage-deep" : "bg-clay/15 text-clay"}`}>{l.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
