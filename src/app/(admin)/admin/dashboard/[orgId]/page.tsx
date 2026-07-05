"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Tractor } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { farmImage } from "@/lib/hooks";
import { getAdminOrganization, getOrganizationFarms } from "@/lib/admin";

function accentClass(accent: "sage" | "olive" | "harvest") {
  return accent === "sage"
    ? "bg-sage/15 text-sage-deep"
    : accent === "olive"
    ? "bg-olive/15 text-olive"
    : "bg-harvest/25 text-clay";
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="pt-6">
        <p className="font-display text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function OrganizationFarmsPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ["admin-organization", orgId],
    queryFn: () => getAdminOrganization(orgId),
  });
  const { data: farms, isLoading: farmsLoading } = useQuery({
    queryKey: ["admin-organization-farms", orgId],
    queryFn: () => getOrganizationFarms(orgId),
  });

  const totalBlocks = (farms ?? []).reduce((sum, f) => sum + f.blocks, 0);
  const totalSectors = (farms ?? []).reduce((sum, f) => sum + f.sectors, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin · Dashboard"
        title={orgLoading ? "Loading…" : org?.name ?? "Organization"}
        description="Farms belonging to this organization."
        actions={
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All organizations
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        {/* Farms list */}
        <div className="space-y-4">
          {farmsLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : (farms ?? []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
              <Tractor className="h-8 w-8" />
              <p className="text-sm">No farms in this organization yet.</p>
            </div>
          ) : (
            (farms ?? []).map((farm) => (
              <Card
                key={farm.id}
                className="flex items-stretch gap-0 overflow-hidden border-border/60 shadow-none"
              >
                <div className="relative w-[140px] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={farmImage(farm.id, farm.crop)}
                    alt={farm.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold tracking-tight">
                      {farm.name}
                    </h3>
                    {farm.crop && (
                      <Badge variant="secondary" className={`border-0 font-normal ${accentClass(farm.accent)}`}>
                        {farm.crop}
                      </Badge>
                    )}
                  </div>
                  {farm.subtitle && <p className="text-sm text-muted-foreground">{farm.subtitle}</p>}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    {farm.region && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {farm.region}
                      </span>
                    )}
                    {farm.area && <span>Area: <span className="font-medium text-foreground">{farm.area}</span></span>}
                    {farm.plants && <span>Plants: <span className="font-medium text-foreground">{farm.plants}</span></span>}
                    {farm.healthyPct && (
                      <span>Healthy: <span className="font-medium text-foreground">{farm.healthyPct}</span></span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Stats panel */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <StatBox label="Total Farms" value={org?.farmCount ?? (farms ?? []).length} />
          <StatBox label="Total area covered" value={org?.totalArea || "—"} />
          <StatBox label="Total blocks" value={totalBlocks} />
          <StatBox label="Total sectors" value={totalSectors} />
        </div>
      </div>
    </div>
  );
}
