"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type LinkState = "checking" | "ready" | "invalid";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The invite email link redirects here with tokens in the URL. Establish a
  // session from them (hash tokens or PKCE code), then let the user pick a password.
  useEffect(() => {
    let cancelled = false;

    async function establishSession() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);

      const hashError = hash.get("error_description") ?? query.get("error_description");
      if (hashError) {
        if (!cancelled) {
          setLinkError(hashError.replace(/\+/g, " "));
          setLinkState("invalid");
        }
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = query.get("code");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!cancelled) setLinkState(error ? "invalid" : "ready");
        if (error && !cancelled) setLinkError(error.message);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled) setLinkState(error ? "invalid" : "ready");
        if (error && !cancelled) setLinkError(error.message);
        return;
      }

      // No tokens in the URL — maybe already signed in (e.g. page refresh)
      const { data: { user } } = await supabase.auth.getUser();
      if (!cancelled) setLinkState(user ? "ready" : "invalid");
    }

    establishSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Same routing rule as login: platform admins land on the admin console
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_platform_admin")
      .eq("id", data.user.id)
      .single();
    router.push(profile?.is_platform_admin ? "/admin" : "/");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-surface text-on-background"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      <nav className="w-full flex justify-between items-center px-6 lg:px-10 py-5">
        <Link href="/" className="font-extrabold text-xl tracking-tighter text-primary">
          Agritech
        </Link>
      </nav>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-10">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.25em] mb-3">
              Welcome aboard
            </p>
            <h1 className="text-[32px] font-extrabold tracking-tighter text-primary leading-tight">
              Set your password.
            </h1>
            <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
              Choose a password to finish setting up your account.
            </p>
          </div>

          {linkState === "checking" && (
            <p className="text-sm text-on-surface-variant">Verifying your invite link…</p>
          )}

          {linkState === "invalid" && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700 leading-relaxed">
              {linkError ?? "This invite link is invalid or has expired."} Ask your
              administrator to send a new invite, or{" "}
              <Link href="/login" className="font-semibold underline">
                sign in
              </Link>{" "}
              if you already have a password.
            </div>
          )}

          {linkState === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2"
                  htmlFor="password"
                >
                  New password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    lock
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2"
                  htmlFor="confirm"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    lock
                  </span>
                  <input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-[15px] hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving…" : "Set password & continue"}
                  {!loading && (
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
