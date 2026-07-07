"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, AlertCircle, Building2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useActiveOrg } from "@/lib/org";

/** Org switcher — only rendered for users belonging to more than one org. */
function OrgSwitcher() {
  const { memberships, activeOrg, setActiveOrgId } = useActiveOrg();
  if (memberships.length < 2) return null;
  return (
    <Select value={activeOrg?.organizationId ?? ""} onValueChange={setActiveOrgId}>
      <SelectTrigger className="h-9 w-[190px] bg-white text-sm">
        <span className="flex items-center gap-2 truncate">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Organization" />
        </span>
      </SelectTrigger>
      <SelectContent>
        {memberships.map((m) => (
          <SelectItem key={m.organizationId} value={m.organizationId}>
            {m.organizationName || "Unnamed org"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type Alert = { level: "High" | "Medium" | "Low"; farm: string; title: string; ago: string };

const recentAlerts: Alert[] = [
  { level: "High", farm: "Farm 1", title: "Severe stress in Block C-3", ago: "2h ago" },
  { level: "High", farm: "Farm 2", title: "Severe stress patch in Block W-2", ago: "1h ago" },
  { level: "Medium", farm: "Farm 3", title: "Salinity stress in Block BD-4", ago: "3h ago" },
  { level: "Medium", farm: "Farm 2", title: "Sprinkler pressure low on Sector 3", ago: "4h ago" },
  { level: "Low", farm: "Farm 1", title: "Drone survey completed", ago: "1d ago" },
];

const order = { High: 0, Medium: 1, Low: 2 } as const;

export function TopBar() {
  const sorted = [...recentAlerts].sort((a, b) => order[a.level] - order[b.level]);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search fields, workers, missions, reports…"
            className="h-9 pl-8 bg-white border border-border"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <OrgSwitcher />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Recent alerts">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-clay" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <p className="text-sm font-medium">Recent alerts</p>
              <Link href="/alerts" className="text-xs text-sage-deep hover:underline">View all</Link>
            </div>
            <ul className="max-h-80 divide-y divide-border/60 overflow-y-auto">
              {sorted.map((a) => (
                <li key={a.title} className="flex gap-3 px-4 py-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                    a.level === "High" ? "bg-clay/15 text-clay" :
                    a.level === "Medium" ? "bg-harvest/25 text-clay" : "bg-sage/15 text-sage-deep"
                  }`}>
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.farm}</p>
                    <p className="text-sm font-medium leading-snug">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.level} · {a.ago}</p>
                  </div>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
