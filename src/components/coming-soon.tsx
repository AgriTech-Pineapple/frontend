import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, type LucideIcon } from "lucide-react";

export function ComingSoon({
  eyebrow, title, description, icon: Icon = Sparkles, modules, eta = "Q3 2026",
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  modules: { title: string; body: string }[];
  eta?: string;
}) {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <Card className="relative overflow-hidden border-border/60 shadow-none">
        <div className="absolute inset-0 topo-bg opacity-60" aria-hidden />
        <div className="absolute inset-0 farm-grid-bg opacity-30" aria-hidden />
        <div className="relative grid gap-8 p-10 md:grid-cols-[1.2fr_1fr] md:p-14">
          <div className="space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-deep text-primary-foreground shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-background/80 backdrop-blur border-0 text-xs font-medium">
              In development · ETA {eta}
            </Badge>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl max-w-xl">
              {title} is being built into the Agritech platform
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              We&apos;re crafting a focused, agronomist-grade experience for this module. You&apos;ll see it land here in the next release cycle.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
              Updates roll in continuously — no migration needed
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">What&apos;s coming</p>
            <div className="grid gap-2.5">
              {modules.map((m) => (
                <div key={m.title} className="rounded-lg border border-border/60 bg-background/70 p-4 backdrop-blur">
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
