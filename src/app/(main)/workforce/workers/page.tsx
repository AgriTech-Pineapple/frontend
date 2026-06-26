"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/farm-ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MapPin } from "lucide-react";

const workers = [
  { id: "WK-0142", name: "Esteban Rivera", role: "Field Lead", team: "Alpha", location: "Block C-3", status: "On duty", perf: 94 },
  { id: "WK-0118", name: "Liwayway Santos", role: "Agronomist", team: "Science", location: "Lab", status: "On duty", perf: 97 },
  { id: "WK-0087", name: "Marcos Delgado", role: "Harvester", team: "Bravo", location: "Block A-2", status: "On duty", perf: 89 },
  { id: "WK-0203", name: "Pilar Ocampo", role: "Irrigator", team: "Charlie", location: "Block B-1", status: "Break", perf: 91 },
  { id: "WK-0167", name: "Diego Mariano", role: "Drone Pilot", team: "Skyline", location: "Hangar", status: "Off duty", perf: 92 },
  { id: "WK-0231", name: "Aurora Tan", role: "Supervisor", team: "Bravo", location: "Block A-1", status: "On duty", perf: 95 },
  { id: "WK-0099", name: "Ramon Velasco", role: "Harvester", team: "Bravo", location: "Block C-4", status: "On duty", perf: 88 },
  { id: "WK-0254", name: "Imelda Cruz", role: "Field Lead", team: "Delta", location: "Block D-2", status: "On duty", perf: 93 },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workforce"
        title="Workers"
        description="Directory of plantation staff with live status and performance signals."
        actions={<><Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5" />Filter</Button><Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">Add worker</Button></>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total workers" value="168" hint="across 6 teams" />
        <KpiCard label="On duty now" value="142" hint="84.5%" accent="olive" />
        <KpiCard label="Avg performance" value="92.1" hint="rolling 30 days" accent="sage" />
        <KpiCard label="Open positions" value="4" hint="recruiting" accent="harvest" />
      </div>
      <Card className="border-border/60 shadow-none">
        <div className="flex items-center gap-3 border-b border-border/60 p-4">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search worker, ID, role…" className="h-9 pl-8 bg-muted/30 border-transparent" />
          </div>
          <div className="hidden md:flex gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-normal">All teams</Badge>
            <Badge variant="outline" className="font-normal">All roles</Badge>
            <Badge variant="outline" className="font-normal">Status: any</Badge>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Worker</th>
              <th className="px-5 py-3 text-left font-medium">Role</th>
              <th className="px-5 py-3 text-left font-medium">Team</th>
              <th className="px-5 py-3 text-left font-medium">Location</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Performance</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.id} className="border-t border-border/60 hover:bg-muted/20">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sage to-olive" />
                    <div>
                      <p className="font-medium leading-tight">{w.name}</p>
                      <p className="text-[11px] text-muted-foreground">{w.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{w.role}</td>
                <td className="px-5 py-3 text-muted-foreground">{w.team}</td>
                <td className="px-5 py-3 text-muted-foreground"><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{w.location}</span></td>
                <td className="px-5 py-3">
                  <Badge variant="secondary" className={`border-0 font-normal ${
                    w.status === "On duty" ? "bg-sage/15 text-sage-deep" :
                    w.status === "Break" ? "bg-harvest/25 text-clay" : "bg-muted text-muted-foreground"
                  }`}>{w.status}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-olive" style={{ width: `${w.perf}%` }} />
                    </div>
                    <span className="text-xs">{w.perf}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
