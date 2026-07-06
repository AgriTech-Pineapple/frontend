"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sprout, Map, Users, Plane, FileBarChart,
  Bell, Settings, Leaf, ChevronRight, Tractor, ShieldCheck,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
type Item = { title: string; url: string; icon: React.ElementType; children?: { title: string; url: string }[] };

type UserInfo = {
  fullName: string;
  email: string;
  role: string;
  initials: string;
} | null;

const sections: { label: string; items: Item[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Manage Farms", url: "/farms", icon: Tractor },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        title: "Farm Intelligence", url: "/farm/overview", icon: Sprout,
        children: [
          { title: "Overview", url: "/farm/overview" },
          { title: "Plant Count", url: "/farm/plants" },
          { title: "Health Analysis", url: "/farm/health" },
          { title: "Growth Analysis", url: "/farm/growth" },
          { title: "Yield Forecast", url: "/farm/yield" },
          { title: "Historical Monitoring", url: "/farm/history" },
        ],
      },
      { title: "GIS Mapping", url: "/gis/map", icon: Map },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Workforce", url: "/workforce", icon: Users },
      { title: "Drone Operations", url: "/drones", icon: Plane },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Reports", url: "/reports/farm", icon: FileBarChart,
        children: [
          { title: "Farm Reports", url: "/reports/farm" },
          { title: "Workforce Reports", url: "/reports/workforce" },
          { title: "Executive Reports", url: "/reports/executive" },
        ],
      },
      { title: "Alerts", url: "/alerts", icon: Bell },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar({ user, isAdmin }: { user?: UserInfo; isAdmin?: boolean }) {
  const pathname = usePathname();
  const displayName = user?.fullName ?? "User";
  const displayRole = user?.role ?? "Estate Manager";
  const displayInitials = user?.initials ?? "U";
  const isActive = (url: string) => pathname === url;
  const isParentActive = (item: Item) =>
    item.children?.some((c) => pathname === c.url) || pathname === item.url;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-2 hover:opacity-90 group-data-[collapsible=icon]:px-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-deep text-primary-foreground shadow-sm">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-semibold">Agritech</span>
            <span className="text-[11px] text-muted-foreground">Farm Intelligence</span>
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
                {section.items.map((item) =>
                  item.children ? (
                    <Collapsible key={item.title} defaultOpen={isParentActive(item)} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} className="data-[active=true]:bg-sidebar-accent">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((c) => (
                              <SidebarMenuSubItem key={c.url}>
                                <SidebarMenuSubButton asChild isActive={isActive(c.url)}>
                                  <Link href={c.url}>{c.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/90">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")} tooltip="Admin Console">
                    <Link href="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Console</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition hover:bg-sidebar-accent group-data-[collapsible=icon]:px-1"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage to-olive text-xs font-semibold text-primary-foreground">
            {displayInitials}
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{displayName}</span>
            <span className="text-[11px] text-muted-foreground">{displayRole}</span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
