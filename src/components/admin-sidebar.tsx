"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, MailPlus, Users, ShieldCheck, ArrowLeft, LogOut,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

type UserInfo = {
  fullName: string;
  email: string;
  initials: string;
};

const sections: {
  label: string;
  items: { title: string; url: string; icon: React.ElementType }[];
}[] = [
  {
    label: "Administration",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: Building2 },
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Access Requests", url: "/admin/requests", icon: MailPlus },
      { title: "Users & Roles", url: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Application",
    items: [{ title: "Back to app", url: "/", icon: ArrowLeft }],
  },
];

export function AdminSidebar({ user }: { user: UserInfo }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 px-2 py-2 hover:opacity-90 group-data-[collapsible=icon]:px-0"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-deep text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-semibold">Agritech</span>
            <span className="text-[11px] text-muted-foreground">Admin Console</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/90">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.url === "/admin"
                          ? pathname === item.url
                          : pathname === item.url || pathname.startsWith(`${item.url}/`)
                      }
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sage-deep/10 text-xs font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user.fullName}</span>
            <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="ml-auto text-muted-foreground transition-colors hover:text-foreground group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
