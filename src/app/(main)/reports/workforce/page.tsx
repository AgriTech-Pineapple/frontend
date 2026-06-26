import { Users } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Reports"
      title="Workforce Reports"
      description="Productivity, attendance and payroll-ready summaries by team and period."
      icon={Users}
      modules={[
        { title: "Bi-weekly payroll digest", body: "Hours, overtime, allowances reconciled per worker." },
        { title: "Team productivity", body: "Output per crew, harvest velocity, variance vs plan." },
        { title: "Attendance variance", body: "No-shows, late starts, geofence anomalies." },
        { title: "Compliance audit pack", body: "Labor records ready for certification audits." },
      ]}
    />
  );
}
