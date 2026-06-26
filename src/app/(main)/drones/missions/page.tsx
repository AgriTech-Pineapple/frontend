"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard, FieldMap } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";

const missions = [
  { id: "MX-219", area: "Sector 5 · 312 ha", drone: "Matrice 350", pilot: "D. Mariano", eta: "Active · 06:42", status: "Active" },
  { id: "MX-220", area: "Block A-1 · 42 ha", drone: "Matrice 350", pilot: "K. Reyes", eta: "Scheduled Thu 06:00", status: "Scheduled" },
  { id: "MX-221", area: "Estate composite · 1,247 ha", drone: "Phantom 4 RTK", pilot: "D. Mariano", eta: "Scheduled Sun 05:30", status: "Scheduled" },
  { id: "MX-218", area: "Sector 1 · 412 ha", drone: "Matrice 350", pilot: "D. Mariano", eta: "Completed today 05:54", status: "Completed" },
];

const statusStyle = (s: string) => {
  if (s === "Active") return "bg-harvest/25 text-clay border-0";
  if (s === "Completed") return "bg-sage/15 text-sage-deep border-0";
  return "bg-muted text-muted-foreground border-0";
};

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Drone Operations" title="Missions" description="Flight mission log and active survey tracking." actions={<Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">Plan mission</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active" value="1" icon={<Plane className="h-4 w-4" />} accent="harvest" />
        <KpiCard label="Scheduled" value="6" />
        <KpiCard label="Completed (mo)" value="22" accent="olive" />
        <KpiCard label="Coverage" value="3,148 ha" accent="sage" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 border-border/60 shadow-none lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Active mission · MX-219</h3>
            <Badge variant="secondary" className="bg-harvest/25 text-clay border-0">Live</Badge>
          </div>
          <FieldMap className="h-64" overlay="plain" label="Live flight · MX-219" />
          <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
            {[["Altitude", "82 m"], ["Speed", "8.4 m/s"], ["Battery", "68%"], ["ETA", "00:42:18"]].map(([k, v]) => (
              <div key={k} className="rounded-md bg-muted/30 p-2.5">
                <p className="text-muted-foreground">{k}</p>
                <p className="font-display text-base font-semibold mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-0 border-border/60 shadow-none">
          <div className="border-b border-border/60 p-4"><h3 className="font-display text-base font-semibold">Upcoming & recent</h3></div>
          <ul className="divide-y divide-border/60">
            {missions.map((m) => (
              <li key={m.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{m.id}</span>
                  <Badge variant="secondary" className={`text-[10px] font-normal ${statusStyle(m.status)}`}>{m.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{m.area}</p>
                <p className="text-xs text-muted-foreground">{m.drone} · {m.pilot}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.eta}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
