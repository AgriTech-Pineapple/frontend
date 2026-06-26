"use client";

import { useState } from "react";
import Link from "next/link";

const BG_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBRVt4Gip8ZmObGLOmiuWpHqXKdHrJB6e18tkvx6jMoFaAciFT_JA3ZauJfpRhr1a8uadQLC-MKVK4vZ4mHa539KCAStpJ5hDm5Pmzr2SCy6WzBN-j3ariRotBPRC6rkG_e3Yh43RCXuiS90ZJo0qrpu2zQVqm6SvCPrTt4dEuvdNO4LORD6R8KySAClyg1ciuiu0fe1r2T5XZd5NgaTqVJndVEB547CHdFq8osqM6XzfMeEV7iZueuFkRkxklvTABrFeN2h-llbKAZeA";

export default function ComingSoonPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="bg-primary min-h-screen flex flex-col overflow-hidden relative"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${BG_URL}')`,
          opacity: 0.18,
          filter: "saturate(1.6) brightness(1.05)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/60" />

      {/* Ambient blobs */}
      <div className="floating-anim absolute top-[15%] right-[10%] w-64 h-64 rounded-full bg-accent-green/10 blur-3xl pointer-events-none" />
      <div className="floating-anim-delayed absolute bottom-[20%] left-[8%] w-48 h-48 rounded-full bg-on-primary/5 blur-2xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center px-6 lg:px-16 py-6">
        <Link href="/" className="text-on-primary font-extrabold text-xl tracking-tighter">
          Agritech
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-on-primary/60 hover:text-on-primary transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to home
        </Link>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        {/* Status chip */}
        <div className="lp-fade-up lp-fade-up-d1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-on-primary/15 bg-on-primary/[0.08] mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse inline-block" />
          <span className="text-[11px] font-semibold text-on-primary/60 uppercase tracking-[0.2em]">
            Demo booking
          </span>
        </div>

        {/* Headline */}
        <h1 className="lp-fade-up lp-fade-up-d2 text-on-primary font-extrabold tracking-tighter leading-[1.0] text-[48px] sm:text-[64px] lg:text-[80px] max-w-3xl mb-6">
          Something
          <br />
          <span className="opacity-50">great is growing.</span>
        </h1>

        <p className="lp-fade-up lp-fade-up-d3 text-on-primary/55 text-lg max-w-xl leading-relaxed mb-12">
          Our demo booking experience is being planted and will be ready soon. Leave your details
          and we&apos;ll reach out the moment it&apos;s live.
        </p>

        {/* Email form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="lp-fade-up lp-fade-up-d4 w-full max-w-md flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-3.5 rounded-xl bg-on-primary/[0.08] border border-on-primary/15 text-on-primary placeholder:text-on-primary/30 focus:outline-none focus:ring-2 focus:ring-on-primary/20 text-sm"
            />
            <button
              type="submit"
              className="px-7 py-3.5 rounded-xl bg-on-primary text-primary font-semibold text-sm hover:bg-surface-container-low transition-all whitespace-nowrap"
            >
              Notify me
            </button>
          </form>
        ) : (
          <div className="lp-fade-up flex items-center gap-2 text-on-primary/70 text-sm">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>You&apos;re on the list — we&apos;ll be in touch.</span>
          </div>
        )}

        {/* Stats */}
        <div className="lp-fade-up lp-fade-up-d5 mt-20 grid grid-cols-3 gap-8 sm:gap-16 border-t border-on-primary/10 pt-10 max-w-lg w-full">
          {[
            { value: "14.8k", label: "Crowns tracked" },
            { value: "0.74", label: "Avg. NDVI" },
            { value: "98%", label: "Accuracy" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-on-primary">{value}</p>
              <p className="text-[11px] text-on-primary/40 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 pb-8 text-center">
        <p className="text-on-primary/25 text-xs">© 2024 Agritech. Command Center Agriculture.</p>
      </footer>
    </div>
  );
}
