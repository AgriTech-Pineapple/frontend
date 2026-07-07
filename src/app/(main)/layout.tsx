import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_admin")
    .eq("id", user.id)
    .single();
  const isPlatformAdmin = !!profile?.is_platform_admin;

  // The org role (org_admin / farm_manager / worker / drone_operator) lives on
  // the membership row — a separate concept from the platform (drone company)
  // admin flag. Users can belong to several orgs; the oldest membership drives
  // the sidebar. Platform admins get the full nav regardless.
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("role, joined_at")
    .eq("user_id", user.id)
    .order("joined_at");
  const orgRole = memberships?.[0]?.role ?? null;

  const userInfo = user
    ? {
        fullName: (user.user_metadata?.full_name as string) ?? user.email ?? "User",
        email: user.email ?? "",
        role: (user.user_metadata?.role as string) ?? "Estate Manager",
        initials: getInitials(
          (user.user_metadata?.full_name as string) ?? user.email ?? "U"
        ),
      }
    : null;

  return (
    <SidebarProvider>
      <AppSidebar user={userInfo} isPlatformAdmin={isPlatformAdmin} orgRole={orgRole} />
      <SidebarInset className="bg-background">
        <TopBar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </SidebarInset>
      <ChatbotWidget />
    </SidebarProvider>
  );
}
