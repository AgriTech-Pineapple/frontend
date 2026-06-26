"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const users = [
  { name: "Nishit DB", email: "nishit.db@gmail.com", role: "Estate Manager", last: "Today" },
  { name: "Arjun K", email: "arjun.k@agriteam.io", role: "Agronomist", last: "Yesterday" },
  { name: "Priya M", email: "priya.m@agriteam.io", role: "Field Supervisor", last: "3d ago" },
  { name: "Santhosh T", email: "santhosh.t@agriteam.io", role: "Drone Pilot", last: "1w ago" },
];

const notifRows = [
  { label: "Critical alerts", body: "Immediate SMS + email for critical stress events", on: true },
  { label: "High priority alerts", body: "Email for high-priority operational issues", on: true },
  { label: "Weekly digest", body: "Sunday summary of estate performance", on: false },
  { label: "Drone mission complete", body: "Push when imagery is ready for review", on: true },
  { label: "Forecast updates", body: "Email when yield forecasts are revised >5 %", on: false },
];

export default function Page() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="System" title="Settings" description="Organisation, users, notifications and platform preferences." />
      <Tabs defaultValue="org">
        <TabsList>
          <TabsTrigger value="org">Organisation</TabsTrigger>
          <TabsTrigger value="users">Users & permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="mt-6">
          <Card className="border-border/60 shadow-none p-6 space-y-5 max-w-xl">
            <h3 className="font-display text-lg font-semibold">Organisation details</h3>
            {[
              ["Organisation name", "Roots & Rays Estate"],
              ["Primary crop", "Pineapple, Oil Palm"],
              ["Country", "Malaysia"],
              ["Estate area (ha)", "1,240"],
              ["Primary contact email", "ops@rootsandrays.io"],
            ].map(([l, v]) => (
              <div className="space-y-1" key={l}>
                <Label className="text-xs text-muted-foreground">{l}</Label>
                <Input defaultValue={v} />
              </div>
            ))}
            <Button className="bg-sage-deep hover:bg-sage-deep/90">Save changes</Button>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card className="border-border/60 shadow-none">
            <div className="flex items-center justify-between border-b border-border/60 p-5">
              <h3 className="font-display text-lg font-semibold">Users</h3>
              <Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90">Invite user</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Name</th>
                  <th className="px-5 py-3 text-left font-medium">Email</th>
                  <th className="px-5 py-3 text-left font-medium">Role</th>
                  <th className="px-5 py-3 text-left font-medium">Last active</th>
                  <th className="px-5 py-3 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="border-0 bg-sage/15 text-sage-deep font-normal">{u.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.last}</td>
                    <td className="px-5 py-3">
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-border/60 shadow-none p-6 max-w-xl space-y-0 divide-y divide-border/60">
            {notifRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.body}</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${r.on ? "bg-sage-deep" : "bg-muted"}`}
                  aria-checked={r.on}
                  role="switch"
                  type="button"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${r.on ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
            <div className="pt-5">
              <Button className="bg-sage-deep hover:bg-sage-deep/90">Save preferences</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <Card className="border-border/60 shadow-none p-6 space-y-5 max-w-xl">
            <h3 className="font-display text-lg font-semibold">Platform preferences</h3>
            {[
              { l: "Default map layer", options: ["Composite", "NDVI", "NDRE", "Health", "Terrain", "Yield"] },
              { l: "Season start month", options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] },
              { l: "Date format", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
              { l: "Units", options: ["Metric (ha, kg, km)", "Imperial (ac, lb, mi)"] },
            ].map((s) => (
              <div className="space-y-1" key={s.l}>
                <Label className="text-xs text-muted-foreground">{s.l}</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                  {s.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <Button className="bg-sage-deep hover:bg-sage-deep/90">Save preferences</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
