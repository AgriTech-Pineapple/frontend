"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, MoreHorizontal, PhoneCall, CheckCircle2, XCircle, Trash2, StickyNote, Link2, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getServiceRequests, updateServiceRequest, deleteServiceRequest, approveAndInvite,
  approveAndGetLink, getAdminOrganizations,
  type InviteLink, type ServiceRequest, type ServiceRequestStatus,
} from "@/lib/admin";
import { ORG_ROLE_LABEL, type OrgRole } from "@/lib/team";
import { STATUS_STYLES } from "./status";

const FILTERS = ["all", "pending", "contacted", "approved", "rejected"] as const;

export default function AccessRequestsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [notesTarget, setNotesTarget] = useState<ServiceRequest | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ServiceRequest | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<(InviteLink & { email: string }) | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  // Approval flow: the approver picks the org + role before the invite goes out
  const [approveTarget, setApproveTarget] = useState<{
    request: ServiceRequest;
    mode: "email" | "link";
  } | null>(null);
  const [approveOrgId, setApproveOrgId] = useState<string>("");
  const [approveRole, setApproveRole] = useState<OrgRole>("farm_manager");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["service-requests"],
    queryFn: getServiceRequests,
  });

  const { data: organizations } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: getAdminOrganizations,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["service-requests"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceRequestStatus }) =>
      updateServiceRequest(id, { status }),
    onSuccess: invalidate,
    onError: (e: Error) => setActionError(e.message),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ request, organizationId, orgRole }: {
      request: ServiceRequest; organizationId: string; orgRole: OrgRole;
    }) =>
      approveAndInvite(request.id, {
        organizationId,
        orgRole,
        scopeAllFarms: orgRole === "farm_manager",
      }),
    onSuccess: (invited, { request }) => {
      invalidate();
      setActionError(null);
      setApproveTarget(null);
      setInviteNotice(
        invited
          ? `Invite sent to ${request.email}. They'll get an email link to set their password.`
          : `${request.email} already has an account — request marked approved.`
      );
    },
    onError: (e: Error) => {
      setInviteNotice(null);
      setActionError(e.message);
    },
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateServiceRequest(id, { notes }),
    onSuccess: () => {
      invalidate();
      setNotesTarget(null);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const linkMutation = useMutation({
    mutationFn: ({ request, organizationId, orgRole }: {
      request: ServiceRequest; organizationId: string; orgRole: OrgRole;
    }) =>
      approveAndGetLink(request.id, {
        organizationId,
        orgRole,
        scopeAllFarms: orgRole === "farm_manager",
      }),
    onSuccess: (result, { request }) => {
      invalidate();
      setActionError(null);
      setInviteNotice(null);
      setApproveTarget(null);
      setLinkCopied(false);
      setInviteLink({ ...result, email: request.email });
      navigator.clipboard?.writeText(result.link).then(
        () => setLinkCopied(true),
        () => {} // clipboard unavailable — the dialog still shows the link
      );
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteServiceRequest(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const filtered = (requests ?? []).filter((r) => filter === "all" || r.status === filter);
  const countOf = (s: (typeof FILTERS)[number]) =>
    s === "all" ? requests?.length ?? 0 : (requests ?? []).filter((r) => r.status === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Access Requests"
        description="People who asked to join the platform. Approving a request emails them an invite link to set their password."
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">
              {f}
              <span className="ml-1.5 text-xs text-muted-foreground">{countOf(f)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {actionError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {inviteNotice && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {inviteNotice}
        </p>
      )}

      {(inviteMutation.isPending || linkMutation.isPending) && (
        <p className="rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
          {inviteMutation.isPending ? "Sending invite…" : "Generating invite link…"}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
          <Inbox className="h-8 w-8" />
          <p className="text-sm">No {filter === "all" ? "" : filter} requests.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.firstName} {r.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.email}</div>
                    <div className="text-xs text-muted-foreground">{r.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[r.status]}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="truncate text-sm text-muted-foreground">{r.notes || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => statusMutation.mutate({ id: r.id, status: "contacted" })}
                        >
                          <PhoneCall className="mr-2 h-4 w-4" /> Mark contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={inviteMutation.isPending}
                          onClick={() => setApproveTarget({ request: r, mode: "email" })}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Approve &amp; invite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={linkMutation.isPending}
                          onClick={() => setApproveTarget({ request: r, mode: "link" })}
                        >
                          <Link2 className="mr-2 h-4 w-4" /> Approve &amp; copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => statusMutation.mutate({ id: r.id, status: "rejected" })}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setNotesTarget(r);
                            setNotesDraft(r.notes);
                          }}
                        >
                          <StickyNote className="mr-2 h-4 w-4" /> Edit notes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteTarget(r)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Approve dialog: pick the org + role the new account gets */}
      <Dialog open={approveTarget !== null} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Approve {approveTarget?.request.firstName} {approveTarget?.request.lastName}
            </DialogTitle>
            <DialogDescription>
              Choose which organization they join and their role in it.
              {approveTarget?.mode === "email"
                ? " They'll get an invite email to set their password."
                : " You'll get an invite link to share yourself."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Organization</Label>
              <Select value={approveOrgId} onValueChange={setApproveOrgId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {(organizations ?? []).map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={approveRole} onValueChange={(v) => setApproveRole(v as OrgRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ORG_ROLE_LABEL) as OrgRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ORG_ROLE_LABEL[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button
              disabled={!approveOrgId || inviteMutation.isPending || linkMutation.isPending}
              onClick={() => {
                if (!approveTarget) return;
                const payload = {
                  request: approveTarget.request,
                  organizationId: approveOrgId,
                  orgRole: approveRole,
                };
                if (approveTarget.mode === "email") inviteMutation.mutate(payload);
                else linkMutation.mutate(payload);
              }}
            >
              {inviteMutation.isPending || linkMutation.isPending
                ? "Approving…"
                : approveTarget?.mode === "email" ? "Approve & send invite" : "Approve & get link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes dialog */}
      <Dialog open={notesTarget !== null} onOpenChange={(open) => !open && setNotesTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Notes for {notesTarget?.firstName} {notesTarget?.lastName}
            </DialogTitle>
            <DialogDescription>
              Internal notes about this request — call outcomes, follow-ups, decisions.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="e.g. Called on Monday, wants a demo for a 40ha estate…"
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                notesTarget && notesMutation.mutate({ id: notesTarget.id, notes: notesDraft })
              }
              disabled={notesMutation.isPending}
            >
              {notesMutation.isPending ? "Saving…" : "Save notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite link dialog */}
      <Dialog open={inviteLink !== null} onOpenChange={(open) => !open && setInviteLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite link ready</DialogTitle>
            <DialogDescription>
              {inviteLink?.alreadyRegistered
                ? `${inviteLink?.email} already has an account, so this is a sign-in link — it logs them in and lets them set a password.`
                : `Account created for ${inviteLink?.email}. No email was sent — share this link with them yourself (it's their key to the account, so use a channel you trust).`}
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
                navigator.clipboard?.writeText(inviteLink.link).then(
                  () => setLinkCopied(true),
                  () => {}
                );
              }}
            >
              {linkCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {linkCopied ? "Copied to clipboard." : "Select the link to copy it manually."} The link
            expires after a while and can only be used once.
          </p>
          <DialogFooter>
            <Button onClick={() => setInviteLink(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the request from {deleteTarget?.firstName}{" "}
              {deleteTarget?.lastName} ({deleteTarget?.email}). This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
