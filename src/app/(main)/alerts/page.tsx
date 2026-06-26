"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Bell, Info, Check } from "lucide-react";

type Alert = { id: string; lvl: "Critical" | "High" | "Medium" | "Low"; title: string; body: string; time: string; source: string };

const initialAlerts: Alert[] = [
  { id: "a1", lvl: "Critical", title: "Severe stress detected · Block C-3", body: "NDVI dropped 0.18 since last capture. Affects 18.2 ha.", time: "2h ago", source: "AI · imagery" },
  { id: "a2", lvl: "High", title: "Workforce shortage forecast", body: "Wednesday roster shows −12 workers vs harvest schedule.", time: "5h ago", source: "Roster system" },
  { id: "a3", lvl: "Medium", title: "Yield decline · Block B-1", body: "Projection revised −4.2 t/ha for harvest window.", time: "yesterday", source: "Forecast model" },
  { id: "a4", lvl: "Medium", title: "Missed survey · Block 5", body: "No imagery in 12 days. Auto-scheduled for tomorrow 06:00.", time: "yesterday", source: "Operations" },
  { id: "a5", lvl: "Low", title: "Mission MX-218 completed", body: "412 ha processed. New layers available.", time: "1d ago", source: "Drone Ops" },
  { id: "a6", lvl: "Low", title: "5 tasks closed today", body: "Bravo team completed harvest sector 3 ahead of schedule.", time: "1d ago", source: "Task system" },
];

const iconFor: Record<string, React.ElementType> = { Critical: AlertTriangle, High: AlertCircle, Medium: Bell, Low: Info };
const toneFor: Record<string, string> = {
  Critical: "bg-clay/15 text-clay border-clay/30",
  High: "bg-clay/10 text-clay border-clay/20",
  Medium: "bg-harvest/20 text-clay border-harvest/30",
  Low: "bg-sage/15 text-sage-deep border-sage/20",
};

export default function Page() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [resolved, setResolved] = useState<Alert[]>([]);

  const resolve = (id: string) => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      const done = prev.find((a) => a.id === id);
      if (done) setResolved((r) => [done, ...r]);
      return next;
    });
  };

  const restore = (id: string) => {
    setResolved((prev) => {
      const next = prev.filter((a) => a.id !== id);
      const back = prev.find((a) => a.id === id);
      if (back) setAlerts((r) => [back, ...r]);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations"
        title="Alert Center"
        description="Prioritised events from agronomy models, operations and field reports."
        actions={
          <>
            <Button variant="outline" size="sm">Configure thresholds</Button>
            <Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90" onClick={() => { setResolved((r) => [...alerts, ...r]); setAlerts([]); }}>Mark all read</Button>
          </>
        }
      />

      <Card className="border-border/60 shadow-none">
        {alerts.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">All alerts resolved. Nice work.</div>
        ) : (
          <ul className="divide-y divide-border/60">
            {alerts.map((a) => {
              const Icon = iconFor[a.lvl];
              return (
                <li key={a.id} className="flex gap-4 p-5">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${toneFor[a.lvl]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      <Badge variant="outline" className="font-normal text-[10px]">{a.lvl}</Badge>
                      <span className="text-[11px] text-muted-foreground">· {a.source}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{a.body}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                    <span>{a.time}</span>
                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => resolve(a.id)}>
                      Resolve
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {resolved.length > 0 && (
        <Card className="border-border/60 shadow-none">
          <div className="border-b border-border/60 p-4">
            <h3 className="font-display text-base font-semibold">Resolved · {resolved.length}</h3>
          </div>
          <ul className="divide-y divide-border/60">
            {resolved.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sage/15 text-sage-deep">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm text-muted-foreground line-through truncate">{a.title}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs" onClick={() => restore(a.id)}>
                  Undo
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
