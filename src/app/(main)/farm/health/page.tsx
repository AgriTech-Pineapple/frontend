"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { KpiCard, LegendSwatch } from "@/components/farm-ui";
import { TileMap } from "@/components/tile-map";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFarm } from "@/lib/hooks";
import { Lightbulb, BookOpen } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

type TabKey = "ndvi" | "ndre" | "savi";

const TAB_CONFIG: Record<TabKey, { tileLayer: string; legend: { color: string; label: string }[] }> = {
  ndvi: {
    tileLayer: "ndvi",
    legend: [
      { color: "oklch(0.5 0.18 135)", label: "0.8 – 1.0  vigorous" },
      { color: "oklch(0.65 0.15 130)", label: "0.6 – 0.8  healthy" },
      { color: "oklch(0.78 0.13 100)", label: "0.4 – 0.6  moderate" },
      { color: "oklch(0.62 0.15 50)",  label: "< 0.4  stressed" },
    ],
  },
  ndre: {
    tileLayer: "ndre",
    legend: [
      { color: "oklch(0.45 0.1 145)", label: "0.5+  optimal" },
      { color: "oklch(0.6 0.09 130)",  label: "0.4 – 0.5" },
      { color: "oklch(0.74 0.07 110)", label: "0.3 – 0.4" },
      { color: "oklch(0.8 0.05 90)",   label: "< 0.3  low" },
    ],
  },
  savi: {
    tileLayer: "osavi",
    legend: [
      { color: "oklch(0.55 0.16 130)", label: "0.7 – 1.0" },
      { color: "oklch(0.75 0.14 110)", label: "0.5 – 0.7" },
      { color: "oklch(0.78 0.12 80)",  label: "0.3 – 0.5" },
      { color: "oklch(0.62 0.15 45)",  label: "< 0.3" },
    ],
  },
};

export default function Page() {
  const { farm } = useFarm();
  const [activeTab, setActiveTab] = useState<TabKey>("ndvi");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`Farm Intelligence · ${farm.name}`} title="Crop Health Analysis" description="Multi-index vegetation analysis from the latest drone imagery." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Healthy" value={farm.kpis.health.healthyPct} hint="canopy share" delta={farm.kpis.health.ndviDelta} />
        <KpiCard label="Mild stress" value={farm.kpis.health.mild} accent="harvest" />
        <KpiCard label="Severe stress" value={farm.kpis.health.severe} accent="clay" />
        <KpiCard label="NDVI mean" value={farm.kpis.health.ndvi} hint="healthy crops sit above 0.7" accent="olive" delta={farm.kpis.health.ndviDelta} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="space-y-4">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="ndvi">NDVI</TabsTrigger>
          <TabsTrigger value="ndre">NDRE</TabsTrigger>
          <TabsTrigger value="savi">SAVI</TabsTrigger>
        </TabsList>

        {(["ndvi", "ndre", "savi"] as TabKey[]).map((k) => (
          <TabsContent key={k} value={k}>
            <Card className="p-6 border-border/60 shadow-none">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold uppercase">{k}</h3>
                <LegendSwatch items={TAB_CONFIG[k].legend} />
              </div>
              {/* Mount TileMap only when this tab is active — unmounts on switch to free resources */}
              {activeTab === k && (
                <TileMap
                  className="h-[480px]"
                  layer={TAB_CONFIG[k].tileLayer}
                  label={`${k.toUpperCase()} · ${farm.name}`}
                />
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-border/60 shadow-none">
          <h3 className="font-display text-lg font-semibold">Index trends</h3>
          <p className="text-xs text-muted-foreground mb-4">6-week rolling means</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={farm.indexTrend}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="NDVI" stroke="var(--sage-deep)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="NDRE" stroke="var(--olive)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="SAVI" stroke="var(--clay)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-border/60 shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sage/15 text-sage-deep">
                <Lightbulb className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-display text-lg font-semibold">Interpretation</h3>
            </div>
            <Badge variant="outline" className="font-normal text-[10px]">For {farm.name}</Badge>
          </div>
          <div className="space-y-4 text-sm leading-relaxed">
            {farm.interpretation.map((p, i) => (
              <div key={i} className="border-l-2 border-sage/40 pl-3">
                {p.heading && <p className="font-medium text-foreground mb-0.5">{p.heading}</p>}
                <p className="text-foreground/90">{p.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border/60 shadow-none">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-olive/15 text-olive">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-display text-lg font-semibold">What do these indices mean?</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { tag: "NDVI", title: "Greenness", body: "Measures overall plant vigor. Healthy crops usually sit between 0.7 and 0.9. Below 0.5 means the canopy is thinning or stressed." },
            { tag: "NDRE", title: "Nitrogen & late growth", body: "Picks up subtle nitrogen issues that NDVI misses. Healthy late-stage crops are around 0.4–0.6. Falling values can mean it's time to feed." },
            { tag: "SAVI", title: "Best for young / sparse canopies", body: "Like NDVI but adjusted for bare soil. Use it early in the season. Rising SAVI means the canopy is filling in." },
          ].map((it) => (
            <div key={it.tag} className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-sage-deep text-primary-foreground border-0 font-medium">{it.tag}</Badge>
                <span className="text-sm font-medium">{it.title}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
