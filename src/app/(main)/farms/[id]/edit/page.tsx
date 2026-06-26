"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { useFarms, type FarmMeta } from "@/lib/hooks";

const CROP_OPTIONS = ["Pineapple", "Oil Palm", "Rubber", "Durian", "Banana"];
const ACCENT_OPTIONS: FarmMeta["accent"][] = ["sage", "olive", "harvest"];

const FIELDS: { label: string; key: keyof FarmMeta; placeholder: string }[] = [
  { label: "Farm name", key: "name", placeholder: "e.g. Farm 1" },
  { label: "Subtitle", key: "subtitle", placeholder: "e.g. Highland Pineapple Estate" },
  { label: "Region", key: "region", placeholder: "e.g. Cameron Highlands, Pahang" },
  { label: "Estate type", key: "estateType", placeholder: "e.g. Highland Estate" },
  { label: "Established (year)", key: "established", placeholder: "e.g. 2009" },
  { label: "Total area", key: "area", placeholder: "e.g. 1,247 ha" },
  { label: "No. of blocks", key: "blocks", placeholder: "e.g. 38" },
  { label: "Plant count", key: "plants", placeholder: "e.g. 2.74M" },
  { label: "Healthy canopy %", key: "healthyPct", placeholder: "e.g. 86.4%" },
  { label: "Yield forecast", key: "yieldForecast", placeholder: "e.g. 61.4 t/ha" },
  { label: "Yield delta", key: "yieldDelta", placeholder: "e.g. +8.7% YoY" },
  { label: "Manager", key: "manager", placeholder: "e.g. Nishit DB" },
  { label: "Soil profile", key: "soil", placeholder: "e.g. Volcanic loam" },
  { label: "Elevation", key: "elevation", placeholder: "e.g. 412 m" },
  { label: "Climate zone", key: "climate", placeholder: "e.g. Tropical wet" },
  { label: "Irrigation", key: "irrigation", placeholder: "e.g. Drip · 92% coverage" },
  { label: "Harvest window", key: "harvestWindow", placeholder: "e.g. Aug – Oct" },
  { label: "Coordinates", key: "coords", placeholder: "e.g. 4°N 101°E" },
  { label: "Revenue", key: "revenue", placeholder: "e.g. RM 124M" },
  { label: "Total tonnage", key: "totalTonnage", placeholder: "e.g. 76,570 t" },
];

export default function EditFarmPage() {
  const params = useParams();
  const router = useRouter();
  const { managedFarms, updateFarm, deleteFarm } = useFarms();

  const id = params.id as string;
  const original = managedFarms.find((f) => f.id === id);

  const [form, setForm] = useState<FarmMeta | null>(original ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (original) setForm(original);
  }, [original]);

  if (!form) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Manage Farms" title="Farm not found" />
        <Button variant="outline" onClick={() => router.push("/farms")} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to farms
        </Button>
      </div>
    );
  }

  const set = (key: keyof FarmMeta, value: string | number) =>
    setForm((d) => d ? { ...d, [key]: value } : d);

  const handleSave = async () => {
    try {
      await updateFarm(form);
      router.push("/farms");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFarm(id);
      router.push("/farms");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Manage Farms"
        title={form.name}
        description={`${form.subtitle} · ${form.region}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/farms")} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to farms
          </Button>
        }
      />

      {/* Metadata form */}
      <Card className="border-border/60 shadow-none p-6 max-w-3xl space-y-6">
        <h3 className="font-display text-lg font-semibold">Farm metadata</h3>

        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map(({ label, key, placeholder }) => (
            <div className="space-y-1.5" key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                placeholder={placeholder}
                value={String(form[key] ?? "")}
                onChange={(e) =>
                  set(key, key === "blocks" || key === "sectors" ? Number(e.target.value) : e.target.value)
                }
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Crop type</Label>
            <select
              value={form.crop}
              onChange={(e) => set("crop", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CROP_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Accent colour</Label>
            <select
              value={form.accent}
              onChange={(e) => set("accent", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ACCENT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/60">
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-sage-deep hover:bg-sage-deep/90 gap-1.5">
              <Check className="h-3.5 w-3.5" /> Save changes
            </Button>
            <Button variant="outline" onClick={() => router.push("/farms")}>Cancel</Button>
          </div>

          {!confirmDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="gap-1.5 text-clay hover:bg-clay/10 hover:text-clay"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove farm
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Are you sure?</span>
              <Button
                size="sm"
                onClick={handleDelete}
                className="bg-clay hover:bg-clay/90 gap-1.5 h-7 px-3 text-xs"
              >
                Yes, remove
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)} className="h-7 px-3 text-xs">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
