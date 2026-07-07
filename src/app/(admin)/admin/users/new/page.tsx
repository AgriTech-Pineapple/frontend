"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, Mail, Link2, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getAdminOrganizations, registerUser, type RegisterUserInput } from "@/lib/admin";
import { ORG_ROLE_LABEL, type OrgRole } from "@/lib/team";

const ROLE_DESCRIPTION: Record<OrgRole, string> = {
  org_admin: "Full control of the organization — farms, members, settings.",
  farm_manager: "Manages the farms they're assigned to.",
  worker: "Field worker — own attendance, tasks and forms.",
  drone_operator: "Flies missions and uploads captures for the org.",
};

const METHODS = [
  {
    id: "email" as const,
    label: "Send invite email",
    description: "They get an email link to set their password. Uses the Supabase mailer (rate-limited until custom SMTP is set up).",
    icon: Mail,
  },
  {
    id: "link" as const,
    label: "Copy invite link",
    description: "No email is sent — you get a one-time link to share over your own channel.",
    icon: Link2,
  },
  {
    id: "password" as const,
    label: "Set a password now",
    description: "Account is ready immediately. You hand the credentials over yourself; they can change the password later.",
    icon: KeyRound,
  },
];

export default function RegisterUserPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [method, setMethod] = useState<RegisterUserInput["method"]>("link");
  const [accountType, setAccountType] = useState<"org_member" | "platform_admin">("org_member");
  const [orgRole, setOrgRole] = useState<OrgRole>("org_admin");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<{ email: string; link: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: organizations } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: getAdminOrganizations,
  });

  const mutation = useMutation({
    mutationFn: (input: RegisterUserInput) => registerUser(input),
    onSuccess: (link, input) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      if (link) {
        setLinkCopied(false);
        setInviteLink({ email: input.email, link });
        navigator.clipboard?.writeText(link).then(
          () => setLinkCopied(true),
          () => {}
        );
      } else {
        router.push("/admin/users");
      }
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (accountType === "org_member" && !organizationId) {
      setError("Pick the organization this user belongs to.");
      return;
    }
    const form = new FormData(e.currentTarget);
    mutation.mutate({
      firstName: (form.get("firstName") as string).trim(),
      lastName: (form.get("lastName") as string).trim(),
      email: (form.get("email") as string).trim(),
      phone: (form.get("phone") as string).trim(),
      ...(accountType === "platform_admin"
        ? { platformAdmin: true }
        : { organizationId, orgRole, scopeAllFarms: orgRole === "farm_manager" }),
      method,
      password: method === "password" ? (form.get("password") as string) : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Register User"
        description="Create an account directly — for people who didn't come in through an access request."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to users
            </Link>
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" required placeholder="First name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" required placeholder="Last name" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" required placeholder="person@estate.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+60 12-345 6789" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account type</Label>
              <RadioGroup
                value={accountType}
                onValueChange={(v) => setAccountType(v as typeof accountType)}
                className="gap-3"
              >
                <label
                  htmlFor="type-org"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    accountType === "org_member" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <RadioGroupItem value="org_member" id="type-org" className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Organization member</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Belongs to one organization with a role inside it.
                    </p>
                  </div>
                </label>
                <label
                  htmlFor="type-platform"
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    accountType === "platform_admin" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <RadioGroupItem value="platform_admin" id="type-platform" className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Platform admin (Drone Company)</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Full access to every organization and the admin console.
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {accountType === "org_member" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Select value={organizationId} onValueChange={setOrganizationId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {(organizations ?? []).map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role in the organization</Label>
                  <Select value={orgRole} onValueChange={(v) => setOrgRole(v as OrgRole)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ORG_ROLE_LABEL) as OrgRole[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ORG_ROLE_LABEL[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTION[orgRole]}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>How do they get access?</Label>
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as typeof method)}
                className="gap-3"
              >
                {METHODS.map(({ id, label, description, icon: Icon }) => (
                  <label
                    key={id}
                    htmlFor={`method-${id}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      method === id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <RadioGroupItem value={id} id={`method-${id}`} className="mt-0.5" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {method === "password" && (
              <div className="space-y-2">
                <Label htmlFor="password">Temporary password</Label>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  autoComplete="off"
                  className="sm:w-[280px]"
                />
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating account…" : "Create account"}
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href="/admin/users">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invite link dialog (link method) */}
      <Dialog
        open={inviteLink !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInviteLink(null);
            router.push("/admin/users");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account created</DialogTitle>
            <DialogDescription>
              No email was sent — share this one-time link with {inviteLink?.email} so they can set
              their password. Use a channel you trust; the link is their key to the account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={inviteLink?.link ?? ""}
              className="text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
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
            {linkCopied ? "Copied to clipboard." : "Select the link to copy it manually."}
          </p>
          <DialogFooter>
            <Button
              onClick={() => {
                setInviteLink(null);
                router.push("/admin/users");
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
