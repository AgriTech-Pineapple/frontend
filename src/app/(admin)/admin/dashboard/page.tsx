"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Sprout, Tractor, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOrganizations } from "@/lib/admin";

export default function AdminDashboardPage() {
  const [search, setSearch] = useState("");
  const { data: orgs, isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: getAdminOrganizations,
  });

  const filtered = (orgs ?? []).filter((o) =>
    `${o.name} ${o.country} ${o.crops.join(" ")}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Organizations"
        description="Every organization on the platform. Open one to see its farms and estate stats."
        actions={
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations…"
              className="pl-8"
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
          <Building2 className="h-8 w-8" />
          <p className="text-sm">
            {search ? "No organizations match your search." : "No organizations yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((org) => (
            <Link key={org.id} href={`/admin/dashboard/${org.id}`}>
              <Card className="flex items-center gap-5 border-border/60 p-5 shadow-none transition-shadow hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sage-deep/10">
                  {org.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-sage-deep" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold tracking-tight">{org.name}</h3>
                    {org.crops.map((crop) => (
                      <Badge key={crop} variant="secondary" className="border-0 bg-sage/15 font-normal text-sage-deep">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {org.contactEmail || "No contact on file"}
                  </p>
                  {org.country && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {org.country}
                    </div>
                  )}
                </div>

                <div className="hidden shrink-0 gap-6 sm:flex">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
                      <Tractor className="h-4 w-4 text-muted-foreground" />
                      {org.farmCount}
                    </div>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Farms</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
                      <Sprout className="h-4 w-4 text-muted-foreground" />
                      {org.totalArea || "—"}
                    </div>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Total area</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
