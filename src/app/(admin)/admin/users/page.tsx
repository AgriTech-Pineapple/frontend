"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getAdminUsers, getRoles, updateUserRole } from "@/lib/admin";

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

  const roleMutation = useMutation({
    mutationFn: ({ userId, userType }: { userId: string; userType: string }) =>
      updateUserRole(userId, userType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e: Error) => setActionError(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Users & Roles"
        description="Everyone with an account, and what they're allowed to do. New accounts come from approved access requests or manual registration."
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
                <TableHead>Role</TableHead>
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
                          <p className="truncate text-sm font-medium">{name || "—"}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.userType}
                        onValueChange={(v) =>
                          roleMutation.mutate({ userId: u.id, userType: v })
                        }
                      >
                        <SelectTrigger className="h-8 w-[170px] text-sm">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {(roles ?? []).map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
        <div className="grid gap-3 md:grid-cols-3">
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
