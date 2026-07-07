"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus, Plane, ShieldCheck, Trash2, Check, Copy, Mail, Link2, KeyRound, Users as UsersIcon,
  Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getOrganizationFarms, type OrgFarmSummary } from "@/lib/admin";
import {
  getMyOrgMembership, getOrgMembers, getFarmManagerAssignments, addOrgMember, removeMember,
  setMemberRole, setMemberFarmScope, getWorkers, addWorker, removeWorker, ORG_ROLE_LABEL,
  type TeamMember, type WorkerRecord, type OrgRole,
} from "@/lib/team";

const METHODS = [
  { id: "email" as const, label: "Send invite email", description: "They get an email link to set their password.", icon: Mail },
  { id: "link" as const, label: "Copy invite link", description: "No email is sent — share the link yourself.", icon: Link2 },
  { id: "password" as const, label: "Set a password now", description: "Account is ready immediately.", icon: KeyRound },
];

function initialsOf(name: string, email: string): string {
  const source = name.trim() || email;
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

function AddMemberDialog({
  role, organizationId, farms, open, onOpenChange, onCreated,
}: {
  role: OrgRole;
  organizationId: string;
  farms: OrgFarmSummary[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (result: { link: string | null; email: string }) => void;
}) {
  const [method, setMethod] = useState<"email" | "link" | "password">("link");
  const [scopeAllFarms, setScopeAllFarms] = useState(true);
  const [selectedFarms, setSelectedFarms] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof addOrgMember>[0]) => addOrgMember(input),
    onSuccess: (link, input) => {
      onCreated({ link, email: input.email });
      onOpenChange(false);
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    mutation.mutate({
      organizationId,
      firstName: (form.get("firstName") as string).trim(),
      lastName: (form.get("lastName") as string).trim(),
      email: (form.get("email") as string).trim(),
      phone: (form.get("phone") as string).trim(),
      role,
      method,
      password: method === "password" ? (form.get("password") as string) : undefined,
      scopeAllFarms,
      farmIds: selectedFarms,
    });
  }

  const title = `Add ${ORG_ROLE_LABEL[role].toLowerCase()}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setError(null); }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {role === "farm_manager"
              ? "They'll get view/edit access to the farms you scope them to."
              : role === "drone_operator"
              ? "They'll be able to fly missions and upload captures across the org."
              : role === "org_admin"
              ? "They'll have full control of the organization, including user management."
              : "They'll get a login for attendance, tasks and field forms, plus a worker record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
          </div>

          {role === "farm_manager" && (
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              <Label>Farm access</Label>
              <RadioGroup
                value={scopeAllFarms ? "all" : "specific"}
                onValueChange={(v) => setScopeAllFarms(v === "all")}
                className="gap-2"
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value="all" /> All farms in the org
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <RadioGroupItem value="specific" /> Specific farms
                </label>
              </RadioGroup>
              {!scopeAllFarms && (
                <div className="mt-1 space-y-1.5 pl-1">
                  {farms.length === 0 && (
                    <p className="text-xs text-muted-foreground">No farms in this org yet.</p>
                  )}
                  {farms.map((f) => (
                    <label key={f.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedFarms.includes(f.id)}
                        onCheckedChange={(c) =>
                          setSelectedFarms((prev) =>
                            c ? [...prev, f.id] : prev.filter((id) => id !== f.id)
                          )
                        }
                      />
                      {f.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>How do they get access?</Label>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as typeof method)} className="gap-2">
              {METHODS.map(({ id, label, description, icon: Icon }) => (
                <label
                  key={id}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors ${
                    method === id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <RadioGroupItem value={id} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-medium"><Icon className="h-3.5 w-3.5 text-muted-foreground" /> {label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {method === "password" && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="text" required minLength={6} autoComplete="off" />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddWorkerDialog({
  organizationId, farms, open, onOpenChange, onCreated,
}: {
  organizationId: string;
  farms: OrgFarmSummary[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [farmId, setFarmId] = useState<string>("none");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof addWorker>[0]) => addWorker(input),
    onSuccess: () => {
      onCreated();
      onOpenChange(false);
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    mutation.mutate({
      organizationId,
      farmId: farmId === "none" ? null : farmId,
      firstName: (form.get("firstName") as string).trim(),
      lastName: (form.get("lastName") as string).trim(),
      role: (form.get("role") as string).trim(),
      location: (form.get("location") as string).trim(),
      phone: (form.get("phone") as string).trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setError(null); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add worker</DialogTitle>
          <DialogDescription>
            A labor/HR record — workers don&apos;t get a login, just a directory entry scoped to a farm.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="w-firstName">First name</Label>
              <Input id="w-firstName" name="firstName" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-lastName">Last name</Label>
              <Input id="w-lastName" name="lastName" required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="w-role">Role</Label>
              <Input id="w-role" name="role" required placeholder="Harvester, Irrigator, Field Lead…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-phone">Phone</Label>
              <Input id="w-phone" name="phone" type="tel" required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="w-location">Location</Label>
              <Input id="w-location" name="location" required placeholder="Block C-3" />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned farm</Label>
              <Select value={farmId} onValueChange={setFarmId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned / all farms</SelectItem>
                  {farms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding…" : "Add worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FarmAccessDialog({
  member, organizationId, farms, assignedFarmIds, open, onOpenChange, onSaved,
}: {
  member: TeamMember;
  organizationId: string;
  farms: OrgFarmSummary[];
  assignedFarmIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<string[]>(assignedFarmIds);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => setMemberFarmScope(organizationId, member.id, selected),
    onSuccess: () => {
      onSaved();
      onOpenChange(false);
    },
    onError: (e: Error) => setError(e.message),
  });

  const name = member.displayName || [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setError(null); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Farm access for {name}</DialogTitle>
          <DialogDescription>
            Pick the farms this farm manager can view and edit. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Farms</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setSelected(selected.length === farms.length ? [] : farms.map((f) => f.id))
              }
            >
              {selected.length === farms.length ? "Clear all" : "Select all"}
            </Button>
          </div>
          <div className="space-y-1.5 rounded-lg border border-border/60 p-3">
            {farms.length === 0 && (
              <p className="text-xs text-muted-foreground">No farms in this org yet.</p>
            )}
            {farms.map((f) => (
              <label key={f.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(f.id)}
                  onCheckedChange={(c) =>
                    setSelected((prev) =>
                      c ? [...prev, f.id] : prev.filter((id) => id !== f.id)
                    )
                  }
                />
                {f.name}
              </label>
            ))}
          </div>
          {selected.length === 0 && (
            <p className="text-xs text-amber-700">
              With no farms selected they keep their login but can&apos;t see any farm data.
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersRolesPage() {
  const qc = useQueryClient();
  const [addRole, setAddRole] = useState<OrgRole | null>(null);
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<{ email: string; link: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Confirmation targets — nothing destructive happens without one of these
  const [pendingRole, setPendingRole] = useState<{ member: TeamMember; role: OrgRole } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [removeWorkerTarget, setRemoveWorkerTarget] = useState<WorkerRecord | null>(null);
  const [farmAccessTarget, setFarmAccessTarget] = useState<TeamMember | null>(null);

  const { data: membership, isLoading: membershipLoading } = useQuery({
    queryKey: ["my-org-membership"],
    queryFn: getMyOrgMembership,
  });
  const organizationId = membership?.organizationId;
  const isOrgAdmin = membership?.role === "org_admin";

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["org-members", organizationId],
    queryFn: () => getOrgMembers(organizationId!),
    enabled: !!organizationId && isOrgAdmin,
  });

  const { data: farms } = useQuery({
    queryKey: ["org-farms", organizationId],
    queryFn: () => getOrganizationFarms(organizationId!),
    enabled: !!organizationId && isOrgAdmin,
  });

  const farmIds = (farms ?? []).map((f) => f.id);
  const { data: assignments } = useQuery({
    queryKey: ["farm-manager-assignments", farmIds.join(",")],
    queryFn: () => getFarmManagerAssignments(farmIds),
    enabled: farmIds.length > 0 && isOrgAdmin,
  });

  const { data: workers, isLoading: workersLoading } = useQuery({
    queryKey: ["org-workers", organizationId],
    queryFn: () => getWorkers(organizationId!),
    enabled: !!organizationId && isOrgAdmin,
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMember(organizationId!, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-members", organizationId] });
      setRemoveTarget(null);
    },
    onError: (e: Error) => {
      setActionError(e.message);
      setRemoveTarget(null);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: OrgRole }) =>
      setMemberRole(organizationId!, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-members", organizationId] });
      qc.invalidateQueries({ queryKey: ["farm-manager-assignments"] });
      setPendingRole(null);
    },
    onError: (e: Error) => {
      setActionError(e.message);
      setPendingRole(null);
    },
  });

  const removeWorkerMutation = useMutation({
    mutationFn: (id: string) => removeWorker(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-workers", organizationId] });
      setRemoveWorkerTarget(null);
    },
    onError: (e: Error) => {
      setActionError(e.message);
      setRemoveWorkerTarget(null);
    },
  });

  function assignedFarmIdsOf(userId: string): string[] {
    return (assignments ?? []).filter((a) => a.userId === userId).map((a) => a.farmId);
  }

  function memberName(m: TeamMember): string {
    return m.displayName || [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email;
  }

  function farmsFor(userId: string): string {
    const ids = (assignments ?? []).filter((a) => a.userId === userId).map((a) => a.farmId);
    if (ids.length === 0) return "—";
    if (farms && ids.length === farms.length) return "All farms";
    const names = ids.map((id) => farms?.find((f) => f.id === id)?.name).filter(Boolean);
    return names.join(", ") || `${ids.length} farm(s)`;
  }

  if (membershipLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!organizationId || !isOrgAdmin) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-24 text-muted-foreground">
        <ShieldCheck className="h-8 w-8" />
        <p className="text-sm">Only org admins can manage users and roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={membership.organizationName || "Organization"}
        title="Users & Roles"
        description="Add workers, drone operators, and other farm managers to your organization, and decide which farms they can access."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddRole("org_admin")}>
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Add org admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddRole("drone_operator")}>
              <Plane className="mr-1.5 h-3.5 w-3.5" /> Add drone operator
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddRole("farm_manager")}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add farm manager
            </Button>
            <Button size="sm" className="bg-sage-deep hover:bg-sage-deep/90" onClick={() => setAddWorkerOpen(true)}>
              <UsersIcon className="mr-1.5 h-3.5 w-3.5" /> Add worker
            </Button>
          </>
        }
      />

      {actionError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{actionError}</p>
      )}

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Farm-manager farm access is enforced. Drone operators currently have org-wide access by
            design — per-farm restriction for that role isn&apos;t wired up yet.
          </p>
          {membersLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Farm access</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(members ?? []).map((m: TeamMember) => {
                    const name = m.displayName || [m.firstName, m.lastName].filter(Boolean).join(" ");
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-sage-deep/10 text-xs font-semibold">
                                {initialsOf(name, m.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{name || "—"}</p>
                              <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={m.orgRole}
                            onValueChange={(v) => {
                              if (v !== m.orgRole) setPendingRole({ member: m, role: v as OrgRole });
                            }}
                          >
                            <SelectTrigger className="h-8 w-[160px] text-sm">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(ORG_ROLE_LABEL) as OrgRole[]).map((r) => (
                                <SelectItem key={r} value={r}>{ORG_ROLE_LABEL[r]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.orgRole === "farm_manager" ? (
                            <span className="flex items-center gap-1.5">
                              {farmsFor(m.id)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                title="Edit farm access"
                                onClick={() => setFarmAccessTarget(m)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </span>
                          ) : m.orgRole === "drone_operator" ? "All farms (org-wide)" : m.orgRole === "org_admin" ? "All farms" : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                            title="Remove from organization"
                            onClick={() => setRemoveTarget(m)}
                            disabled={removeMemberMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(members ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No team members yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workers" className="space-y-3">
          {workersLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Farm</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(workers ?? []).map((w: WorkerRecord) => (
                    <TableRow key={w.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-olive/10 text-xs font-semibold">
                              {initialsOf(`${w.firstName} ${w.lastName}`, "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{w.firstName} {w.lastName}</p>
                            <p className="truncate text-xs text-muted-foreground">{w.workerRef}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{w.role}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {farms?.find((f) => f.id === w.farmId)?.name ?? "Unassigned"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{w.phone || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          title="Delete worker record"
                          onClick={() => setRemoveWorkerTarget(w)}
                          disabled={removeWorkerMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(workers ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No workers added yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {addRole && (
        <AddMemberDialog
          role={addRole}
          organizationId={organizationId}
          farms={farms ?? []}
          open={!!addRole}
          onOpenChange={(o) => !o && setAddRole(null)}
          onCreated={({ link, email }) => {
            qc.invalidateQueries({ queryKey: ["org-members", organizationId] });
            qc.invalidateQueries({ queryKey: ["farm-manager-assignments"] });
            if (link) {
              setLinkCopied(false);
              setInviteLink({ email, link });
              navigator.clipboard?.writeText(link).then(() => setLinkCopied(true), () => {});
            }
          }}
        />
      )}

      <AddWorkerDialog
        organizationId={organizationId}
        farms={farms ?? []}
        open={addWorkerOpen}
        onOpenChange={setAddWorkerOpen}
        onCreated={() => qc.invalidateQueries({ queryKey: ["org-workers", organizationId] })}
      />

      {farmAccessTarget && (
        <FarmAccessDialog
          key={farmAccessTarget.id}
          member={farmAccessTarget}
          organizationId={organizationId}
          farms={farms ?? []}
          assignedFarmIds={assignedFarmIdsOf(farmAccessTarget.id)}
          open={!!farmAccessTarget}
          onOpenChange={(o) => !o && setFarmAccessTarget(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["farm-manager-assignments"] });
          }}
        />
      )}

      {/* Role change confirmation */}
      <AlertDialog open={pendingRole !== null} onOpenChange={(open) => !open && setPendingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Change {pendingRole ? memberName(pendingRole.member) : ""}&apos;s role to{" "}
              {pendingRole ? ORG_ROLE_LABEL[pendingRole.role] : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRole?.member.orgRole === "farm_manager" && pendingRole.role !== "farm_manager"
                ? "They are currently a farm manager — changing their role removes all their farm assignments. If you make them a farm manager again later, you'll need to re-assign their farms via \"Edit farm access\"."
                : pendingRole?.role === "farm_manager"
                ? "They'll become a farm manager with no farms assigned yet — use \"Edit farm access\" on their row afterwards to grant farms."
                : pendingRole?.role === "org_admin"
                ? "They'll get full control of the organization, including managing users and roles."
                : "Their access changes immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                pendingRole &&
                roleMutation.mutate({ userId: pendingRole.member.id, role: pendingRole.role })
              }
            >
              {roleMutation.isPending ? "Changing…" : "Change role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove member confirmation */}
      <AlertDialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {removeTarget ? memberName(removeTarget) : ""} from the organization?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They lose all access to this organization&apos;s farms and data immediately
              {removeTarget?.orgRole === "farm_manager" ? ", including their farm assignments" : ""}.
              Their account itself is not deleted — they can be re-added later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => removeTarget && removeMemberMutation.mutate(removeTarget.id)}
            >
              {removeMemberMutation.isPending ? "Removing…" : "Remove member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove worker record confirmation */}
      <AlertDialog
        open={removeWorkerTarget !== null}
        onOpenChange={(open) => !open && setRemoveWorkerTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete worker {removeWorkerTarget ? `${removeWorkerTarget.firstName} ${removeWorkerTarget.lastName}` : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the worker record ({removeWorkerTarget?.workerRef}), including
              its attendance and task links. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => removeWorkerTarget && removeWorkerMutation.mutate(removeWorkerTarget.id)}
            >
              {removeWorkerMutation.isPending ? "Deleting…" : "Delete worker"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={inviteLink !== null}
        onOpenChange={(open) => !open && setInviteLink(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account created</DialogTitle>
            <DialogDescription>
              No email was sent — share this one-time link with {inviteLink?.email} so they can set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input readOnly value={inviteLink?.link ?? ""} className="text-xs" onFocus={(e) => e.currentTarget.select()} />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => {
                if (!inviteLink) return;
                navigator.clipboard?.writeText(inviteLink.link).then(() => setLinkCopied(true), () => {});
              }}
            >
              {linkCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setInviteLink(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
