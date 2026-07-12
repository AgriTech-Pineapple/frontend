"use client";

import { useEffect } from "react";
import Link from "next/link";

const HERO_BG_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCC_llXISJMZ4ugISmGaPJ9J8CRftVWaXi06ncMatLludbwX3uVKgjUz_RwAiCHv3yTOaouj-lLlYfLus9klGFSk8DwdBLNKXfvf6U-mvxTLHhHV6342biL8lHD1o4MVGJcbG8XjEu1MAsleIfQbJrAIVC8D8jL0iyr0bQxZBtyA6ntvWzdiOZMHlteJL_u5JmufQ8K6GXPRbhb1OfI401LJORLddDKPwvt6vnfa7XkwE8Ggkhfb8hvV0gCjasFVNu0Tma6USNUVE0";
const HERO_CARD_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBRVt4Gip8ZmObGLOmiuWpHqXKdHrJB6e18tkvx6jMoFaAciFT_JA3ZauJfpRhr1a8uadQLC-MKVK4vZ4mHa539KCAStpJ5hDm5Pmzr2SCy6WzBN-j3ariRotBPRC6rkG_e3Yh43RCXuiS90ZJo0qrpu2zQVqm6SvCPrTt4dEuvdNO4LORD6R8KySAClyg1ciuiu0fe1r2T5XZd5NgaTqVJndVEB547CHdFq8osqM6XzfMeEV7iZueuFkRkxklvTABrFeN2h-llbKAZeA";
const PINEAPPLE_URL =
  "https://lh3.googleusercontent.com/aida/AP1WRLvNGoIKm6pQpHHHOQJIZ71ambQdBAlFrFv3qh2tlhLHMnS74X9VjaC7GW3_05BOer_f1pyt1p-KaPA6iq_GeI8FfzneQ-vgwVfIT3LFxDuP5hSJi2zR5MHgExoB77CrLU4yzULQMJ5-5MCy2k8AJgULvAtUzToVNT0PSMUnaX0vjYyydrESA_cg9GohztWdz2MWPNK8PzmeLbsr66hA6NjPN45zRyDQnKf3jiLyQa63lmleUi1ysP1qyNA";
const WEATHER_URL =
  "https://lh3.googleusercontent.com/aida/AP1WRLtxh3n4bUaYxZGU_Sb2eaOJErH4sSF-kUpaPx3i5Sx12qkb2jGRdli8Yscy0bt8QELLvVT348JgVYy2wAISBiONfbgn5MUCswnuZIbbhPBe6Uynek0GsbgZUPsvBkhjfdtLzHE6kAGohmdExP5mnBTTHRM5TX2mRcZ39UnXVZ1sObZNZXooZ8bohW84PHVMRjEM1q8BDIhCfFrMFRJ7C_61HAQlZWCSsyrsmqaZFODwPP98ICzAuIWMyQ";
const SATELLITE_URL =
  "https://lh3.googleusercontent.com/aida/AP1WRLu6RzQyUC_2eKn2ITpZ_50AxeJ3Q3itCysO6gxrbOTViQZn90eVfWaTQNuoej7JGnegKyCxrt5dzOi1Gp_bWB4YMmev_hv6DfKN_6D44WXwhAX3J9_Featej1IRm0oNh58HDfWN2I8BlF52SidtUCf8Kx23vRmlQxFTjdcO5xQG1bZfmHWQhvhfnoTk1uMvd7FapWFl0fqfc-ww642Y5Ac6ry8lVaAfMPGLjcIenFdln8ad0sGZPTRnqW4";
const CTA_BG_URL =
  "https://lh3.googleusercontent.com/aida/AP1WRLueALR_gWYm-oGUY83VFYCc-FwtuZ07Lh06I6dGmukjXwQLi-czYL123UTgPv1birS4Z2c4vwCGj-f-DgnDAQvFWSyjl1LFI-Bc4ZeW8FImXU9Qzyj807NO75ltUmE_3wPsIyRhaRXWlPKNgrt5Z5Ag7gpU1tp9aMtkANbHwoj59nqujNj5HOhGUol_IR20x6e2w4EGH-F8vvSpUBGD76VKk-80pjklCc8ew_w5DzUGyQAWWIxs9hU3Mj4";

export default function LandingPage() {
  useEffect(() => {
    // Scroll reveal
    function tagReveal(
      selector: string,
      type: string,
      delayFn?: ((i: number) => string) | string
    ) {
      document.querySelectorAll(selector).forEach((el, i) => {
        (el as HTMLElement).dataset.reveal = type;
        if (delayFn !== undefined) {
          (el as HTMLElement).style.transitionDelay =
            typeof delayFn === "function" ? delayFn(i) : delayFn;
        }
      });
    }

    tagReveal("#signal-section > div:first-child", "up");
    tagReveal("#signal-section > div:last-child > div", "up", (i) => `${i * 0.22}s`);
    tagReveal("#platform-section > div:first-child", "up");
    tagReveal("#platform-section .lp-grid > div", "scale", (i) => `${i * 0.16}s`);
    tagReveal("#journey-section > div:first-child", "up");
    tagReveal("#journey-section .lp-grid > div", "up", (i) => `${i * 0.22}s`);
    tagReveal("#cta-section h2", "up", "0s");
    tagReveal("#cta-section p.cta-desc", "up", "0.22s");
    tagReveal("#cta-section .cta-btns", "up", "0.42s");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

    // Scroll-driven nav + parallax
    function onScroll() {
      const y = window.scrollY;
      const nav = document.querySelector("nav.lp-nav") as HTMLElement | null;
      const navLogo = document.querySelector(".nav-logo") as HTMLElement | null;
      const navIcons = document.querySelectorAll(".nav-icon");
      const navSignin = document.querySelector(".nav-signin") as HTMLElement | null;
      const heroBg = document.getElementById("hero-bg") as HTMLElement | null;
      const heroCard = document.getElementById("hero-card-wrapper") as HTMLElement | null;
      const ctaBg = document.getElementById("cta-bg") as HTMLElement | null;
      const ctaSection = document.getElementById("cta-section") as HTMLElement | null;

      if (nav) {
        const p = Math.min(y / 600, 1);
        nav.style.background = `rgba(52,65,51,${p * 0.9})`;
        nav.style.backdropFilter = `blur(${p * 20}px)`;
        (nav.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = `blur(${p * 20}px)`;
        nav.style.borderBottomColor = `rgba(255,255,255,${p * 0.1})`;
        nav.style.boxShadow = `0 2px 32px rgba(52,65,51,${p * 0.2})`;
        nav.style.paddingTop = (p > 0.55 ? 12 : 16) + "px";
        nav.style.paddingBottom = (p > 0.55 ? 12 : 16) + "px";

        const r = Math.round(52 + (255 - 52) * p);
        const g = Math.round(65 + (255 - 65) * p);
        const b = Math.round(51 + (255 - 51) * p);
        if (navLogo) navLogo.style.color = `rgb(${r},${g},${b})`;

        navIcons.forEach((el) => {
          (el as HTMLElement).style.color =
            p > 0.25 ? `rgba(255,255,255,${Math.min((p - 0.25) * 1.4, 0.75)})` : "";
        });

        if (navSignin) {
          if (p > 0.35) {
            const bp = Math.min((p - 0.35) / 0.65, 1);
            navSignin.style.background = `rgba(255,255,255,${0.08 + bp * 0.1})`;
            navSignin.style.color = "white";
            navSignin.style.borderColor = "rgba(255,255,255,0.22)";
          } else {
            navSignin.style.background = "";
            navSignin.style.color = "";
            navSignin.style.borderColor = "";
          }
        }
      }

      if (heroBg) heroBg.style.transform = `translateY(${y * 0.32}px)`;
      if (heroCard) heroCard.style.transform = `translateY(${-y * 0.07}px)`;
      if (ctaBg && ctaSection) {
        const ctaTop = ctaSection.getBoundingClientRect().top + y;
        ctaBg.style.transform = `translateY(${(y - ctaTop) * 0.25}px) scale(1.1)`;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="bg-surface text-on-background"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="lp-nav fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 border-b border-transparent">
        <div className="nav-logo text-2xl tracking-tighter gap-10 text-primary font-extrabold flex">
          Agritech
        </div>
        <img src="Drone Legacy Logo.svg" className="w-48"/>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4">
            <span className="nav-icon material-symbols-outlined text-on-surface-variant cursor-pointer">
              notifications
            </span>
            <span className="nav-icon material-symbols-outlined text-on-surface-variant cursor-pointer">
              settings
            </span>
          </div>
          <Link
            href="/login"
            className="nav-signin bg-primary text-on-primary px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-widest hover:brightness-110 transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-10 overflow-hidden bg-surface-container-low pt-20">
        <div className="absolute inset-0 z-0">
          <div
            id="hero-bg"
            className="w-full h-full bg-cover bg-center opacity-65"
            style={{
              backgroundImage: `url("${HERO_BG_URL}")`,
              filter: "saturate(1.5) contrast(1.05) brightness(0.9)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-surface/80 via-surface/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full status-dot" />
            </div>
            <h1 className="text-[36px] sm:text-[48px] md:text-[64px] lg:text-[84px] leading-[1.05] lg:leading-[1.0] text-primary tracking-tighter font-extrabold">
              Intelligence for every <br />
              <span className="text-[#4a5a48]">acre you grow.</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl">
              From satellite indices to drone surveys, workforce attendance to yield forecasts —
              Agritech turns the noise of a plantation into clear, confident decisions.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/login"
                className="bg-primary text-on-primary px-10 py-5 rounded-lg font-semibold text-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-xl"
              >
                Sign in now{" "}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/coming-soon"
                className="bg-white text-primary border border-primary/20 px-10 py-5 rounded-lg font-semibold text-lg hover:bg-surface-container transition-all"
              >
                Book a demo
              </Link>
            </div>
          </div>

          {/* Hero card */}
          <div className="lg:col-span-6 flex justify-center items-center py-16">
            <div id="hero-card-wrapper" className="relative w-full max-w-[500px]">
              <div className="relative aspect-[4/3] rounded-xl shadow-2xl overflow-hidden border-4 border-white/40 group">
                <img
                  alt="Pineapple Estate Analysis"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={HERO_CARD_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-lg font-semibold">Highland Estate</h3>
                      <p className="text-[10px] font-medium uppercase tracking-widest opacity-80">
                        Sector A-12 · Active Scan
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold">0.71</p>
                      <p className="text-[9px] uppercase font-bold opacity-70 tracking-widest">
                        Live NDVI
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating chips */}
              <div className="hidden sm:flex absolute -top-5 -right-6 floating-anim-delayed glass-panel px-4 py-3 rounded-lg shadow-xl items-center gap-3 z-20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-on-surface-variant uppercase">
                    Growth Status
                  </p>
                  <p className="text-xs font-bold text-primary">On Schedule</p>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-8 -left-6 floating-anim glass-panel p-5 rounded-lg shadow-2xl max-w-[210px] z-20 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <h4 className="text-sm font-semibold text-primary">AI Rec.</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-snug mb-3">
                  Optimize irrigation in Block 4 based on 3-day precipitation forecast.
                </p>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4" />
                </div>
              </div>

              <div className="hidden sm:flex absolute top-1/3 -right-8 floating-anim glass-panel px-5 py-4 rounded-lg shadow-xl z-10 flex-col items-center hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <span className="material-symbols-outlined text-primary text-3xl mb-1">
                  satellite_alt
                </span>
                <p className="text-[10px] font-bold text-primary uppercase">98% Match</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Signal Feed ─────────────────────────────────────────────────────── */}
      <section id="signal-section" className="py-16 bg-primary text-on-primary">
        <div className="px-4 sm:px-6 lg:px-10 mb-10 flex justify-between items-center">
          <h2 className="text-[11px] font-semibold text-on-primary/70 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-green rounded-full" />
            Real-Time Signal Feed
          </h2>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-on-primary rounded-full" />
            <div className="w-2 h-2 bg-on-primary/20 rounded-full" />
            <div className="w-2 h-2 bg-on-primary/20 rounded-full" />
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 overflow-x-auto hide-scrollbar pb-4">
          {/* Card 1: NDVI Dip */}
          <div className="relative min-w-[260px] sm:min-w-[320px] md:min-w-[360px] rounded-lg border border-white/10 border-l-4 border-l-white/50 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-[0.18] transition-opacity duration-500"
              style={{ backgroundImage: `url('${HERO_CARD_URL}')` }}
            />
            <div className="relative bg-white/10 backdrop-blur-md p-6 h-full">
              <p className="text-[10px] font-semibold text-on-primary/60 uppercase mb-2 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary/70 animate-pulse inline-block" />
                Block C-7 · NDVI Alert
              </p>
              <div className="flex justify-between items-end mb-3">
                <h4 className="text-lg font-semibold text-on-primary">NDVI Dip Detected</h4>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-on-primary">0.61</p>
                  <p className="text-[9px] uppercase opacity-50 tracking-widest">↓ from 0.74</p>
                </div>
              </div>
              <p className="text-sm text-on-primary/70 leading-relaxed">
                Crown stress visible in eastern rows. Possible early drought or Phytophthora ingress.
                Field inspection within 48 hrs.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-on-primary/60 w-[61%]" />
                </div>
                <span className="text-[10px] text-on-primary/70 font-bold">NDVI 0.61</span>
              </div>
            </div>
          </div>

          {/* Card 2: Irrigation Alert */}
          <div className="relative min-w-[260px] sm:min-w-[320px] md:min-w-[360px] rounded-lg border border-white/10 border-l-4 border-l-white/35 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-[0.18] transition-opacity duration-500"
              style={{ backgroundImage: `url('${HERO_BG_URL}')` }}
            />
            <div className="relative bg-white/10 backdrop-blur-md p-6 h-full">
              <p className="text-[10px] font-semibold text-on-primary/60 uppercase mb-2 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary/70 animate-pulse inline-block" />
                Block B-3 · Soil Sensor
              </p>
              <div className="flex justify-between items-end mb-3">
                <h4 className="text-lg font-semibold text-on-primary">Irrigation Trigger</h4>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-on-primary">18%</p>
                  <p className="text-[9px] uppercase opacity-50 tracking-widest">VWC · Below 22%</p>
                </div>
              </div>
              <p className="text-sm text-on-primary/70 leading-relaxed">
                Soil moisture below drip threshold. Activate lines 4A and 4B for a 90-min cycle tonight.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-on-primary/50 w-[18%]" />
                </div>
                <span className="text-[10px] text-on-primary/70 font-bold">18% VWC</span>
              </div>
            </div>
          </div>

          {/* Card 3: Harvest Outlook */}
          <div className="relative min-w-[260px] sm:min-w-[320px] md:min-w-[360px] rounded-lg border border-white/10 border-l-4 border-l-white/70 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-[0.18] transition-opacity duration-500"
              style={{ backgroundImage: `url('${PINEAPPLE_URL}')` }}
            />
            <div className="relative bg-white/10 backdrop-blur-md p-6 h-full">
              <p className="text-[10px] font-semibold text-on-primary/60 uppercase mb-2 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary/50 inline-block" />
                Sector A-12 · AI Count
              </p>
              <div className="flex justify-between items-end mb-3">
                <h4 className="text-lg font-semibold text-on-primary">Harvest Outlook</h4>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-on-primary">14.8k</p>
                  <p className="text-[9px] uppercase opacity-50 tracking-widest">Crowns · 11 days</p>
                </div>
              </div>
              <p className="text-sm text-on-primary/70 leading-relaxed">
                AI model counts 14,800 harvestable pineapple crowns. Harvest window opens in 11 days.
                Crew planning recommended now.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-on-primary/80 w-[88%]" />
                </div>
                <span className="text-[10px] text-on-primary/70 font-bold">88% mature</span>
              </div>
            </div>
          </div>

          {/* Card 4: Weather */}
          <div className="relative min-w-[260px] sm:min-w-[320px] md:min-w-[360px] rounded-lg border border-white/10 border-l-4 border-l-white/30 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-[0.18] transition-opacity duration-500"
              style={{ backgroundImage: `url('${WEATHER_URL}')` }}
            />
            <div className="relative bg-white/10 backdrop-blur-md p-6 h-full">
              <p className="text-[10px] font-semibold text-on-primary/60 uppercase mb-2 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary/70 animate-pulse inline-block" />
                Highland Estate · Weather
              </p>
              <div className="flex justify-between items-end mb-3">
                <h4 className="text-lg font-semibold text-on-primary">Heavy Rain Forecast</h4>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-on-primary">48mm</p>
                  <p className="text-[9px] uppercase opacity-50 tracking-widest">36 hr window</p>
                </div>
              </div>
              <p className="text-sm text-on-primary/70 leading-relaxed">
                Suspend chemical spray schedule. Assess drainage in low-lying blocks D-2 and D-5 before
                onset.
              </p>
              <div className="mt-4 flex gap-1">
                {[
                  { h: "h-4", label: "Now" },
                  { h: "h-7", label: "+6h" },
                  { h: "h-10", label: "+12h" },
                  { h: "h-8", label: "+18h" },
                  { h: "h-5", label: "+24h" },
                ].map(({ h, label }) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`${h} w-full bg-on-primary/35 rounded-sm`} />
                    <span className="text-[8px] opacity-40">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Sentinel-2 */}
          <div className="relative min-w-[260px] sm:min-w-[320px] md:min-w-[360px] rounded-lg border border-white/10 border-l-4 border-l-white/20 shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-[0.18] transition-opacity duration-500"
              style={{ backgroundImage: `url('${SATELLITE_URL}')` }}
            />
            <div className="relative bg-white/10 backdrop-blur-md p-6 h-full">
              <p className="text-[10px] font-semibold text-on-primary/50 uppercase mb-2 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-on-primary/40 inline-block" />
                Full Estate · Sentinel-2
              </p>
              <div className="flex justify-between items-end mb-3">
                <h4 className="text-lg font-semibold text-on-primary">Satellite Refresh</h4>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-on-primary">NDRE 0.53</p>
                  <p className="text-[9px] uppercase opacity-50 tracking-widest">3 blocks flagged</p>
                </div>
              </div>
              <p className="text-sm text-on-primary/70 leading-relaxed">
                New NDVI and NDRE composites processed for Highland Estate. Blocks A-4, C-7 and D-2
                flagged for ground-truth inspection.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-on-primary/70">
                  NDVI ✓
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-on-primary/70">
                  NDRE ✓
                </span>
                <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold text-on-primary/90">
                  3 Flags !
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform ─────────────────────────────────────────────────────────── */}
      <section id="platform-section" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto bg-surface">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">The Platform</p>
          <h2 className="text-[36px] md:text-[48px] text-primary font-extrabold tracking-tighter">
            One screen for every signal.
          </h2>
          <p className="text-on-surface-variant text-base">
            Satellites, drones, ground crews and sensors — unified into a clean, accountable workspace.
          </p>
        </div>

        <div className="lp-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "agriculture",
              title: "Farm Intelligence",
              desc: "Plant count, health, growth and yield forecasts at block-level resolution.",
              visual: (
                <div className="h-20 w-full flex items-end gap-1.5">
                  {[{ h: "h-1/2" }, { h: "h-3/4" }, { h: "h-[90%]" }, { h: "h-2/3" }, { h: "h-full" }].map(
                    ({ h }, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-lg ${h}`}
                        style={{ backgroundColor: `oklch(0.43 0.045 135 / ${(i + 1) * 0.2})` }}
                      />
                    )
                  )}
                </div>
              ),
            },
            {
              icon: "layers",
              title: "GIS Mapping",
              desc: "NDVI, NDRE, terrain and yield overlays — toggled in a single map workspace.",
              visual: (
                <div className="relative h-20 w-full bg-surface-container rounded-lg overflow-hidden">
                  <img alt="GIS Map" className="absolute inset-0 w-full h-full object-cover opacity-100" src={SATELLITE_URL} />
                </div>
              ),
            },
            {
              icon: "helicopter",
              title: "Drone Operations",
              desc: "Missions, equipment, flight logs and survey deliverables in one trail.",
              visual: (
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    <span>Survey_102</span>
                    <span className="text-primary">Completed</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full" />
                  </div>
                </div>
              ),
            },
            {
              icon: "badge",
              title: "Workforce",
              desc: "Attendance, tasks, teams and field forms with daily roll-up.",
              visual: (
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    +12
                  </div>
                </div>
              ),
            },
            {
              icon: "description",
              title: "Reports",
              desc: "Farm, workforce and executive briefs you can share without copy-paste.",
              visual: (
                <div className="flex gap-2">
                  {["PDF", "CSV", "LINK"].map((l) => (
                    <div key={l} className="px-3 py-1 bg-surface-container-high rounded-lg text-[10px] text-primary font-bold">
                      {l}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              icon: "warning",
              title: "Alerts & Control",
              desc: "Severity-graded alerts with audit, dismissal and restore controls.",
              visual: (
                <div className="flex items-center gap-3 py-3 px-4 bg-red-50 border border-red-100 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest">
                    Sector 4 Overheat
                  </span>
                </div>
              ),
            },
          ].map(({ icon, title, desc, visual }) => (
            <div
              key={title}
              className="bg-surface-container-lowest p-10 rounded-xl border-b-4 border-primary/10 hover:border-primary transition-all group shadow-sm hover:shadow-xl"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-6 group-hover:scale-110 transition-transform inline-block">
                {icon}
              </span>
              <h3 className="text-2xl font-semibold text-primary mb-4">{title}</h3>
              <p className="text-on-surface-variant text-sm mb-8">{desc}</p>
              {visual}
            </div>
          ))}
        </div>
      </section>

      {/* ── Journey ──────────────────────────────────────────────────────────── */}
      <section id="journey-section" className="py-24 relative overflow-hidden bg-surface-container-low/50">
        <div className="px-4 sm:px-6 lg:px-10 max-w-[1440px] mx-auto text-center mb-16 lg:mb-24">
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.3em]">How it works</p>
          <h2 className="text-[32px] sm:text-[40px] md:text-[48px] text-primary font-extrabold tracking-tighter">
            From raw flight to ripe decision.
          </h2>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 relative">
          <div className="absolute top-[48px] left-[15%] right-[15%] h-[1px] bg-primary/10 hidden lg:block" />
          <div className="lp-grid grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-12 relative z-10">
            {[
              {
                icon: "satellite_alt",
                img: PINEAPPLE_URL,
                title: "Capture",
                desc: "Drone teams fly missions; satellites refresh nightly. Imagery is ingested automatically.",
              },
              {
                icon: "psychology",
                img: WEATHER_URL,
                title: "Interpret",
                desc: "Models score health, growth and yield per block; anomalies become alerts.",
              },
              {
                icon: "task_alt",
                img: null,
                title: "Act",
                desc: "Crews receive tasks, managers see recommendations, executives get a weekly brief.",
              },
            ].map(({ icon, img, title, desc }) => (
              <div key={title} className="text-center group">
                <div className="journey-icon-box w-24 h-24 bg-surface-container-lowest rounded-xl flex items-center justify-center mx-auto mb-10 border border-primary/10 relative overflow-hidden">
                  {img && (
                    <img
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover opacity-5 group-hover:opacity-10 transition-opacity"
                      src={img}
                    />
                  )}
                  <span className="material-symbols-outlined text-4xl text-primary relative z-10">
                    {icon}
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-primary mb-4">{title}</h3>
                <p className="text-on-surface-variant text-sm px-6 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section
        id="cta-section"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-10 text-center bg-primary text-on-primary relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div
            id="cta-bg"
            className="w-full h-full bg-cover bg-center scale-110 opacity-10"
            style={{ backgroundImage: `url("${CTA_BG_URL}")` }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
          <h2 className="text-[32px] sm:text-[42px] md:text-[56px] lg:text-[72px] leading-[1.05] text-on-primary font-extrabold tracking-tighter">
            Your fields are already talking.{" "}
            <br />
            <span className="opacity-70">Start listening today.</span>
          </h2>
          <p className="cta-desc text-on-primary/70 text-xl max-w-2xl mx-auto leading-relaxed">
            Join the plantations turning satellite pixels and drone flights into decisions that ship
            more crop, with less guesswork.
          </p>
          <div className="cta-btns flex flex-wrap justify-center gap-6 pt-6">
            <Link
              href="/login"
              className="bg-surface-container-lowest text-primary px-12 py-5 rounded-lg font-semibold text-lg hover:scale-[1.03] transition-all shadow-2xl font-extrabold"
            >
              Sign in now
            </Link>
            <Link
              href="/coming-soon"
              className="bg-white/10 text-on-primary border border-white/20 px-12 py-5 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="w-full py-12 lg:py-20 px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-surface border-t border-outline-variant/30">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="text-2xl text-primary tracking-tighter font-extrabold">Agritech</div>
          <p className="text-on-surface-variant text-sm opacity-70">
            © 2024 Agritech. Command Center Agriculture.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-10">
          {["Privacy Policy", "Terms of Service", "API Documentation", "Contact Engineering"].map(
            (l) => (
              <a
                key={l}
                href="#"
                className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
              >
                {l}
              </a>
            )
          )}
        </div>
      </footer>
    </div>
  );
}
