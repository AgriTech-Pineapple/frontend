"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getAdminUsers, getRoles, setPlatformAdmin } from "@/lib/admin";
import { ORG_ROLE_LABEL } from "@/lib/team";

function initialsOf(name: string, email: string): string {
  const source = name.trim() || email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export default function UsersRolesPage() {
  const qc = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });
  const { data: roles } = useQuery({ queryKey: ["user-roles"], queryFn: getRoles });

  const platformAdminMutation = useMutation({
    mutationFn: ({ userId, grant }: { userId: string; grant: boolean }) =>
      setPlatformAdmin(userId, grant),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e: Error) => setActionError(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Users & Roles"
        description="Everyone with an account across all organizations. Org roles are managed inside each organization (Users & Roles page); the switch below grants the platform-wide Drone Company admin."
        actions={
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" /> Add user
            </Link>
          </Button>
        }
      />

      {actionError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (users ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
          <Users className="h-8 w-8" />
          <p className="text-sm">No users found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Organizations</TableHead>
                <TableHead>Platform admin</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last sign-in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users ?? []).map((u) => {
                const name =
                  u.displayName || [u.firstName, u.lastName].filter(Boolean).join(" ");
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-sage-deep/10 text-xs font-semibold">
                            {initialsOf(name, u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                            {name || "—"}
                            {u.isPlatformAdmin && (
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-sage-deep" />
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.phone || "—"}
                    </TableCell>
                    <TableCell>
                      {u.memberships.length === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {u.memberships.map((m) => (
                            <Badge
                              key={m.organizationId}
                              variant="secondary"
                              className="border-0 font-normal"
                            >
                              {m.organizationName} ·{" "}
                              {ORG_ROLE_LABEL[m.role as keyof typeof ORG_ROLE_LABEL] ?? m.role}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.isPlatformAdmin}
                        disabled={platformAdminMutation.isPending}
                        onCheckedChange={(checked) =>
                          platformAdminMutation.mutate({ userId: u.id, grant: checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : "Never"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {roles && roles.length > 0 && (
        <div className="grid gap-3 md:grid-cols-4">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-border/60 p-4">
              <p className="text-sm font-semibold">{role.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
