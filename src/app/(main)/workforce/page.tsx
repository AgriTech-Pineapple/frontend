import { Users } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      eyebrow="Operations"
      title="Workforce"
      description="An end-to-end workforce module for plantation crews, supervisors and payroll."
      icon={Users}
      modules={[
        { title: "Worker directory & teams", body: "Roster, certifications, contact, daily availability." },
        { title: "Attendance & timesheets", body: "Mobile clock-in, geofenced jobsites, exception flags." },
        { title: "Task assignments", body: "Assign block-level tasks to crews with progress tracking." },
        { title: "Productivity analytics", body: "Per-team output, harvest pace, anomaly detection." },
      ]}
    />
  );
}
