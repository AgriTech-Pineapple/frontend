import { ReportsPage } from "@/components/reports-page";

export default function Page() {
  return (
    <ReportsPage
      eyebrow="Reports"
      title="Farm Reports"
      description="Agronomy, health and yield reports synthesised from drone and field data."
      reports={[
        { name: "May 2026 — Estate health composite", period: "1 May – 31 May", updated: "2d ago", type: "PDF" },
        { name: "Block C-3 stress investigation", period: "Week 23", updated: "3d ago", type: "PDF" },
        { name: "Yield forecast model — June revision", period: "1 Jun", updated: "5d ago", type: "PDF" },
        { name: "Plant count audit", period: "30 May", updated: "1w ago", type: "CSV" },
        { name: "Disease scouting digest", period: "Wk 21–22", updated: "2w ago", type: "PDF" },
        { name: "NDVI longitudinal — 12 months", period: "Jun 2025 – May 2026", updated: "3w ago", type: "PDF" },
      ]}
    />
  );
}
