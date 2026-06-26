"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil, Plus } from "lucide-react";
import { useFarms, farmImage, type FarmMeta } from "@/lib/hooks";

function accentClass(accent: FarmMeta["accent"]) {
  return accent === "sage"
    ? "bg-sage/15 text-sage-deep"
    : accent === "olive"
    ? "bg-olive/15 text-olive"
    : "bg-harvest/25 text-clay";
}

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export default function ManageFarmsPage() {
  const { managedFarms } = useFarms();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Manage Farms"
        description="View, edit or remove farms from your portfolio."
        actions={
          <Button asChild className="bg-sage-deep hover:bg-sage-deep/90 gap-1.5">
            <Link href="/farms/add">
              <Plus className="h-4 w-4" /> Add Farm
            </Link>
          </Button>
        }
      />

      <div className="space-y-5">
        {managedFarms.map((farm) => (
          <Card
            key={farm.id}
            className="flex items-stretch gap-0 border-border/60 shadow-none overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative w-[220px] shrink-0 min-h-[260px]">
              <img
                src={farmImage(farm.id, farm.crop)}
                alt={farm.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col justify-between gap-4 px-6 py-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-xl font-semibold tracking-tight">{farm.name}</h3>
                    <Badge variant="secondary" className={`border-0 font-normal ${accentClass(farm.accent)}`}>
                      {farm.crop}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{farm.subtitle}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {farm.region}
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
                  <Link href={`/farms/${farm.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                </Button>
              </div>

              {/* Metadata grid */}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                <MetaItem label="Total area" value={farm.area} />
                <MetaItem label="Blocks" value={farm.blocks} />
                <MetaItem label="Plant count" value={farm.plants} />
                <MetaItem label="Est." value={farm.established} />
                <MetaItem label="Healthy canopy" value={farm.healthyPct} />
                <MetaItem label="Yield forecast" value={farm.yieldForecast} />
                <MetaItem label="Yield delta" value={farm.yieldDelta} />
                <MetaItem label="Harvest window" value={farm.harvestWindow} />
                <MetaItem label="Manager" value={farm.manager} />
                <MetaItem label="Irrigation" value={farm.irrigation} />
                <MetaItem label="Soil profile" value={farm.soil} />
                <MetaItem label="Climate" value={farm.climate} />
              </dl>

              {/* Footer stats */}
              <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                {farm.elevation && <span>Elevation: <span className="font-medium text-foreground">{farm.elevation}</span></span>}
                {farm.coords && <span>Coords: <span className="font-medium text-foreground">{farm.coords}</span></span>}
                {farm.revenue && <span>Revenue: <span className="font-medium text-foreground">{farm.revenue}</span></span>}
                {farm.totalTonnage && <span>Tonnage: <span className="font-medium text-foreground">{farm.totalTonnage}</span></span>}
                {farm.confidence && <span>Forecast confidence: <span className="font-medium text-foreground">{farm.confidence}</span></span>}
              </div>
            </div>
          </Card>
        ))}

        {managedFarms.length === 0 && (
          <Card className="border-dashed border-border/70 bg-muted/20 shadow-none py-16 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-muted-foreground">No farms in portfolio</p>
            <Button asChild size="sm" className="mt-2 bg-sage-deep hover:bg-sage-deep/90 gap-1.5">
              <Link href="/farms/add">
                <Plus className="h-4 w-4" /> Add Farm
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
