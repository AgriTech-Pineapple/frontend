import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_admin, display_name, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_platform_admin) {
    redirect("/");
  }

  const fullName =
    profile.display_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "Admin";

  const userInfo = {
    fullName,
    email: user.email ?? "",
    initials: getInitials(fullName),
  };

  return (
    <SidebarProvider>
      <AdminSidebar user={userInfo} />
      <SidebarInset className="bg-background">
        <header className="flex h-14 items-center gap-3 border-b border-border/60 px-4 md:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Admin Console
          </span>
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
