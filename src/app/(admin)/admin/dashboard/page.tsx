"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, MapPin, Sprout, Tractor, Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  getAdminOrganizations, createOrganization, type CreateOrganizationInput,
} from "@/lib/admin";

function AddOrganizationDialog({
  open, onOpenChange, onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (orgId: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onSuccess: (orgId) => {
      onCreated(orgId);
      onOpenChange(false);
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    mutation.mutate({
      name: (form.get("name") as string).trim(),
      country: (form.get("country") as string).trim(),
      contactEmail: (form.get("contactEmail") as string).trim(),
      totalArea: (form.get("totalArea") as string).trim(),
      crops: (form.get("crops") as string)
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setError(null); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add organization</DialogTitle>
          <DialogDescription>
            Creates a new client organization. Next, register its org admin from
            Users → Add user (account type: organization member, role: Org Admin).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Name</Label>
            <Input id="org-name" name="name" required placeholder="Highland Estates Ltd." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-country">Country</Label>
              <Input id="org-country" name="country" placeholder="Malaysia" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-email">Contact email</Label>
              <Input id="org-email" name="contactEmail" type="email" placeholder="ops@estate.com" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-crops">Crops</Label>
              <Input id="org-crops" name="crops" placeholder="Pineapple, Banana" />
              <p className="text-xs text-muted-foreground">Comma-separated.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="org-area">Total area</Label>
              <Input id="org-area" name="totalArea" placeholder="120 ha" />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboardPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const { data: orgs, isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: getAdminOrganizations,
  });

  const filtered = (orgs ?? []).filter((o) =>
    `${o.name} ${o.country} ${o.crops.join(" ")}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Organizations"
        description="Every organization on the platform. Open one to see its farms and estate stats."
        actions={
          <>
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations…"
                className="pl-8"
              />
            </div>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add organization
            </Button>
          </>
        }
      />

      <AddOrganizationDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ["admin-organizations"] });
          qc.invalidateQueries({ queryKey: ["admin-stats"] });
        }}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
          <Building2 className="h-8 w-8" />
          <p className="text-sm">
            {search ? "No organizations match your search." : "No organizations yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((org) => (
            <Link key={org.id} href={`/admin/dashboard/${org.id}`}>
              <Card className="flex items-center gap-5 border-border/60 p-5 shadow-none transition-shadow hover:shadow-md">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sage-deep/10">
                  {org.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-sage-deep" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold tracking-tight">{org.name}</h3>
                    {org.crops.map((crop) => (
                      <Badge key={crop} variant="secondary" className="border-0 bg-sage/15 font-normal text-sage-deep">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {org.contactEmail || "No contact on file"}
                  </p>
                  {org.country && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {org.country}
                    </div>
                  )}
                </div>

                <div className="hidden shrink-0 gap-6 sm:flex">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
                      <Tractor className="h-4 w-4 text-muted-foreground" />
                      {org.farmCount}
                    </div>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Farms</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
                      <Sprout className="h-4 w-4 text-muted-foreground" />
                      {org.totalArea || "—"}
                    </div>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Total area</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
