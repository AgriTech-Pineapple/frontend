"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/lib/hooks";
import { createClient } from "@/lib/supabase/client";
import { Monitor, Smartphone, LogOut } from "lucide-react";

const sessions = [
  { icon: Monitor, device: "Chrome · macOS Sonoma", location: "Kuala Lumpur, MY", current: true, last: "Now" },
  { icon: Smartphone, device: "Safari · iOS 18", location: "Kuala Lumpur, MY", current: false, last: "2d ago" },
];

export default function Page() {
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useProfile();
  const firstName   = profile?.firstName   ?? "";
  const lastName    = profile?.lastName    ?? "";
  const displayName = profile?.displayName || `${firstName} ${lastName}`.trim() || "User";
  const phone       = profile?.phone       ?? "";
  const initials    = (firstName[0] ?? "U") + (lastName[0] ?? "");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Account" title="Profile" description="Manage your personal details, credentials and active sessions." />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Avatar card */}
        <Card className="border-border/60 shadow-none p-6 flex flex-col items-center text-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sage to-olive text-white text-2xl font-display font-semibold">
            {initials || "U"}
          </div>
          <div>
            <p className="font-display font-semibold text-lg">{displayName}</p>
            <p className="text-sm text-muted-foreground">Estate Manager</p>
          </div>
          <Button variant="outline" size="sm" className="w-full">Change photo</Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-none p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">Personal information</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["First name",    firstName],
                ["Last name",     lastName],
                ["Display name",  displayName],
                ["Role",          "Estate Manager"],
                ["Phone",         phone],
              ].map(([l, v]) => (
                <div className="space-y-1" key={l}>
                  <Label className="text-xs text-muted-foreground">{l}</Label>
                  <Input defaultValue={v} />
                </div>
              ))}
            </div>
            <Button className="bg-sage-deep hover:bg-sage-deep/90">Save changes</Button>
          </Card>

          <Card className="border-border/60 shadow-none p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">Change password</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Current password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">New password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Confirm password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button variant="outline">Update password</Button>
          </Card>

          <Card className="border-border/60 shadow-none">
            <div className="border-b border-border/60 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Active sessions</h3>
                <p className="text-xs text-muted-foreground">Devices currently logged in to your account.</p>
              </div>
              <Button variant="outline" size="sm">Revoke all</Button>
            </div>
            <ul className="divide-y divide-border/60">
              {sessions.map((s) => (
                <li key={s.device} className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.device}</p>
                    <p className="text-xs text-muted-foreground">{s.location} · {s.last}</p>
                  </div>
                  {s.current ? (
                    <Badge variant="secondary" className="border-0 bg-sage/15 text-sage-deep font-normal shrink-0">This device</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs shrink-0">Revoke</Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
