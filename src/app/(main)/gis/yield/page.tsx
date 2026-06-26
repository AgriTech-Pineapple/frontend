"use client";

import { GisWorkspace } from "@/components/gis-workspace";

export default function Page() {
  return (
    <GisWorkspace
      overlay="yield"
      title="Yield Layer"
      description="Predicted tonnage per hectare across cultivated blocks."
      legend={[
        { color: "oklch(0.78 0.14 90)", label: "65+ t/ha" },
        { color: "oklch(0.7 0.15 75)", label: "55 – 65 t/ha" },
        { color: "oklch(0.6 0.15 50)", label: "45 – 55 t/ha" },
        { color: "oklch(0.5 0.14 40)", label: "< 45 t/ha" },
      ]}
    />
  );
}
