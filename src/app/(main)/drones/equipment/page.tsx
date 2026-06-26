"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Wrench, Battery } from "lucide-react";

const drones = [
  { id: "M350-01", model: "DJI Matrice 350 RTK", payload: "P1 + L1", hours: "412 h", battery: 92, status: "Ready", maint: "in 8 flights" },
  { id: "M350-02", model: "DJI Matrice 350 RTK", payload: "Multispectral MS-7", hours: "318 h", battery: 68, status: "Active", maint: "in 12 flights" },
  { id: "P4RTK-03", model: "Phantom 4 RTK", payload: "RGB", hours: "684 h", battery: 100, status: "Ready", maint: "due now" },
  { id: "M30T-04", model: "Matrice 30T", payload: "Thermal + RGB", hours: "204 h", battery: 84, status: "Ready", maint: "in 22 flights" },
  { id: "M350-05", model: "DJI Matrice 350 RTK", payload: "LiDAR L2", hours: "126 h", battery: 0, status: "Maintenance", maint: "in service" },
];

const statusStyle = (s: string) => {
  if (s === "Ready") return "bg-sage/15 text-sage-deep border-0";
  if (s === "Active") return "bg-harvest/25 text-clay border-0";
  return "bg-muted text-muted-foreground border-0";
};

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Drone Operations" title="Equipment" description="Fleet inventory, airframe hours and maintenance schedules." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total drones" value="5" icon={<Plane className="h-4 w-4" />} />
        <KpiCard label="Ready" value="3" accent="sage" />
        <KpiCard label="In service" value="1" icon={<Wrench className="h-4 w-4" />} accent="harvest" />
        <KpiCard label="Fleet hours" value="1,744h" accent="olive" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drones.map((d) => (
          <Card key={d.id} className="p-5 border-border/60 shadow-none">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-base font-semibold">{d.id}</p>
                <p className="text-xs text-muted-foreground">{d.model}</p>
              </div>
              <Badge variant="secondary" className={`font-normal text-[10px] ${statusStyle(d.status)}`}>{d.status}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Payload · {d.payload}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md bg-muted/30 p-2.5">
                <p className="text-muted-foreground">Airframe hrs</p>
                <p className="font-display text-base font-semibold mt-0.5">{d.hours}</p>
              </div>
              <div className="rounded-md bg-muted/30 p-2.5">
                <p className="text-muted-foreground flex items-center gap-1"><Battery className="h-3 w-3" /> Battery</p>
                <p className="font-display text-base font-semibold mt-0.5">{d.battery}%</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Maintenance · {d.maint}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
