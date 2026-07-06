"use client";

import { GisWorkspace } from "@/components/gis-workspace";

export default function Page() {
  return (
    <GisWorkspace
      overlay="ndre"
      tileLayer="ndre"
      title="NDRE Layer"
      description="Red-edge index — early indicator of nitrogen and chlorophyll status."
      legend={[
        { color: "oklch(0.45 0.1 145)", label: "0.6+  high" },
        { color: "oklch(0.74 0.07 110)", label: "0.2 – 0.6  medium" },
        { color: "oklch(0.8 0.05 90)", label: "< 0.2  low" },
      ]}
    />
  );
}
