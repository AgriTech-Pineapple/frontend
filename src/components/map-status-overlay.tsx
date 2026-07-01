"use client";

// Overlays rendered on top of the Leaflet viewport. All positioned at z-[900] —
// above Leaflet's internal panes (max z-index 700) so nothing the map draws
// (tiles, markers, tooltips) can cover these, but below floating controls
// like the view-options dropdown (z-[1000]).
export function MapStatusOverlay({
  status,
  label,
  plantsProgress,
}: {
  status: "loading" | "ready" | "offline";
  label?: string;
  /** null = no plant batch in progress; 0-100 = percent of features added to the map so far */
  plantsProgress: number | null;
}) {
  return (
    <>
      {status === "loading" && (
        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-background/10 backdrop-blur-md">
          <span className="rounded-xl bg-background px-4 py-2 text-xs text-muted-foreground animate-pulse">
            Loading map…
          </span>
        </div>
      )}

      {status === "offline" && (
        <div className="absolute top-3 left-3 z-[900] rounded-md border border-white/15 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground shadow-lg backdrop-blur-xl pointer-events-none">
          Tiler offline — run the tiler service to display imagery
        </div>
      )}

      {label && (
        <div className="absolute bottom-3 left-3 z-[900] rounded-md border border-white/15 bg-background/40 px-2.5 py-1 text-[11px] font-medium shadow-lg backdrop-blur-xl pointer-events-none">
          {label}
        </div>
      )}

      {/* Covers the map while plant markers are being built so the brief per-batch stalls
          read as "loading" instead of "frozen". */}
      {plantsProgress !== null && (
        <div className="absolute inset-0 z-[900] flex flex-col items-center justify-center gap-3 bg-background/10 backdrop-blur-md">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-background px-6 py-4">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                style={{ width: `${plantsProgress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Loading plant data… {plantsProgress}%
            </span>
          </div>
        </div>
      )}
    </>
  );
}
