# Agritech Platform — Next.js 16 Rebuild Reference

This document is the single source of truth for rebuilding the Agritech farm intelligence platform inside the existing `roots-and-rays/frontend/` scaffold. Everything in the original `randr-ref/` TanStack Start project is captured here, translated to Next.js 16 App Router conventions.

---

## 1. Starting point — what already exists in `frontend/`

```
frontend/
├── src/app/
│   ├── favicon.ico
│   ├── globals.css          ← REPLACE entirely with Agritech CSS
│   ├── layout.tsx           ← REPLACE with Agritech root layout
│   └── page.tsx             ← REPLACE with Dashboard page
├── public/                  ← keep or ignore defaults
├── AGENTS.md                ← DO NOT DELETE — important instructions
├── CLAUDE.md                ← DO NOT DELETE
├── next.config.ts           ← keep as-is (empty config is fine)
├── postcss.config.mjs       ← keep as-is (uses @tailwindcss/postcss)
├── tsconfig.json            ← keep as-is (@/* alias already set to ./src/*)
├── package.json             ← ADD missing dependencies
└── eslint.config.mjs        ← keep as-is
```

**Installed versions (do not upgrade):**
- `next`: 16.2.9
- `react` / `react-dom`: 19.2.4
- `tailwindcss`: ^4 (v4, uses `@import "tailwindcss"` not a config file)
- `@tailwindcss/postcss`: ^4
- `typescript`: ^5

**Not yet installed — must `npm install` these:**
```
lucide-react
recharts
class-variance-authority
clsx
tailwind-merge
tw-animate-css
@radix-ui/react-accordion
@radix-ui/react-alert-dialog
@radix-ui/react-aspect-ratio
@radix-ui/react-avatar
@radix-ui/react-checkbox
@radix-ui/react-collapsible
@radix-ui/react-context-menu
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-hover-card
@radix-ui/react-label
@radix-ui/react-menubar
@radix-ui/react-navigation-menu
@radix-ui/react-popover
@radix-ui/react-progress
@radix-ui/react-radio-group
@radix-ui/react-scroll-area
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slider
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-toggle
@radix-ui/react-toggle-group
@radix-ui/react-tooltip
react-hook-form
@hookform/resolvers
zod
date-fns
sonner
cmdk
vaul
embla-carousel-react
input-otp
react-day-picker
react-resizable-panels
```

shadcn/ui: initialise with `npx shadcn@latest init` selecting **new-york** style, Tailwind CSS, and the `@/*` alias. Then add components: `npx shadcn@latest add sidebar collapsible tabs card badge button input label select separator switch slider checkbox popover scroll-area tooltip sonner`.

---

## 2. AGENTS.md warning (important)

The file `frontend/AGENTS.md` says:

> This is NOT the Next.js you know. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.

Before writing any Next.js-specific code, read:
- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`

Key facts confirmed from those docs:
- App Router uses `src/app/` (already in this scaffold)
- `layout.tsx` wraps pages via `children` prop (not `<Outlet />`)
- Routes: `src/app/page.tsx` → `/`, `src/app/farm/overview/page.tsx` → `/farm/overview`
- Navigation: `import Link from 'next/link'`, `import { useRouter, usePathname } from 'next/navigation'`
- React context requires `"use client"` directive
- Metadata: `export const metadata = { title: "..." }` at top of any page/layout
- Server Components are the default; add `"use client"` only when using hooks/browser APIs

---

## 3. Final file structure to build

All source files live under `src/`. The `@/*` alias already maps to `src/*`.

```
src/
├── app/
│   ├── globals.css                        ← all CSS tokens + Tailwind import
│   ├── layout.tsx                         ← root layout (html/body + providers + shell)
│   ├── not-found.tsx                      ← 404 page
│   ├── error.tsx                          ← error boundary ("use client")
│   ├── page.tsx                           ← / Dashboard
│   ├── farm/
│   │   ├── overview/page.tsx
│   │   ├── plants/page.tsx
│   │   ├── health/page.tsx
│   │   ├── growth/page.tsx
│   │   ├── yield/page.tsx
│   │   └── history/page.tsx
│   ├── gis/
│   │   ├── map/page.tsx
│   │   ├── ndvi/page.tsx
│   │   ├── ndre/page.tsx
│   │   ├── health/page.tsx
│   │   ├── terrain/page.tsx
│   │   └── yield/page.tsx
│   ├── workforce/
│   │   ├── page.tsx                       ← ComingSoon
│   │   ├── workers/page.tsx
│   │   ├── teams/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── forms/page.tsx
│   ├── drones/
│   │   ├── page.tsx                       ← ComingSoon
│   │   ├── missions/page.tsx
│   │   ├── equipment/page.tsx
│   │   └── logs/page.tsx
│   ├── reports/
│   │   ├── farm/page.tsx
│   │   ├── workforce/page.tsx             ← ComingSoon
│   │   └── executive/page.tsx             ← ComingSoon
│   ├── alerts/page.tsx
│   ├── data/page.tsx
│   ├── settings/page.tsx
│   └── profile/page.tsx
├── components/
│   ├── providers.tsx                      ← "use client" — QueryClient + FarmProvider + SidebarProvider
│   ├── app-sidebar.tsx                    ← "use client" — needs usePathname
│   ├── top-bar.tsx                        ← "use client" — needs Popover state
│   ├── page-header.tsx                    ← server-safe (pure UI)
│   ├── farm-ui.tsx                        ← KpiCard, FieldMap, LegendSwatch (server-safe)
│   ├── gis-workspace.tsx                  ← "use client" — needs usePathname
│   ├── coming-soon.tsx                    ← server-safe
│   ├── reports-page.tsx                   ← server-safe
│   └── ui/                               ← shadcn components
├── lib/
│   ├── farms.tsx                          ← "use client" — FarmProvider uses useState/useEffect
│   └── utils.ts                           ← cn() helper
└── hooks/
    └── use-mobile.tsx
```

---

## 4. TanStack Start → Next.js 16 translation guide

| TanStack Start | Next.js 16 equivalent |
|---|---|
| `createFileRoute("/farm/overview")` | `src/app/farm/overview/page.tsx` with `export default function Page()` |
| `createRootRouteWithContext()` | `src/app/layout.tsx` with `export default function RootLayout({ children })` |
| `<Outlet />` | `{children}` prop in layout |
| `head: () => ({ meta: [...] })` | `export const metadata = { title: "...", description: "..." }` |
| `Link` from `@tanstack/react-router` | `Link` from `next/link` |
| `useNavigate()` + `navigate({ to: "/..." })` | `useRouter()` from `next/navigation` + `router.push("/...")` |
| `useRouterState({ select: s => s.location.pathname })` | `usePathname()` from `next/navigation` |
| `<Scripts />`, `<HeadContent />` | Handled automatically by Next.js — do not add |
| `createStart()`, `server.ts` | Delete entirely — Next.js handles SSR |
| `routeTree.gen.ts` | Delete — Next.js has file-based routing built-in |
| `FarmProvider` wrapping in `__root.tsx` | Move to `src/components/providers.tsx` ("use client"), import in `layout.tsx` |
| `QueryClientProvider` | Same — move to `providers.tsx` |
| `SidebarProvider` | Same — move to `providers.tsx` |

---

## 5. Root layout (`src/app/layout.tsx`)

This is a **Server Component**. It imports `Providers` (a client component) which wraps children with all context providers.

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { SidebarInset } from "@/components/ui/sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agritech — Farm Intelligence Platform",
  description: "Enterprise agricultural intelligence for plantation operators, agronomists and drone teams.",
  openGraph: {
    title: "Agritech — Farm Intelligence Platform",
    description: "Enterprise agricultural intelligence for plantation operators, agronomists and drone teams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agritech — Farm Intelligence Platform",
    description: "Enterprise agricultural intelligence for plantation operators, agronomists and drone teams.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <AppSidebar />
          <SidebarInset className="bg-background">
            <TopBar />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        </Providers>
      </body>
    </html>
  );
}
```

---

## 6. Providers (`src/components/providers.tsx`)

Must be `"use client"` because it uses React context.

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FarmProvider } from "@/lib/farms";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <FarmProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </FarmProvider>
    </QueryClientProvider>
  );
}
```

> **Note:** `@tanstack/react-query` must be added to dependencies. `FarmProvider` uses `useState`/`useEffect`/`localStorage` so it must also be `"use client"`.

---

## 7. CSS (`src/app/globals.css`)

Replace the default `globals.css` entirely with this content. Tailwind v4 uses `@import "tailwindcss"` — no config file needed.

```css
@import "tailwindcss" source(none);
@source "../";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-ring-offset-background: var(--background);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sage: var(--sage);
  --color-sage-deep: var(--sage-deep);
  --color-olive: var(--olive);
  --color-harvest: var(--harvest);
  --color-clay: var(--clay);
  --color-sand: var(--sand);
  --color-stone: var(--stone);
  --font-display: "Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif;
}

:root {
  --radius: 0.75rem;
  --background: oklch(0.985 0.008 90);
  --foreground: oklch(0.27 0.018 110);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.27 0.018 110);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.27 0.018 110);
  --primary: oklch(0.43 0.045 135);
  --primary-foreground: oklch(0.98 0.008 90);
  --secondary: oklch(0.94 0.012 100);
  --secondary-foreground: oklch(0.32 0.025 120);
  --muted: oklch(0.95 0.01 95);
  --muted-foreground: oklch(0.5 0.018 110);
  --accent: oklch(0.93 0.03 105);
  --accent-foreground: oklch(0.32 0.04 125);
  --destructive: oklch(0.55 0.16 28);
  --destructive-foreground: oklch(0.98 0.008 90);
  --border: oklch(0.9 0.012 95);
  --input: oklch(0.92 0.012 95);
  --ring: oklch(0.55 0.05 130);
  --sage: oklch(0.72 0.045 135);
  --sage-deep: oklch(0.43 0.045 135);
  --olive: oklch(0.55 0.07 110);
  --harvest: oklch(0.74 0.12 85);
  --clay: oklch(0.62 0.09 55);
  --sand: oklch(0.88 0.03 90);
  --stone: oklch(0.6 0.012 100);
  --chart-1: oklch(0.55 0.07 135);
  --chart-2: oklch(0.7 0.1 85);
  --chart-3: oklch(0.6 0.08 55);
  --chart-4: oklch(0.48 0.04 110);
  --chart-5: oklch(0.78 0.04 95);
  --sidebar: oklch(0.965 0.012 95);
  --sidebar-foreground: oklch(0.32 0.018 110);
  --sidebar-primary: oklch(0.43 0.045 135);
  --sidebar-primary-foreground: oklch(0.98 0.008 90);
  --sidebar-accent: oklch(0.92 0.018 105);
  --sidebar-accent-foreground: oklch(0.32 0.04 125);
  --sidebar-border: oklch(0.9 0.012 95);
  --sidebar-ring: oklch(0.55 0.05 130);
}

.dark {
  --background: oklch(0.18 0.01 110);
  --foreground: oklch(0.95 0.008 95);
  --card: oklch(0.22 0.012 110);
  --card-foreground: oklch(0.95 0.008 95);
  --popover: oklch(0.22 0.012 110);
  --popover-foreground: oklch(0.95 0.008 95);
  --primary: oklch(0.78 0.05 130);
  --primary-foreground: oklch(0.22 0.012 110);
  --secondary: oklch(0.28 0.014 110);
  --secondary-foreground: oklch(0.95 0.008 95);
  --muted: oklch(0.26 0.012 110);
  --muted-foreground: oklch(0.7 0.012 100);
  --accent: oklch(0.3 0.025 115);
  --accent-foreground: oklch(0.95 0.008 95);
  --destructive: oklch(0.65 0.18 28);
  --destructive-foreground: oklch(0.98 0.008 90);
  --border: oklch(1 0 0 / 8%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.55 0.05 130);
  --sidebar: oklch(0.2 0.012 110);
  --sidebar-foreground: oklch(0.92 0.008 95);
  --sidebar-primary: oklch(0.78 0.05 130);
  --sidebar-primary-foreground: oklch(0.22 0.012 110);
  --sidebar-accent: oklch(0.28 0.014 110);
  --sidebar-accent-foreground: oklch(0.95 0.008 95);
  --sidebar-border: oklch(1 0 0 / 8%);
  --sidebar-ring: oklch(0.55 0.05 130);
}

@layer base {
  * { border-color: var(--color-border); }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-feature-settings: "ss01", "cv11";
  }
  h1, h2, h3, h4, .font-display {
    font-family: "Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif;
    font-feature-settings: "ss01", "cv11";
    letter-spacing: -0.02em;
  }
  .font-num {
    font-family: "Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif;
    font-feature-settings: "tnum", "ss01", "cv11";
    letter-spacing: -0.02em;
  }
}

.farm-grid-bg {
  background-image:
    linear-gradient(oklch(0.55 0.05 130 / 0.12) 1px, transparent 1px),
    linear-gradient(90deg, oklch(0.55 0.05 130 / 0.12) 1px, transparent 1px);
  background-size: 28px 28px;
}

.topo-bg {
  background:
    radial-gradient(ellipse at 30% 40%, oklch(0.78 0.06 130 / 0.5), transparent 55%),
    radial-gradient(ellipse at 70% 60%, oklch(0.82 0.08 95 / 0.45), transparent 55%),
    radial-gradient(ellipse at 50% 80%, oklch(0.7 0.05 110 / 0.4), transparent 60%),
    oklch(0.93 0.02 100);
}
```

---

## 8. Global data model (`src/lib/farms.tsx`)

This file must have `"use client"` at the top because `FarmProvider` uses `useState`/`useEffect`/`localStorage`. Copy the entire file from `randr-ref/src/lib/farms.tsx` verbatim, just add `"use client"` as the first line.

The full TypeScript type, all three farm objects, the `ACCOUNT` constant, `FarmProvider`, and `useFarm` hook are all in that one file.

**Farm IDs:** `"farm-1"` | `"farm-2"` | `"farm-3"`

**Three farms summary:**

| | Farm 1 | Farm 2 | Farm 3 |
|---|---|---|---|
| Name | Farm 1 | Farm 2 | Farm 3 |
| Subtitle | Highland Pineapple Estate | Lowland Oil Palm Estate | Coastal Pineapple Estate |
| Region | Cameron Highlands, Pahang | Sandakan, Sabah | Pontian, Johor |
| Crop | Pineapple | Oil Palm | Pineapple |
| Accent color | `"sage"` | `"harvest"` | `"olive"` |
| Area | 1,247 ha | 842 ha | 1,583 ha |
| Blocks | 38 | 26 | 47 |
| NDVI | 0.77 | 0.69 | 0.81 |
| Yield | 61.4 t/ha | 54.8 t/ha | 68.9 t/ha |
| YoY | +8.7% | +2.4% | +11.3% |

**Account:**
```ts
{ firstName: "Nishit", fullName: "Nishit DB", email: "nishit.db@gmail.com", role: "Estate Manager", initials: "NDB" }
```

**localStorage key:** `"agritech.farm"` — persists the active `FarmId`.

---

## 9. App shell components

### `src/components/app-sidebar.tsx` — `"use client"`

Uses `usePathname()` from `next/navigation` (replaces `useRouterState`).
Uses `Link` from `next/link`.
Everything else is identical to the original — copy the JSX and nav data structure.

```ts
// at top of file
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
// ... rest of imports same as original
```

**Navigation sections** (copy exactly):
```
OVERVIEW
  Dashboard  /  LayoutDashboard icon

INTELLIGENCE
  Farm Intelligence  /farm/overview  Sprout icon — collapsible children:
    Overview /farm/overview
    Plant Count /farm/plants
    Health Analysis /farm/health
    Growth Analysis /farm/growth
    Yield Forecast /farm/yield
    Historical Monitoring /farm/history
  GIS Mapping  /gis/map  Map icon

OPERATIONS
  Workforce  /workforce  Users icon
  Drone Operations  /drones  Plane icon

INSIGHTS
  Reports  /reports/farm  FileBarChart icon — collapsible children:
    Farm Reports /reports/farm
    Workforce Reports /reports/workforce
    Executive Reports /reports/executive
  Alerts  /alerts  Bell icon

SYSTEM
  Data Management  /data  Database icon
  Settings  /settings  Settings icon
```

**Sidebar header:** `<Link href="/">` with `h-9 w-9` sage-deep bg box containing a `Leaf` icon, then "Agritech" + "Farm Intelligence" text (hidden when `collapsible="icon"`).

**Sidebar footer:** `<Link href="/profile">` with initials avatar (gradient from-sage to-olive) + name + role.

### `src/components/top-bar.tsx` — `"use client"`

Uses `Popover` (interactive) → needs `"use client"`.

Sticky header `h-14 bg-background/85 backdrop-blur border-b border-border/60`.

Contents left→right:
1. `<SidebarTrigger />` + `<Separator orientation="vertical" className="h-5" />`
2. Search input: `placeholder="Search fields, workers, missions, reports…"` max-w-md, `bg-muted/40 border-transparent`
3. Season badge (hidden mobile): "Season 25/26 · Week 41" with Calendar icon
4. Bell Popover (with clay dot indicator): shows 5 hardcoded recent alerts sorted High→Medium→Low

**Hardcoded TopBar alerts:**
```ts
[
  { level: "High", farm: "Farm 1", title: "Severe stress in Block C-3", ago: "2h ago" },
  { level: "High", farm: "Farm 2", title: "Severe stress patch in Block W-2", ago: "1h ago" },
  { level: "Medium", farm: "Farm 3", title: "Salinity stress in Block BD-4", ago: "3h ago" },
  { level: "Medium", farm: "Farm 2", title: "Sprinkler pressure low on Sector 3", ago: "4h ago" },
  { level: "Low", farm: "Farm 1", title: "Drone survey completed", ago: "1d ago" },
]
```

Sort order: High=0, Medium=1, Low=2.

### `src/components/page-header.tsx` — server-safe

```tsx
export function PageHeader({
  eyebrow, title, description, actions,
}: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode })
```

Layout: `flex flex-col gap-4 border-b border-border/60 pb-6 md:flex-row md:items-end md:justify-between`.
Title: `font-display text-3xl font-semibold tracking-tight md:text-[34px]`.

### `src/components/farm-ui.tsx` — server-safe

Three exports: `KpiCard`, `FieldMap`, `LegendSwatch`.

**KpiCard:** `p-5 border-border/60 shadow-none` card. Value uses `font-num text-3xl font-semibold tabular-nums`. Icon box: 9×9 rounded-lg in accent color. Delta: sage/10 badge below.

Accent → bg/text mapping:
- sage → `bg-sage/15 text-sage-deep`
- harvest → `bg-harvest/20 text-clay`
- clay → `bg-clay/15 text-clay`
- olive → `bg-olive/15 text-olive`

**FieldMap:** CSS-only map. Structure:
```
div.topo-bg (overflow-hidden rounded-xl border border-border/60)
  div (absolute inset-0) ← overlay radial gradient via style prop
  div.farm-grid-bg (absolute inset-0 opacity-40)
  svg (400×300 viewBox, preserveAspectRatio="none") ← 3 dashed field boundary polygons
  optional pins (3 colored dots at fixed % positions)
  optional label badge (bottom-left, bg-background/85 backdrop-blur)
  coord badge (top-right: "14.227 ha · 18°N 121°E")
```

SVG boundary paths:
```
M 30 40 L 180 25 L 220 90 L 200 180 L 90 220 L 35 150 Z
M 230 60 L 360 70 L 380 200 L 280 250 L 230 180 Z
M 120 230 L 220 240 L 250 280 L 130 290 Z
```
Stroke: `oklch(0.3 0.04 120 / .55)`, strokeWidth 1.2, strokeDasharray "3 3".

Pin positions (percent): sage-deep at `left-[22%] top-[28%]`, clay at `left-[58%] top-[48%]`, harvest at `left-[78%] top-[22%]`. Each is `h-2 w-2 rounded-full ring-4`.

Overlay radial gradient strings (copy exactly from `randr-ref/src/components/farm-ui.tsx`):
- **ndvi:** multi-circle green/amber blend
- **ndre:** 3 circles, deep greens
- **health:** 3 circles — green/yellow-green/orange-brown
- **terrain:** 3 circles in brown-earth
- **yield:** 3 circles in warm amber/orange
- **plain:** single subtle green radial

### `src/components/gis-workspace.tsx` — `"use client"`

Needs `usePathname()` for the active layer tab.

Layer tab data:
```ts
const layers = [
  { url: "/gis/map", label: "Composite" },
  { url: "/gis/ndvi", label: "NDVI" },
  { url: "/gis/ndre", label: "NDRE" },
  { url: "/gis/health", label: "Health" },
  { url: "/gis/terrain", label: "Terrain" },
  { url: "/gis/yield", label: "Yield" },
];
```

Layout: PageHeader → layer tab bar → `grid gap-4 lg:grid-cols-[280px_1fr]`:
- Left: 3 cards — Layers (7 checkboxes), Opacity slider + Date select, Legend
- Right: card with search input + toolbar icons + `FieldMap h-[560px]` + status bar

7 layer checkboxes (first 5 checked): Estate boundaries ✓, Block divisions ✓, Irrigation lines ✓, Pathways ✓, Drone flight paths ✓, Sample points ✗, Stress hotspots ✗.

### `src/components/coming-soon.tsx` — server-safe

```tsx
export function ComingSoon({ eyebrow, title, description, icon: Icon, modules, eta = "Q3 2026" })
```

Full-width card with `topo-bg + farm-grid-bg` backgrounds (both semi-transparent via `opacity-60` and `opacity-30`). Left: sage-deep icon box + ETA badge + large heading + description + animated pulse dot. Right: 4 module cards with `bg-background/70 backdrop-blur`.

### `src/components/reports-page.tsx` — server-safe

```tsx
export function ReportsPage({ eyebrow, title, description, reports })
// reports: { name: string; period: string; updated: string; type: string }[]
```

Search input + "Last 90 days" badge + list. Each report: FileText icon (sage/15 bg), name, period·updated, type badge, Download button.

---

## 10. Recharts — must be "use client"

All chart pages/components that use Recharts need `"use client"` because Recharts uses browser APIs. Apply it directly to the page file or extract charts into separate `"use client"` components.

Chart styling conventions used everywhere:
```tsx
<CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
<XAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
<YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
<Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
```

Chart colors via CSS vars: `var(--sage-deep)`, `var(--olive)`, `var(--clay)`, `var(--harvest)`, `var(--sage)`.

Bar radius always `[6, 6, 0, 0]`. Area fills use `linearGradient` from `stopOpacity={0.35}` to `{0}`.

---

## 11. 404 and error pages

**`src/app/not-found.tsx`** (server component):
```tsx
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-medium">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Go home</Link>
      </div>
    </div>
  );
}
```

**`src/app/error.tsx`** (`"use client"` — required by Next.js for error boundaries):
```tsx
"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={reset} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Try again</button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}
```

---

## 12. Per-page metadata

Each `page.tsx` exports metadata like this:
```tsx
export const metadata = { title: "Dashboard — Agritech" };
```

All page titles follow the pattern `"{Page} — Agritech"`.

---

## 13. Page-by-page content specification

### `src/app/page.tsx` — Dashboard (`/`)

**Needs `"use client"`** — uses `useFarm()`, `useRouter()`.

**Page title:** `"Dashboard — Agritech"`

Portfolio header: `PageHeader` with:
- eyebrow: `"Portfolio · 3 farms"`
- title: `"Good afternoon, {ACCOUNT.firstName}"`
- description: `"Pick a farm to dive in, or review portfolio-wide signals on the right."`
- actions: `<Button variant="outline" size="sm">Export portfolio brief</Button>`

Layout: `grid gap-8 lg:grid-cols-[1.55fr_1fr]`

**Left (farm selector):**
- Heading "Your farms" + hint text
- 3 farm cards (clickable → `setFarmId(id)` then `router.push("/farm/overview")`)
- Each card: `grid md:grid-cols-[200px_1fr]`, left=FieldMap overlay (sage→"health", olive→"ndvi", harvest→"ndre", showPins=false), right=region+MapPin, name, subtitle, crop badge, 4-col dl (Area/Plants/Healthy/Yield), "Open farm" ArrowUpRight
- "Add farm" dashed card: `border-2 border-dashed border-border/70 border-border/70 bg-muted/20` with Plus icon circle + text

**Right (portfolio signals):**
Card 1 — "Portfolio at a glance" + `+7.4% YoY` badge:
```
Total area: 3,672 ha | Total plants: 8.03 M | Healthy canopy: 85.5% | Avg yield forecast: 61.7 t/ha
```
2×2 grid of `rounded-lg bg-muted/30 p-3` stat boxes.

Card 2 — "Recommendations" + "AI · today" outline badge:
```ts
[
  { farm: "Farm 3", title: "Pull harvest crew forward to August", reason: "Crop ripening ahead of plan." },
  { farm: "Farm 2", title: "Inspect Block W-2 for pest damage", reason: "Cluster of stressed plants detected." },
  { farm: "Farm 1", title: "Reduce irrigation on Block C-3", reason: "Soil too wet after recent rain." },
]
```
Each: `border-l-2 border-sage/40 pl-3`.

Card 3 — "Recent alerts · all farms":
```ts
[
  { level: "High", farm: "Farm 1", title: "Severe stress in Block C-3", ago: "2h ago" },
  { level: "High", farm: "Farm 2", title: "Severe stress patch in Block W-2", ago: "1h ago" },
  { level: "Medium", farm: "Farm 3", title: "Salt stress near shore", ago: "3h ago" },
  { level: "Medium", farm: "Farm 2", title: "Sprinkler pressure low", ago: "4h ago" },
  { level: "Low", farm: "Farm 1", title: "Drone survey completed", ago: "1d ago" },
]
```

---

### `src/app/farm/overview/page.tsx`

**`"use client"`** — uses `useFarm()`, `useRouter()`.

4 KpiCards: Total area, Plant population (olive), Healthy canopy (sage + ndviDelta), Yield Prediction (harvest + yieldDelta).

`grid lg:grid-cols-5`:
- col-span-3: "Estate boundary" + `FieldMap h-80` (overlay by accent)
- col-span-2: "Estate metadata" dl table — Crop, Estate type, Established, Soil profile, Avg elevation, Climate zone, Irrigation, Manager

"Yield Prediction" LineChart (`farm.yearlyYield`): expected (dashed, `--olive`) vs actual (solid, `--sage-deep`). Include crop in tooltip label. `connectNulls={false}`.

"Block parameters" table: Block, Area, Plants, Health badge, Yield forecast. Shows `farm.blockRows`.

Actions: "Change Farm" button (`router.push("/")`), "Generate report", "Edit metadata".

---

### `src/app/farm/plants/page.tsx`

**`"use client"`** — uses `useFarm()` + Recharts.

3 KpiCards: Total plants, Avg density (olive, hint "target 2,200"), Blank spots (harvest).

`grid lg:grid-cols-3`:
- col-span-2: BarChart `farm.densityByBlock` — `XAxis: block`, `YAxis: d` domain `[2000,2300]`, olive bars, ReferenceLine y=2200 (sage-deep dashed)
- col-1: "Detected gaps" — `FieldMap h-64 overlay="plain"` + list of 3 gap estimates

---

### `src/app/farm/health/page.tsx`

**`"use client"`** — uses `useFarm()` + Recharts.

4 KpiCards: Healthy (ndviDelta delta), Mild stress (harvest), Severe stress (clay), NDVI mean (olive + ndviDelta).

Tabs (NDVI / NDRE / SAVI): each tab → `LegendSwatch` + `FieldMap h-80`.

`grid lg:grid-cols-2`:
- LineChart `farm.indexTrend`: NDVI (sage-deep), NDRE (olive), SAVI (clay), no dots, 6 data points
- "Interpretation" card: `farm.interpretation` 3 paragraphs with `border-l-2 border-sage/40 pl-3`

"What do these indices mean?" 3-col grid: NDVI/Greenness, NDRE/Nitrogen & late growth, SAVI/Best for young canopies.

---

### `src/app/farm/growth/page.tsx`

**`"use client"`** — uses `useFarm()` + Recharts.

4 KpiCards: Avg canopy cover (canopyDelta), Growth uniformity (olive), Mean variance (harvest), Stage (sage).

`grid lg:grid-cols-2`:
- AreaChart `farm.canopy`: `XAxis: wk`, `YAxis: c`, olive fill gradient (0.4→0)
- BarChart `farm.variance`: `XAxis: block`, `YAxis: v`, clay bars

---

### `src/app/farm/yield/page.tsx`

**`"use client"`** — uses `useFarm()` + Recharts.

4 KpiCards: Season forecast (yieldDelta + confidence hint), Total tonnage (olive), Harvest window (harvest), Revenue projection (clay).

AreaChart `farm.monthlyBand`: 3 area series — high (sage fill gradient), mid (sage-deep line, no fill), low (background fill to erase band bottom). Creates a forecast band.

---

### `src/app/farm/history/page.tsx`

**`"use client"`** — uses `useFarm()` + Recharts.

4 KpiCards: Captures 12mo, NDVI Δ (olive, "Improving" delta), Yield Δ (harvest), Stress events (clay).

LineChart `farm.history`: dual Y axis — left for NDVI/NDRE/SAVI, right for Yield t/ha. 4 lines: NDVI (sage-deep), NDRE (olive), SAVI (harvest), Yield (clay).

"Recent captures" table: Date, Mission, Coverage, NDVI change, Remarks. Source: `farm.captures` (4 rows).

---

### `src/app/gis/map/page.tsx`

**`"use client"`** — uses `useFarm()` + local state for active layer.

Layer switcher uses `useState` (not URL-based links like the other GIS pages). 6 buttons: Composite, NDVI, NDRE, Health, Terrain, Yield.

Same 2-column layout as GisWorkspace except "Active layer" card shows current selection + "Showing {farm.name} · last capture 6 Jun 2026". Date select from `farm.captures.slice(0, 3)`.

Layer definitions:
```ts
const layers = [
  { key: "composite", label: "Composite", overlay: "health", legend: [
    { color: "oklch(0.55 0.16 130)", label: "Healthy" },
    { color: "oklch(0.78 0.14 95)", label: "Mild stress" },
    { color: "oklch(0.62 0.16 50)", label: "Severe stress" },
    { color: "oklch(0.7 0.04 100)", label: "Bare ground" },
  ]},
  { key: "ndvi", label: "NDVI", overlay: "ndvi", legend: [
    { color: "oklch(0.55 0.16 130)", label: "0.7 – 1.0" },
    { color: "oklch(0.75 0.14 110)", label: "0.5 – 0.7" },
    { color: "oklch(0.78 0.12 80)", label: "0.3 – 0.5" },
    { color: "oklch(0.62 0.15 45)", label: "< 0.3" },
  ]},
  { key: "ndre", label: "NDRE", overlay: "ndre", legend: [
    { color: "oklch(0.5 0.1 145)", label: "0.5+" },
    { color: "oklch(0.62 0.09 130)", label: "0.35 – 0.5" },
    { color: "oklch(0.75 0.07 110)", label: "< 0.35" },
    { color: "oklch(0.7 0.04 100)", label: "Bare" },
  ]},
  { key: "health", label: "Health", overlay: "health", legend: [/* same as composite */] },
  { key: "terrain", label: "Terrain", overlay: "terrain", legend: [
    { color: "oklch(0.65 0.06 80)", label: "Elevation low" },
    { color: "oklch(0.55 0.05 90)", label: "Mid" },
    { color: "oklch(0.45 0.04 100)", label: "High" },
  ]},
  { key: "yield", label: "Yield", overlay: "yield", legend: [
    { color: "oklch(0.78 0.14 90)", label: "> 65 t/ha" },
    { color: "oklch(0.68 0.16 75)", label: "55 – 65" },
    { color: "oklch(0.6 0.15 50)", label: "< 55" },
  ]},
]
```

---

### `src/app/gis/ndvi/page.tsx` — `"use client"` (GisWorkspace needs usePathname)

```tsx
<GisWorkspace
  overlay="ndvi"
  title="NDVI Layer"
  description="Normalised Difference Vegetation Index — overall plant vigor."
  legend={[
    { color: "oklch(0.5 0.18 135)", label: "0.8 – 1.0  vigorous" },
    { color: "oklch(0.65 0.15 130)", label: "0.6 – 0.8  healthy" },
    { color: "oklch(0.78 0.13 100)", label: "0.4 – 0.6  moderate" },
    { color: "oklch(0.62 0.15 50)", label: "< 0.4  stressed" },
  ]}
/>
```

### `src/app/gis/ndre/page.tsx`
```tsx
<GisWorkspace overlay="ndre" title="NDRE Layer"
  description="Red-edge index — early indicator of nitrogen and chlorophyll status."
  legend={[
    { color: "oklch(0.45 0.1 145)", label: "0.5+  optimal" },
    { color: "oklch(0.6 0.09 130)", label: "0.4 – 0.5" },
    { color: "oklch(0.74 0.07 110)", label: "0.3 – 0.4" },
    { color: "oklch(0.8 0.05 90)", label: "< 0.3  low" },
  ]}
/>
```

### `src/app/gis/health/page.tsx`
```tsx
<GisWorkspace overlay="health" title="Health Layer"
  description="Composite plant-health classification across the estate."
  legend={[
    { color: "oklch(0.55 0.16 130)", label: "Healthy" },
    { color: "oklch(0.78 0.14 95)", label: "Mild stress" },
    { color: "oklch(0.62 0.16 50)", label: "Severe stress" },
    { color: "oklch(0.7 0.04 100)", label: "Bare ground" },
  ]}
/>
```

### `src/app/gis/terrain/page.tsx`
```tsx
<GisWorkspace overlay="terrain" title="Terrain Layer"
  description="Digital surface model derived from photogrammetry — elevation 380 m to 462 m."
  legend={[
    { color: "oklch(0.45 0.04 100)", label: "460 m+" },
    { color: "oklch(0.55 0.05 95)", label: "420 – 460 m" },
    { color: "oklch(0.65 0.06 85)", label: "400 – 420 m" },
    { color: "oklch(0.78 0.06 80)", label: "< 400 m" },
  ]}
/>
```

### `src/app/gis/yield/page.tsx`
```tsx
<GisWorkspace overlay="yield" title="Yield Layer"
  description="Predicted tonnage per hectare across cultivated blocks."
  legend={[
    { color: "oklch(0.78 0.14 90)", label: "65+ t/ha" },
    { color: "oklch(0.7 0.15 75)", label: "55 – 65 t/ha" },
    { color: "oklch(0.6 0.15 50)", label: "45 – 55 t/ha" },
    { color: "oklch(0.5 0.14 40)", label: "< 45 t/ha" },
  ]}
/>
```

---

### `src/app/workforce/page.tsx` — ComingSoon

```tsx
<ComingSoon eyebrow="Operations" title="Workforce"
  description="An end-to-end workforce module for plantation crews, supervisors and payroll."
  icon={Users}
  modules={[
    { title: "Worker directory & teams", body: "Roster, certifications, contact, daily availability." },
    { title: "Attendance & timesheets", body: "Mobile clock-in, geofenced jobsites, exception flags." },
    { title: "Task assignments", body: "Assign block-level tasks to crews with progress tracking." },
    { title: "Productivity analytics", body: "Per-team output, harvest pace, anomaly detection." },
  ]}
/>
```

---

### `src/app/workforce/workers/page.tsx`

**`"use client"`** — KpiCards + Badge interactions.

4 KpiCards: Total workers=168 (6 teams), On duty=142 (84.5%, olive), Avg performance=92.1 (sage), Open positions=4 (harvest).

Hardcoded workers:
```ts
const workers = [
  { id: "WK-0142", name: "Esteban Rivera", role: "Field Lead", team: "Alpha", location: "Block C-3", status: "On duty", perf: 94 },
  { id: "WK-0118", name: "Liwayway Santos", role: "Agronomist", team: "Science", location: "Lab", status: "On duty", perf: 97 },
  { id: "WK-0087", name: "Marcos Delgado", role: "Harvester", team: "Bravo", location: "Block A-2", status: "On duty", perf: 89 },
  { id: "WK-0203", name: "Pilar Ocampo", role: "Irrigator", team: "Charlie", location: "Block B-1", status: "Break", perf: 91 },
  { id: "WK-0167", name: "Diego Mariano", role: "Drone Pilot", team: "Skyline", location: "Hangar", status: "Off duty", perf: 92 },
  { id: "WK-0231", name: "Aurora Tan", role: "Supervisor", team: "Bravo", location: "Block A-1", status: "On duty", perf: 95 },
  { id: "WK-0099", name: "Ramon Velasco", role: "Harvester", team: "Bravo", location: "Block C-4", status: "On duty", perf: 88 },
  { id: "WK-0254", name: "Imelda Cruz", role: "Field Lead", team: "Delta", location: "Block D-2", status: "On duty", perf: 93 },
];
```

Table: Worker (avatar circle gradient from-sage to-olive + name + ID), Role, Team, Location (MapPin icon), Status (badge), Performance (progress bar `h-1.5 w-20 bg-muted` → inner `bg-olive` at `{perf}%` + number).

Status badge: "On duty"=sage, "Break"=harvest, "Off duty"=muted.

---

### `src/app/workforce/teams/page.tsx`

**`"use client"`** — Recharts.

3 KpiCards: Active teams=6, Avg utilization=74% (olive), Top performer=Science (sage).

Hardcoded teams:
```ts
const teams = [
  { name: "Alpha", lead: "E. Rivera", size: 28, focus: "Field operations", load: 82, perf: 94 },
  { name: "Bravo", lead: "A. Tan", size: 32, focus: "Harvesting", load: 91, perf: 92 },
  { name: "Charlie", lead: "P. Ocampo", size: 24, focus: "Irrigation", load: 68, perf: 90 },
  { name: "Delta", lead: "I. Cruz", size: 26, focus: "Planting", load: 74, perf: 93 },
  { name: "Science", lead: "L. Santos", size: 12, focus: "Agronomy & QA", load: 60, perf: 97 },
  { name: "Skyline", lead: "D. Mariano", size: 8, focus: "Drone operations", load: 71, perf: 95 },
];
```

2 charts: horizontal BarChart (workload, `layout="vertical"`, olive, domain [0,100]) + vertical BarChart (performance, sage-deep, domain [80,100]).

3-col team cards grid: each card has name, focus, size badge, lead name, 2-stat grid (Workload%, Performance score).

---

### `src/app/workforce/tasks/page.tsx`

**`"use client"`**.

Hardcoded tasks:
```ts
const tasks = [
  { id: "T-2148", title: "Harvest Block A-2 sector 3", team: "Bravo", lead: "A. Tan", due: "Today 17:00", progress: 72, status: "In Progress" },
  { id: "T-2151", title: "Foliar feed Block B-1", team: "Charlie", lead: "P. Ocampo", due: "Fri 09:00", progress: 0, status: "Not Started" },
  { id: "T-2143", title: "Drip line inspection Block C-3", team: "Charlie", lead: "P. Ocampo", due: "Yesterday", progress: 40, status: "Overdue" },
  { id: "T-2138", title: "Replanting · Block D-1 north", team: "Delta", lead: "I. Cruz", due: "Mon 14:00", progress: 100, status: "Completed" },
  { id: "T-2156", title: "Drone survey · Sector 5", team: "Skyline", lead: "D. Mariano", due: "Today 06:30", progress: 100, status: "Completed" },
  { id: "T-2160", title: "Soil moisture sampling", team: "Science", lead: "L. Santos", due: "Wed 11:00", progress: 25, status: "In Progress" },
];
```

4 KpiCards (computed from tasks array): Not started, In progress (harvest), Completed today (sage), Overdue (clay).

Table: Task (title + ID·lead), Team, Due, Progress (bar `h-1.5 w-24 bg-muted` inner `bg-sage-deep` at `{t.progress}%` + %), Status badge.

Status tone: "Not Started"=muted, "In Progress"=harvest, "Completed"=sage, "Overdue"=clay.

---

### `src/app/workforce/attendance/page.tsx`

**`"use client"`** — Recharts.

4 KpiCards: Present=142 (sage), Absent=14 (clay), On leave=12 (harvest), 7-day avg=86.1% (olive).

LineChart 7-day trend:
```ts
const trend = [
  { d: "Mon", a: 88 }, { d: "Tue", a: 86 }, { d: "Wed", a: 91 },
  { d: "Thu", a: 84 }, { d: "Fri", a: 89 }, { d: "Sat", a: 76 }, { d: "Sun", a: 0 },
];
```

Today's log table (6 workers):
```ts
const log = [
  { name: "E. Rivera", in: "05:42", out: "—", hrs: "6.3h", status: "Present" },
  { name: "A. Tan", in: "05:48", out: "—", hrs: "6.2h", status: "Present" },
  { name: "M. Delgado", in: "06:02", out: "—", hrs: "6.0h", status: "Present" },
  { name: "P. Ocampo", in: "—", out: "—", hrs: "—", status: "Leave" },
  { name: "D. Mariano", in: "—", out: "—", hrs: "—", status: "Absent" },
  { name: "R. Velasco", in: "05:39", out: "—", hrs: "6.4h", status: "Present" },
];
```

Status: Present=`bg-sage/15 text-sage-deep`, Leave=`bg-harvest/25 text-clay`, Absent=`bg-clay/15 text-clay` (use `rounded-full px-2 py-0.5 text-xs` span, not Badge).

---

### `src/app/workforce/analytics/page.tsx`

**`"use client"`** — Recharts.

4 KpiCards: Productivity index=92 (▲4pts delta), Tasks/worker/day=3.7 (olive), On-time completion=89.4% (sage), Avg overtime=42 min (harvest).

```ts
const prod = [
  { w: "W34", p: 78 }, { w: "W35", p: 82 }, { w: "W36", p: 79 },
  { w: "W37", p: 85 }, { w: "W38", p: 88 }, { w: "W39", p: 87 },
  { w: "W40", p: 90 }, { w: "W41", p: 92 },
];
const completion = [
  { t: "Bravo", c: 96 }, { t: "Alpha", c: 92 }, { t: "Delta", c: 88 },
  { t: "Charlie", c: 81 }, { t: "Science", c: 94 }, { t: "Skyline", c: 90 },
];
```

AreaChart `prod` (sage-deep fill gradient) + BarChart `completion` (olive, domain [60,100]).

---

### `src/app/workforce/forms/page.tsx`

**`"use client"`** (has "New form" button action).

6 form cards in `grid md:grid-cols-2 lg:grid-cols-3`:
```ts
const forms = [
  { name: "Planting Record", icon: Sprout, fields: 11, used: 142, updated: "2d ago" },
  { name: "Irrigation Log", icon: Droplets, fields: 8, used: 318, updated: "1d ago" },
  { name: "Fertilizer Application", icon: Wheat, fields: 14, used: 96, updated: "3d ago" },
  { name: "Disease Inspection", icon: Bug, fields: 16, used: 64, updated: "5d ago" },
  { name: "Drone Survey", icon: Plane, fields: 9, used: 48, updated: "today" },
  { name: "Harvest Record", icon: ClipboardList, fields: 12, used: 210, updated: "today" },
];
```

Each card: icon (sage/15 bg), version badge "v1.4", form name, field count + updated date, submission count + "View →" text.

Recent submissions list (4 items):
```
Harvest Record · Block A-2  /  M. Delgado  /  12 min ago
Drone Survey · MX-218  /  D. Mariano  /  2h ago
Irrigation Log · Block B-1  /  P. Ocampo  /  4h ago
Disease Inspection · Block C-3  /  L. Santos  /  yesterday
```

---

### `src/app/drones/page.tsx` — ComingSoon

```tsx
<ComingSoon eyebrow="Operations" title="Drone Operations"
  description="Mission planning, telemetry and fleet management for the agronomy drone program."
  icon={Plane}
  modules={[
    { title: "Mission planner", body: "Auto-generate flight paths per block with overlap, altitude, sidelap controls." },
    { title: "Live flight telemetry", body: "Battery, GPS lock, payload status across the active fleet." },
    { title: "Fleet & equipment", body: "Airframe hours, sensor calibration, maintenance scheduling." },
    { title: "Survey history", body: "Searchable archive of every capture with ortho previews." },
  ]}
/>
```

---

### `src/app/drones/missions/page.tsx`

**`"use client"`**.

4 KpiCards: Active=1 (Plane icon, harvest), Scheduled=6, Completed(mo)=22 (olive), Coverage=3,148 ha (sage).

```ts
const missions = [
  { id: "MX-219", area: "Sector 5 · 312 ha", drone: "Matrice 350", pilot: "D. Mariano", eta: "Active · 06:42", status: "Active" },
  { id: "MX-220", area: "Block A-1 · 42 ha", drone: "Matrice 350", pilot: "K. Reyes", eta: "Scheduled Thu 06:00", status: "Scheduled" },
  { id: "MX-221", area: "Estate composite · 1,247 ha", drone: "Phantom 4 RTK", pilot: "D. Mariano", eta: "Scheduled Sun 05:30", status: "Scheduled" },
  { id: "MX-218", area: "Sector 1 · 412 ha", drone: "Matrice 350", pilot: "D. Mariano", eta: "Completed today 05:54", status: "Completed" },
];
```

`grid lg:grid-cols-3`:
- col-span-2: "Active mission · MX-219" + `FieldMap h-64 overlay="plain" label="Live flight · MX-219"` + 4-stat mini grid (Altitude: 82m, Speed: 8.4m/s, Battery: 68%, ETA: 00:42:18)
- col-1: "Upcoming & recent" list — each has mission ID + status badge + area + drone·pilot + eta

Status colors: Active=harvest, Completed=sage, Scheduled=muted.

---

### `src/app/drones/equipment/page.tsx`

**`"use client"`**.

4 KpiCards: Total drones=5 (Plane icon), Ready=3 (sage), In service=1 (harvest, Wrench icon), Fleet hours=1,744h (olive).

```ts
const drones = [
  { id: "M350-01", model: "DJI Matrice 350 RTK", payload: "P1 + L1", hours: "412 h", battery: 92, status: "Ready", maint: "in 8 flights" },
  { id: "M350-02", model: "DJI Matrice 350 RTK", payload: "Multispectral MS-7", hours: "318 h", battery: 68, status: "Active", maint: "in 12 flights" },
  { id: "P4RTK-03", model: "Phantom 4 RTK", payload: "RGB", hours: "684 h", battery: 100, status: "Ready", maint: "due now" },
  { id: "M30T-04", model: "Matrice 30T", payload: "Thermal + RGB", hours: "204 h", battery: 84, status: "Ready", maint: "in 22 flights" },
  { id: "M350-05", model: "DJI Matrice 350 RTK", payload: "LiDAR L2", hours: "126 h", battery: 0, status: "Maintenance", maint: "in service" },
];
```

3-col card grid: each card has ID, model, status badge, payload, 2-stat grid (Airframe hrs + Battery% with Battery icon), maintenance note.

Status: Ready=sage, Active=harvest, Maintenance=muted.

---

### `src/app/drones/logs/page.tsx`

**`"use client"`**.

4 KpiCards: Flights(mo)=38, Flight hours=62.4h (olive), Distance=1,842km (sage), Incidents=1 (clay).

```ts
const logs = [
  { id: "FL-3142", mission: "MX-218", drone: "M350-02", pilot: "D. Mariano", date: "6 Jun · 05:54", dur: "1h 12m", dist: "38 km", status: "Nominal" },
  { id: "FL-3138", mission: "MX-212", drone: "M350-01", pilot: "K. Reyes", date: "30 May · 06:12", dur: "2h 48m", dist: "94 km", status: "Nominal" },
  { id: "FL-3134", mission: "MX-207", drone: "P4RTK-03", pilot: "D. Mariano", date: "22 May · 06:08", dur: "1h 44m", dist: "52 km", status: "Aborted" },
  { id: "FL-3128", mission: "MX-201", drone: "M350-01", pilot: "D. Mariano", date: "14 May · 05:48", dur: "2h 50m", dist: "92 km", status: "Nominal" },
  { id: "FL-3122", mission: "MX-198", drone: "M350-02", pilot: "K. Reyes", date: "8 May · 06:20", dur: "1h 02m", dist: "32 km", status: "Nominal" },
];
```

Table: Flight, Mission, Drone/Pilot, Date, Duration, Distance, Status (Nominal=sage, Aborted=clay).

---

### `src/app/reports/farm/page.tsx`

```tsx
<ReportsPage eyebrow="Reports" title="Farm Reports"
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
```

---

### `src/app/reports/workforce/page.tsx` — ComingSoon

```tsx
<ComingSoon eyebrow="Reports" title="Workforce Reports"
  description="Productivity, attendance and payroll-ready summaries by team and period."
  icon={Users}
  modules={[
    { title: "Bi-weekly payroll digest", body: "Hours, overtime, allowances reconciled per worker." },
    { title: "Team productivity", body: "Output per crew, harvest velocity, variance vs plan." },
    { title: "Attendance variance", body: "No-shows, late starts, geofence anomalies." },
    { title: "Compliance audit pack", body: "Labor records ready for certification audits." },
  ]}
/>
```

---

### `src/app/reports/executive/page.tsx` — ComingSoon

```tsx
<ComingSoon eyebrow="Reports" title="Executive Reports"
  description="Board-ready summaries combining agronomy, operations and financial outcomes."
  icon={FileBarChart}
  modules={[
    { title: "Quarterly performance brief", body: "Estate-wide KPIs vs targets, ready for the board pack." },
    { title: "Scenario models", body: "Yield, weather and price scenarios for the next season." },
    { title: "ESG & certification", body: "Compliance position across GlobalG.A.P, Rainforest Alliance, Fair Trade." },
    { title: "Investor briefings", body: "Auto-generated investor letters with portfolio-wide commentary." },
  ]}
/>
```

---

### `src/app/alerts/page.tsx`

**`"use client"`** — uses `useState` for resolve/restore interactions.

```ts
type Alert = { id: string; lvl: "Critical" | "High" | "Medium" | "Low"; title: string; body: string; time: string; source: string };

const initialAlerts: Alert[] = [
  { id: "a1", lvl: "Critical", title: "Severe stress detected · Block C-3", body: "NDVI dropped 0.18 since last capture. Affects 18.2 ha.", time: "2h ago", source: "AI · imagery" },
  { id: "a2", lvl: "High", title: "Workforce shortage forecast", body: "Wednesday roster shows −12 workers vs harvest schedule.", time: "5h ago", source: "Roster system" },
  { id: "a3", lvl: "Medium", title: "Yield decline · Block B-1", body: "Projection revised −4.2 t/ha for harvest window.", time: "yesterday", source: "Forecast model" },
  { id: "a4", lvl: "Medium", title: "Missed survey · Block 5", body: "No imagery in 12 days. Auto-scheduled for tomorrow 06:00.", time: "yesterday", source: "Operations" },
  { id: "a5", lvl: "Low", title: "Mission MX-218 completed", body: "412 ha processed. New layers available.", time: "1d ago", source: "Drone Ops" },
  { id: "a6", lvl: "Low", title: "5 tasks closed today", body: "Bravo team completed harvest sector 3 ahead of schedule.", time: "1d ago", source: "Task system" },
];
```

Icon map: Critical→AlertTriangle, High→AlertCircle, Medium→Bell, Low→Info.

Alert tone (bg+text+border):
- Critical: `bg-clay/15 text-clay border-clay/30`
- High: `bg-clay/10 text-clay border-clay/20`
- Medium: `bg-harvest/20 text-clay border-harvest/30`
- Low: `bg-sage/15 text-sage-deep border-sage/20`

"Mark all read" button resolves all. Resolved section shows strikethrough text + Check icon + Undo button.

Actions: "Configure thresholds" (outline) + "Mark all read" (sage-deep).

---

### `src/app/data/page.tsx`

**`"use client"`**.

4 KpiCards: Datasets=184 (Database icon), Storage=612 GB / 2TB (olive), Processing=3 queued (harvest), Last sync=12 min ago (sage).

3 dashed upload cards (FileImage/MapIcon/UploadCloud icons): Upload drone imagery, Import GIS data, Connect data source.

Datasets table:
```ts
const datasets = [
  { name: "Estate orthomosaic · 6 Jun 2026", type: "GeoTIFF", size: "4.2 GB", source: "MX-218", status: "Processed" },
  { name: "NDVI composite · 6 Jun 2026", type: "GeoTIFF", size: "812 MB", source: "MX-218", status: "Processed" },
  { name: "Terrain scan · Sector 5", type: "GeoTIFF", size: "1.1 GB", source: "MX-198", status: "Processing" },
  { name: "Field boundaries · 2026", type: "Shapefile", size: "12 MB", source: "GIS team", status: "Active" },
  { name: "Harvest records · May 2026", type: "CSV", size: "184 KB", source: "Field forms", status: "Active" },
];
```

Status: Processed/Active=sage, Processing=harvest.

---

### `src/app/settings/page.tsx`

**`"use client"`** — uses Tabs, Switch, Select.

Tabs: Organisation | Users & permissions | Notifications | Preferences

**Organisation tab** (max-w-2xl):
- Org name: "Agritech Plantations"
- Trading entity: "Agritech Agri Holdings Sdn Bhd"
- Primary estate: "Farm 1 (1,247 ha)"
- Headquarters: "Kuala Lumpur, Malaysia"

**Users tab** — 5 users + "Invite user" button:
```ts
const users = [
  { name: "Ahmad Ismail", email: "ahmad.ismail@agritech.my", role: "Estate Manager", access: "Owner" },
  { name: "Sarah Tan", email: "sarah.tan@agritech.my", role: "Lead Agronomist", access: "Admin" },
  { name: "David Lee", email: "david.lee@agritech.my", role: "Drone Operations", access: "Editor" },
  { name: "Nurul Aisyah", email: "nurul.aisyah@agritech.my", role: "Harvest Supervisor", access: "Editor" },
  { name: "Raj Kumar", email: "raj.kumar@agritech.my", role: "Field Lead", access: "Viewer" },
];
```

**Notifications tab** — 5 toggles (first 4 on):
1. Critical health alerts — Email + SMS (ON)
2. Yield forecast revisions — Weekly email (ON)
3. Workforce shortage forecasts — 48h advance (ON)
4. Mission completion — Push (ON)
5. Daily executive brief — 06:00 email (OFF)

**Preferences tab** — 5 selects:
- Units: "Metric (ha · t · °C)" | "Imperial (ac · lb · °F)"
- Coordinate system: "EPSG:4326 — WGS 84" | "EPSG:3857 — Web Mercator" | "EPSG:3375 — Kertau RSO Malaya"
- Time zone: "Asia/Kuala_Lumpur (UTC+8)" | "Asia/Singapore (UTC+8)" | "Asia/Jakarta (UTC+7)" | "UTC"
- Map basemap: "Topographic" | "Satellite" | "Streets" | "Hybrid"
- Theme: "System default" | "Light" | "Dark"

---

### `src/app/profile/page.tsx`

**`"use client"`** — uses `ACCOUNT` + form inputs.

`grid lg:grid-cols-[280px_1fr]`:
- Left card: initials avatar (gradient from-sage to-olive, h-20 w-20), fullName, role, "Owner" badge, "Change avatar" button
- Right card: 2-col grid — Full name, Role, Email, Phone (+60 12 345 6789), Location (col-span-2: Kuala Lumpur, Malaysia). Save + Cancel.

3 secondary cards (md:grid-cols-3): Email preferences→/settings, Security→/settings, Default farm→/.

Active sessions:
- MacBook Pro · Chrome | KL | Active now | "This device" badge
- iPhone 15 · Safari | Pontian, Johor | 2 days ago | "Sign out" button

---

## 14. Table pattern (used consistently)

```tsx
<table className="w-full text-sm">
  <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
    <tr><th className="px-5 py-3 text-left font-medium">...</th></tr>
  </thead>
  <tbody>
    <tr className="border-t border-border/60 hover:bg-muted/20">
      <td className="px-5 py-3">...</td>
    </tr>
  </tbody>
</table>
```

---

## 15. Badge color patterns

| Semantic | className |
|---|---|
| Healthy / success | `bg-sage/15 text-sage-deep border-0` |
| Warning | `bg-harvest/25 text-clay border-0` |
| Error / stress | `bg-clay/15 text-clay border-0` |
| Olive / growth | `bg-olive/15 text-olive border-0` |
| Muted / neutral | `bg-muted text-muted-foreground border-0` |

All use `variant="secondary"` on the shadcn Badge with the above classes appended.

---

## 16. `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { tailwind-merge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

(Standard shadcn utility — should be auto-generated by shadcn init.)

---

## 17. Things NOT to build

- No authentication
- No real API calls — all data is hardcoded in `lib/farms.tsx` or inline in page files
- No test files
- No `pages/` directory — App Router only
- Do not delete `AGENTS.md` or `CLAUDE.md`
- Do not change `tsconfig.json`, `postcss.config.mjs`, `next.config.ts`, or `eslint.config.mjs`
