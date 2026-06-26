"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import { useFarms, type FarmMeta } from "@/lib/hooks";

const CROP_OPTIONS = ["Pineapple", "Oil Palm", "Rubber", "Durian", "Banana"];
const ACCENT_OPTIONS: FarmMeta["accent"][] = ["sage", "olive", "harvest"];

const BLANK: Omit<FarmMeta, "id" | "mapLabel" | "density" | "ndvi" | "yieldDelta" | "totalTonnage" | "revenue" | "harvestWindow" | "confidence" | "sectors"> = {
  name: "",
  subtitle: "",
  crop: "Pineapple",
  estateType: "",
  region: "",
  established: "",
  area: "",
  blocks: 0,
  plants: "",
  healthyPct: "",
  yieldForecast: "",
  soil: "",
  elevation: "",
  climate: "",
  irrigation: "",
  manager: "",
  coords: "",
  accent: "sage",
};

const FIELDS: { label: string; key: keyof typeof BLANK; placeholder: string }[] = [
  { label: "Farm name", key: "name", placeholder: "e.g. Farm 4" },
  { label: "Subtitle", key: "subtitle", placeholder: "e.g. Lowland Pineapple Estate" },
  { label: "Region", key: "region", placeholder: "e.g. Kuala Lumpur, Malaysia" },
  { label: "Estate type", key: "estateType", placeholder: "e.g. Lowland Estate" },
  { label: "Established (year)", key: "established", placeholder: "e.g. 2018" },
  { label: "Total area", key: "area", placeholder: "e.g. 980 ha" },
  { label: "No. of blocks", key: "blocks", placeholder: "e.g. 32" },
  { label: "Plant count", key: "plants", placeholder: "e.g. 2.1M" },
  { label: "Healthy canopy %", key: "healthyPct", placeholder: "e.g. 88.5%" },
  { label: "Yield forecast", key: "yieldForecast", placeholder: "e.g. 59.2 t/ha" },
  { label: "Manager", key: "manager", placeholder: "e.g. Nishit DB" },
  { label: "Soil profile", key: "soil", placeholder: "e.g. Sandy loam" },
  { label: "Elevation", key: "elevation", placeholder: "e.g. 340 m" },
  { label: "Climate zone", key: "climate", placeholder: "e.g. Tropical wet" },
  { label: "Irrigation", key: "irrigation", placeholder: "e.g. Drip · 90% coverage" },
  { label: "Coordinates", key: "coords", placeholder: "e.g. 3°N 102°E" },
];

export default function AddFarmPage() {
  const router = useRouter();
  const { addFarm } = useFarms();
  const [form, setForm] = useState({ ...BLANK });
  const [error, setError] = useState("");

  const set = (key: keyof typeof BLANK, value: string | number) =>
    setForm((d) => ({ ...d, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Farm name is required."); return; }
    try {
      await addFarm({
        ...form,
        mapLabel: `${form.name} · ${form.blocks} blocks`,
        density: "",
        ndvi: "",
        yieldDelta: "",
        totalTonnage: "",
        revenue: "",
        harvestWindow: "",
        confidence: "",
        sectors: 0,
      });
      router.push("/farms");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add farm.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Manage Farms"
        title="Add Farm"
        description="Register a new plantation to your portfolio."
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/farms")} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to farms
          </Button>
        }
      />

      <Card className="border-border/60 shadow-none p-6 max-w-3xl space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map(({ label, key, placeholder }) => (
            <div className="space-y-1.5" key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                placeholder={placeholder}
                value={String(form[key])}
                onChange={(e) => set(key, key === "blocks" ? Number(e.target.value) : e.target.value)}
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

        {error && <p className="text-sm text-clay">{error}</p>}

        <div className="flex gap-2 pt-1 border-t border-border/60">
          <Button onClick={handleSubmit} className="bg-sage-deep hover:bg-sage-deep/90 gap-1.5">
            <Check className="h-3.5 w-3.5" /> Add farm
          </Button>
          <Button variant="outline" onClick={() => router.push("/farms")}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
