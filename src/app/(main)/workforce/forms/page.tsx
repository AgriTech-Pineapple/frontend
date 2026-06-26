"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Droplets, Wheat, Bug, Plane, ClipboardList } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const forms: { name: string; icon: LucideIcon; fields: number; used: number; updated: string }[] = [
  { name: "Planting Record", icon: Sprout, fields: 11, used: 142, updated: "2d ago" },
  { name: "Irrigation Log", icon: Droplets, fields: 8, used: 318, updated: "1d ago" },
  { name: "Fertilizer Application", icon: Wheat, fields: 14, used: 96, updated: "3d ago" },
  { name: "Disease Inspection", icon: Bug, fields: 16, used: 64, updated: "5d ago" },
  { name: "Drone Survey", icon: Plane, fields: 9, used: 48, updated: "today" },
  { name: "Harvest Record", icon: ClipboardList, fields: 12, used: 210, updated: "today" },
];

const recent = [
  { name: "Harvest Record · Block A-2", worker: "M. Delgado", ago: "12 min ago" },
  { name: "Drone Survey · MX-218", worker: "D. Mariano", ago: "2h ago" },
  { name: "Irrigation Log · Block B-1", worker: "P. Ocampo", ago: "4h ago" },
  { name: "Disease Inspection · Block C-3", worker: "L. Santos", ago: "yesterday" },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Workforce" title="Field Forms" description="Standardised data-collection forms deployed to field teams." actions={<Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">New form</Button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((f) => (
          <Card key={f.name} className="p-5 border-border/60 shadow-none">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage/15 text-sage-deep"><f.icon className="h-5 w-5" /></div>
              <Badge variant="outline" className="font-normal text-[10px]">v1.4</Badge>
            </div>
            <h3 className="mt-3 font-display text-base font-semibold">{f.name}</h3>
            <p className="text-xs text-muted-foreground">{f.fields} fields · updated {f.updated}</p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{f.used} submissions</span>
              <span className="font-medium text-sage-deep">View →</span>
            </div>
          </Card>
        ))}
      </div>
      <Card className="border-border/60 shadow-none">
        <div className="border-b border-border/60 p-5"><h3 className="font-display text-lg font-semibold">Recent submissions</h3></div>
        <ul className="divide-y divide-border/60">
          {recent.map((r) => (
            <li key={r.name} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.worker} · {r.ago}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">View</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
