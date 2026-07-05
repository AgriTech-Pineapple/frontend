"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MailPlus, Users, Tractor, Building2, Bell, Inbox, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminStats, getServiceRequests } from "@/lib/admin";
import { STATUS_STYLES } from "./requests/status";

const KPIS = [
  { key: "pendingRequests", label: "Pending Requests", icon: MailPlus, href: "/admin/requests" },
  { key: "users", label: "Registered Users", icon: Users, href: "/admin/users" },
  { key: "farms", label: "Farms", icon: Tractor, href: "/farms" },
  { key: "organizations", label: "Organizations", icon: Building2, href: "/admin" },
  { key: "openAlerts", label: "Open Alerts", icon: Bell, href: "/alerts" },
] as const;

export default function AdminOverviewPage() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: getAdminStats });
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["service-requests"],
    queryFn: getServiceRequests,
  });

  const recent = (requests ?? []).slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Overview"
        description="Platform health at a glance — access requests, users, and estate activity."
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {KPIS.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {key === "pendingRequests" && (stats?.pendingRequests ?? 0) > 0 && (
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  )}
                </div>
                {stats ? (
                  <p className="mt-3 font-display text-3xl font-semibold">{stats[key]}</p>
                ) : (
                  <Skeleton className="mt-3 h-9 w-14" />
                )}
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent access requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent access requests</CardTitle>
          <Link
            href="/admin/requests"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Manage all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Inbox className="h-8 w-8" />
              <p className="text-sm">No access requests yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.email} · {r.phone}
                    </p>
                  </div>
                  <Badge variant="outline" className={STATUS_STYLES[r.status]}>
                    {r.status}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
