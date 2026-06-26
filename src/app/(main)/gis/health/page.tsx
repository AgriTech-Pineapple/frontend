"use client";

import { GisWorkspace } from "@/components/gis-workspace";

export default function Page() {
  return (
    <GisWorkspace
      overlay="health"
      title="Health Layer"
      description="Composite plant-health classification across the estate."
      legend={[
        { color: "oklch(0.55 0.16 130)", label: "Healthy" },
        { color: "oklch(0.78 0.14 95)", label: "Mild stress" },
        { color: "oklch(0.62 0.16 50)", label: "Severe stress" },
        { color: "oklch(0.7 0.04 100)", label: "Bare ground" },
      ]}
    />
  );
}
