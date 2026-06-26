"use client";

import { GisWorkspace } from "@/components/gis-workspace";

export default function Page() {
  return (
    <GisWorkspace
      overlay="terrain"
      title="Terrain Layer"
      description="Digital surface model derived from photogrammetry — elevation 380 m to 462 m."
      legend={[
        { color: "oklch(0.45 0.04 100)", label: "460 m+" },
        { color: "oklch(0.55 0.05 95)", label: "420 – 460 m" },
        { color: "oklch(0.65 0.06 85)", label: "400 – 420 m" },
        { color: "oklch(0.78 0.06 80)", label: "< 400 m" },
      ]}
    />
  );
}
