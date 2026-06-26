"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const LEFT_BG_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBRVt4Gip8ZmObGLOmiuWpHqXKdHrJB6e18tkvx6jMoFaAciFT_JA3ZauJfpRhr1a8uadQLC-MKVK4vZ4mHa539KCAStpJ5hDm5Pmzr2SCy6WzBN-j3ariRotBPRC6rkG_e3Yh43RCXuiS90ZJo0qrpu2zQVqm6SvCPrTt4dEuvdNO4LORD6R8KySAClyg1ciuiu0fe1r2T5XZd5NgaTqVJndVEB547CHdFq8osqM6XzfMeEV7iZueuFkRkxklvTABrFeN2h-llbKAZeA";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: form.get("email") as string,
      password: form.get("password") as string,
      options: { data: { full_name: form.get("fullName") as string } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Check your email to confirm your account, then sign in.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-surface text-on-background"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {/* Nav */}
      <nav className="w-full flex justify-between items-center px-6 lg:px-10 py-5">
        <Link href="/" className="font-extrabold text-xl tracking-tighter text-primary">
          Agritech
        </Link>
        <Link
          href="/"
          className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span> Back to home
        </Link>
      </nav>

      <main className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-col justify-between p-16">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{ backgroundImage: `url('${LEFT_BG_URL}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full mb-12">
              <span className="w-2 h-2 bg-white/60 rounded-full" />
              <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">
                Command Center
              </span>
            </div>
            <h2 className="text-on-primary font-extrabold text-[42px] leading-[1.05] tracking-tighter">
              Your estate.
              <br />
              <span className="opacity-60">Always in view.</span>
            </h2>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-6">
            {[
              { value: "14.8k", label: "Crowns tracked" },
              { value: "0.74", label: "Avg. NDVI" },
              { value: "98%", label: "Satellite match" },
            ].map(({ value, label }) => (
              <div key={label} className="border-t border-white/15 pt-5">
                <p className="text-2xl font-extrabold text-on-primary">{value}</p>
                <p className="text-[11px] text-on-primary/50 uppercase tracking-widest mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-[420px]">
            {mode === "signin" ? (
              <>
                {/* Header */}
                <div className="mb-10 lp-fade-up">
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.25em] mb-3">
                    Welcome back
                  </p>
                  <h1 className="text-[32px] font-extrabold tracking-tighter text-primary leading-tight">
                    Sign in.
                  </h1>
                </div>

                {/* Sign-in form */}
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="lp-fade-up lp-fade-up-d1">
                    <label
                      className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2"
                      htmlFor="email"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                        mail
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@highland-estate.com"
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="lp-fade-up lp-fade-up-d2">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest"
                        htmlFor="password"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
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

                  <div className="flex items-center gap-3 lp-fade-up lp-fade-up-d2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30"
                    />
                    <label htmlFor="remember" className="text-sm text-on-surface-variant">
                      Keep me signed in
                    </label>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="lp-fade-up lp-fade-up-d3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-[15px] hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Signing in…" : "Sign in"}
                      {!loading && (
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8 lp-fade-up lp-fade-up-d3">
                  <div className="flex-1 h-px bg-outline-variant/50" />
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-outline-variant/50" />
                </div>

                {/* Google SSO */}
                <button className="w-full border border-outline-variant bg-surface-container-lowest hover:bg-surface-container py-3.5 rounded-xl text-sm font-semibold text-on-background transition-all flex items-center justify-center gap-3 lp-fade-up lp-fade-up-d4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-sm text-on-surface-variant mt-8 lp-fade-up lp-fade-up-d4">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Get Started Today
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Sign-up header */}
                <div className="mb-10 lp-fade-up">
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.25em] mb-3">
                    Get started
                  </p>
                  <h1 className="text-[32px] font-extrabold tracking-tighter text-primary leading-tight">
                    Create account.
                  </h1>
                </div>

                {message ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm text-primary leading-relaxed">
                    {message}
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="lp-fade-up lp-fade-up-d1">
                      <label
                        className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2"
                        htmlFor="fullName"
                      >
                        Full name
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                          person
                        </span>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="Your name"
                          required
                          autoComplete="name"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="lp-fade-up lp-fade-up-d2">
                      <label
                        className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2"
                        htmlFor="su-email"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                          mail
                        </span>
                        <input
                          id="su-email"
                          name="email"
                          type="email"
                          placeholder="you@highland-estate.com"
                          required
                          autoComplete="email"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-background placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="lp-fade-up lp-fade-up-d3">
                      <label
                        className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-2"
                        htmlFor="su-password"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                          lock
                        </span>
                        <input
                          id="su-password"
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
                        {loading ? "Creating account…" : "Create account"}
                        {!loading && (
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                <p className="text-center text-sm text-on-surface-variant mt-8">
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("signin"); setError(null); setMessage(null); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
