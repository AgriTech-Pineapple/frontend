"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, AlertCircle, MapPin, TrendingUp, Plus } from "lucide-react";
import { useFarms, useFarm, useProfile, farmImage } from "@/lib/hooks";
import Link from "next/link";

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return isNaN(n) ? null : n;
}

export default function Dashboard() {
  const router = useRouter();
  const { setFarmId } = useFarm();
  const { managedFarms, loading } = useFarms();
  const { profile } = useProfile();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const areas   = managedFarms.map(f => parseNum(f.area)).filter((n): n is number => n !== null);
  const healths = managedFarms.map(f => parseNum(f.healthyPct)).filter((n): n is number => n !== null);
  const yields  = managedFarms.map(f => parseNum(f.yieldForecast)).filter((n): n is number => n !== null);

  const totalArea  = areas.length   ? areas.reduce((a, b) => a + b, 0) : null;
  const avgHealthy = healths.length ? healths.reduce((a, b) => a + b, 0) / healths.length : null;
  const avgYield   = yields.length  ? yields.reduce((a, b) => a + b, 0) / yields.length  : null;

  const open = (id: string) => {
    setFarmId(id);
    router.push("/farm/overview");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Portfolio · ${managedFarms.length} farm${managedFarms.length !== 1 ? "s" : ""}`}
        title={`${greeting} ${profile?.firstName || ""}`}
        description="Pick a farm to dive in, or review portfolio-wide signals on the right."
        actions={<Button size="sm" variant="outline">Export portfolio brief</Button>}
      />

      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your farms</h2>
            <span className="text-xs text-muted-foreground">Select a farm to load its intelligence</span>
          </div>

          <div className="grid gap-4">
            {loading && (
              <Card className="border-border/60 shadow-none py-12 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading farms…</p>
              </Card>
            )}

            {!loading && managedFarms.map((f) => (
              <Card
                key={f.id}
                onClick={() => open(f.id)}
                className="group cursor-pointer border-border/60 shadow-none transition hover:border-sage-deep/40 hover:shadow-sm"
              >
                <div className="grid gap-0 md:grid-cols-[200px_1fr]">
                  <div className="relative h-32 md:h-auto overflow-hidden rounded-l-xl">
                    <img
                      src={farmImage(f.id, f.crop)}
                      alt={f.crop}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{f.region}
                        </div>
                        <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">{f.name}</h3>
                        <p className="text-xs text-muted-foreground">{f.subtitle}</p>
                      </div>
                      <Badge variant="secondary" className={`border-0 font-normal ${
                        f.accent === "sage" ? "bg-sage/15 text-sage-deep" :
                        f.accent === "olive" ? "bg-olive/15 text-olive" : "bg-harvest/25 text-clay"
                      }`}>{f.crop}</Badge>
                    </div>
                    <dl className="mt-4 grid grid-cols-4 gap-3">
                      {[
                        ["Area",    f.area],
                        ["Plants",  f.plants],
                        ["Healthy", f.healthyPct],
                        ["Yield",   f.yieldForecast],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                          <dd className="font-num text-base font-semibold tabular-nums mt-0.5">{v || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {f.blocks} blocks · est. {f.established}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-sage-deep group-hover:underline">
                        Open farm <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {!loading && managedFarms.length === 0 && (
              <Card className="border-dashed border-border/70 bg-muted/20 shadow-none py-12 flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">No farms in portfolio</p>
                <Button asChild size="sm" className="mt-1 bg-sage-deep hover:bg-sage-deep/90 gap-1.5">
                  <Link href="/farms/add"><Plus className="h-4 w-4" /> Add Farm</Link>
                </Button>
              </Card>
            )}

            <Card
              onClick={() => router.push("/farms/add")}
              className="group flex cursor-pointer items-center justify-center gap-3 border-2 border-dashed border-border/70 bg-muted/20 py-6 shadow-none transition hover:border-sage-deep/50 hover:bg-muted/40"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-deep/10 text-sage-deep transition group-hover:bg-sage-deep group-hover:text-primary-foreground">
                <Plus className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium">Add farm</p>
                <p className="text-xs text-muted-foreground">Connect a new plantation to the portfolio</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-5 border-border/60 shadow-none">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Portfolio at a glance</h3>
              <Badge variant="secondary" className="bg-sage/15 text-sage-deep border-0">
                <TrendingUp className="mr-1 h-3 w-3" /> +7.4% YoY
              </Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              {[
                ["Total farms",        String(managedFarms.length)],
                ["Total area",         totalArea  != null ? `${totalArea.toLocaleString()} ha`  : "—"],
                ["Healthy canopy",     avgHealthy != null ? `${avgHealthy.toFixed(1)}%`          : "—"],
                ["Avg yield forecast", avgYield   != null ? `${avgYield.toFixed(1)} t/ha`        : "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted/30 p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="mt-1 font-num text-xl font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5 border-border/60 shadow-none">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Recommendations</h3>
              <Badge variant="outline" className="font-normal text-[10px]">AI · today</Badge>
            </div>
            <ul className="space-y-3">
              {managedFarms.flatMap((f) =>
                (f.recommendations ?? []).slice(0, 1).map((r) => (
                  <li key={`${f.id}-${r.title}`} className="border-l-2 border-sage/40 pl-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.name}</p>
                    <p className="text-sm font-medium leading-snug">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
                  </li>
                ))
              )}
              {managedFarms.length === 0 && (
                <li className="text-xs text-muted-foreground">No recommendations yet</li>
              )}
            </ul>
          </Card>

          <Card className="p-5 border-border/60 shadow-none">
            <h3 className="mb-3 font-display text-base font-semibold">Recent alerts · all farms</h3>
            <ul className="space-y-2.5">
              {managedFarms.flatMap((f) =>
                (f.alerts ?? []).slice(0, 2).map((a) => (
                  <li key={`${f.id}-${a.title}`} className="flex gap-3 rounded-lg border border-border/60 p-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      a.level === "Critical" ? "bg-red-500/15 text-red-500" :
                      a.level === "High"     ? "bg-clay/15 text-clay" :
                      a.level === "Medium"   ? "bg-harvest/25 text-clay" : "bg-sage/15 text-sage-deep"
                    }`}>
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.name}</p>
                      <p className="text-sm font-medium leading-snug">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.level} · {a.ago}</p>
                    </div>
                  </li>
                ))
              )}
              {managedFarms.length === 0 && (
                <li className="text-xs text-muted-foreground">No alerts</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
