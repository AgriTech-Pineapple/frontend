import { useEffect, useRef } from "react";

const rows = [
  {
    badge: "NDVI",
    measure: "Greenness",
    healthy: "0.7–0.9",
  },
  {
    badge: "NDRE",
    measure: "Nitrogen",
    healthy: "0.4–0.6",
  },
  {
    badge: "SAVI",
    measure: "Sparse canopy",
    healthy: "Higher = Better",
  },
];

export default function InfoCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="w-[390px] rounded-xl border border-border/60 bg-background/90 backdrop-blur-md shadow-lg"
    >
      <div className="p-4">
        <h2 className="text-base font-semibold">
          Vegetation Index Guide
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Quick reference for map layers.
        </p>

        <div className="mt-4 overflow-hidden rounded-lg bg-muted/20">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border/60">
                <th className="px-3 py-2 text-left font-medium">Index</th>
                <th className="px-3 py-2 text-left font-medium">Measures</th>
                <th className="px-3 py-2 text-left font-medium">Healthy</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.badge}
                  className={
                    i !== rows.length - 1
                      ? "border-b border-border/40"
                      : ""
                  }
                >
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                      {row.badge}
                    </span>
                  </td>

                  <td className="px-3 py-2">{row.measure}</td>

                  <td className="px-3 py-2 text-muted-foreground">
                    {row.healthy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}