import { Plane } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Operations"
      title="Drone Operations"
      description="Mission planning, telemetry and fleet management for the agronomy drone program."
      icon={Plane}
      modules={[
        { title: "Mission planner", body: "Auto-generate flight paths per block with overlap, altitude, sidelap controls." },
        { title: "Live flight telemetry", body: "Battery, GPS lock, payload status across the active fleet." },
        { title: "Fleet & equipment", body: "Airframe hours, sensor calibration, maintenance scheduling." },
        { title: "Survey history", body: "Searchable archive of every capture with ortho previews." },
      ]}
    />
  );
}
