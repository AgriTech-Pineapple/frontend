import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export function KpiCard({
  label, value, delta, hint, icon, accent = "sage",
}: {
  label: string; value: string; delta?: string; hint?: string; icon?: ReactNode;
  accent?: "sage" | "harvest" | "clay" | "olive";
}) {
  const tone = {
    sage: "bg-sage/15 text-sage-deep",
    harvest: "bg-harvest/20 text-clay",
    clay: "bg-clay/15 text-clay",
    olive: "bg-olive/15 text-olive",
  }[accent];
  return (
    <Card className="p-5 border-border/60 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-num text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tone)}>{icon}</div>}
      </div>
      {delta && <Badge variant="secondary" className="mt-3 bg-sage/10 text-sage-deep border-0 font-normal">{delta}</Badge>}
    </Card>
  );
}

export function FieldMap({
  className, overlay = "ndvi", showPins = true, label,
}: {
  className?: string;
  overlay?: "ndvi" | "ndre" | "health" | "terrain" | "yield" | "plain" | "none";
  showPins?: boolean;
  label?: string;
}) {
  const overlays: Record<string, string> = {
    ndvi: "radial-gradient(circle at 25% 30%, oklch(0.62 0.19 135 / .95), transparent 35%), radial-gradient(circle at 65% 55%, oklch(0.55 0.21 130 / .9), transparent 40%), radial-gradient(circle at 75% 25%, oklch(0.45 0.2 125 / .85), transparent 30%), radial-gradient(circle at 40% 80%, oklch(0.7 0.18 100 / .8), transparent 35%), radial-gradient(circle at 88% 75%, oklch(0.45 0.22 60 / .75), transparent 28%)",
    ndre: "radial-gradient(circle at 30% 35%, oklch(0.4 0.14 145 / .95), transparent 40%), radial-gradient(circle at 70% 60%, oklch(0.52 0.13 130 / .9), transparent 38%), radial-gradient(circle at 60% 20%, oklch(0.65 0.11 110 / .8), transparent 35%)",
    health: "radial-gradient(circle at 30% 30%, oklch(0.62 0.19 140 / .95), transparent 35%), radial-gradient(circle at 70% 65%, oklch(0.68 0.2 95 / .9), transparent 38%), radial-gradient(circle at 85% 30%, oklch(0.5 0.22 45 / .85), transparent 30%)",
    terrain: "radial-gradient(circle at 30% 40%, oklch(0.55 0.09 80 / .9), transparent 40%), radial-gradient(circle at 60% 30%, oklch(0.45 0.08 90 / .9), transparent 38%), radial-gradient(circle at 75% 70%, oklch(0.35 0.06 100 / .9), transparent 40%)",
    yield: "radial-gradient(circle at 30% 30%, oklch(0.68 0.19 90 / .95), transparent 38%), radial-gradient(circle at 70% 60%, oklch(0.58 0.21 75 / .9), transparent 40%), radial-gradient(circle at 50% 80%, oklch(0.5 0.2 50 / .85), transparent 32%)",
    plain: "radial-gradient(circle at 40% 50%, oklch(0.75 0.1 130 / .75), transparent 60%)",
    none: "",
  };
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border/60 topo-bg", className)}>
      <div className="absolute inset-0" style={{ backgroundImage: overlays[overlay] }} />
      <div className="absolute inset-0 farm-grid-bg opacity-40" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M 30 40 L 180 25 L 220 90 L 200 180 L 90 220 L 35 150 Z" fill="none" stroke="oklch(0.3 0.04 120 / .55)" strokeWidth="1.2" strokeDasharray="3 3" />
        <path d="M 230 60 L 360 70 L 380 200 L 280 250 L 230 180 Z" fill="none" stroke="oklch(0.3 0.04 120 / .55)" strokeWidth="1.2" strokeDasharray="3 3" />
        <path d="M 120 230 L 220 240 L 250 280 L 130 290 Z" fill="none" stroke="oklch(0.3 0.04 120 / .55)" strokeWidth="1.2" strokeDasharray="3 3" />
      </svg>
      {showPins && (
        <>
          <div className="absolute left-[22%] top-[28%] flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-sage-deep ring-4 ring-sage/30" />
          </div>
          <div className="absolute left-[58%] top-[48%] flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-clay ring-4 ring-clay/25" />
          </div>
          <div className="absolute left-[78%] top-[22%] flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-harvest ring-4 ring-harvest/30" />
          </div>
        </>
      )}
      {label && (
        <div className="absolute bottom-3 left-3 rounded-md bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
          {label}
        </div>
      )}
    </div>
  );
}

export function LegendSwatch({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </div>
      ))}
    </div>
  );
}
