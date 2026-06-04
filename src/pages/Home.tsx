import React, { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Shield, Zap, Globe, Wallet, CreditCard, QrCode, Bot, MessageSquare, Sparkles, Users, Plane, BarChart3, Code2, Fingerprint, Unplug, KeyRound, ShieldCheck, ScanEye, LockKeyhole, UserCheck } from "lucide-react";
import { MobileMenuButton, MobileNavMenu } from "@/components/MobileNavMenu";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { SiSolana } from "react-icons/si";

import heroImg from "@assets/image_1780170837984.png";
import appScreenImg from "@assets/solid-one-app-mockup.jpg";
import appGlobeBg from "@assets/solid-one-globe-network.png";
import aiWalletImg from "@assets/solid-one-ai-engine.png";
import rwaImg from "@assets/generated_images/solid-one-rwa.png";
import securityImg from "@/assets/solid-one-security-handoff.png";
import upiScanPayImg from "@/assets/solid-one-upi-scan-pay.png";
import logoImg from "@assets/solid-one-logo.png";
import logoMarkImg from "@/assets/solid-one-logo-mark.png";
import solanaPartnerLogo from "@assets/partners/solana.png";
import pythPartnerLogo from "@assets/partners/pyth.png";
import jupiterPartnerLogo from "@assets/partners/jupiter.png";
import wormholePartnerLogo from "@assets/partners/wormhole.png";
import circlePartnerLogo from "@assets/partners/circle.png";
import orcaPartnerLogo from "@assets/partners/orca.png";
import raydiumPartnerLogo from "@assets/partners/raydium.png";
import jitoPartnerLogo from "@assets/partners/jito.png";
import marginfiPartnerLogo from "@assets/partners/marginfi.png";
import squadsPartnerLogo from "@assets/partners/squads.png";
import fiatLogo from "@assets/partners/fiat.svg";
import upiLogo from "@assets/partners/upi.svg";

/* ─────────────────────────── animation presets ─────────────────────────── */
const FADE_UP = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};
const FADE_IN = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};
const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

/* ─────────────────────────── animated counter ───────────────────────────── */
function Counter({ to, suffix = "", prefix = "", decimals = 0 }: { to: number; suffix?: string; prefix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setVal(parseFloat((ease * to).toFixed(decimals)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, decimals]);
  return <span ref={ref}>{prefix}{decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────── partner logo marquee ───────────────────────── */
const PARTNERS = [
  { name: "Solana", logo: solanaPartnerLogo },
  { name: "Pyth", logo: pythPartnerLogo },
  { name: "Jupiter", logo: jupiterPartnerLogo },
  { name: "Wormhole", logo: wormholePartnerLogo },
  { name: "Circle", logo: circlePartnerLogo },
  { name: "Orca", logo: orcaPartnerLogo },
  { name: "Raydium", logo: raydiumPartnerLogo },
  { name: "Jito", logo: jitoPartnerLogo },
  { name: "Marginfi", logo: marginfiPartnerLogo },
  { name: "Squads", logo: squadsPartnerLogo },
];

function PartnerMarquee() {
  const doubled = [...PARTNERS, ...PARTNERS];
  return (
    <div className="marquee-wrap py-3 select-none">
      <div className="marquee-track items-center">
        {doubled.map((p, i) => (
          <span key={i} className="flex items-center gap-3 mx-10 whitespace-nowrap text-white/45">
            <img
              src={p.logo}
              alt={p.name}
              className="partner-logo"
              loading="lazy"
            />
            <span className="text-[11px] font-mono uppercase tracking-[0.18em]">{p.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── supported assets grid ──────────────────────── */
const ASSET_CLASSES: {
  symbol: string;
  name: string;
  detail: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  logo?: string;
}[] = [
  { symbol: "SOLANA", name: "Solana Assets", detail: "SOL · USDC · SPL tokens", icon: SiSolana },
  { symbol: "RWA", name: "Real World Assets", detail: "Equities · Metals · Bonds", icon: Globe },
  { symbol: "PAY", name: "Scan & Pay", detail: "You pay crypto · Merchant gets fiat", icon: QrCode },
  { symbol: "STABLE", name: "Stablecoins", detail: "USDC · USDT · PYUSD", logo: circlePartnerLogo },
  { symbol: "ONRAMP", name: "On-Ramp", detail: "Fiat in · Crypto to wallet", logo: fiatLogo },
];

function AssetClassesGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 select-none">
      {ASSET_CLASSES.map((a) => {
        const Icon = a.icon;
        return (
          <div
            key={a.symbol}
            className={`asset-row flex flex-col gap-3 p-5 md:p-6 border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors min-h-[148px]${a.symbol === "ONRAMP" ? " hidden sm:flex" : ""}`}
          >
            <div className="shrink-0 rounded-xl border border-white/8 p-[3px] w-fit">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/8 bg-white/[0.04]">
                {a.logo ? (
                  <img src={a.logo} alt="" className="w-7 h-7 object-contain" />
                ) : Icon ? (
                  <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                ) : null}
              </div>
            </div>
            <div className="space-y-1.5 w-full">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/35">{a.symbol}</div>
              <div className="text-sm font-semibold tracking-tight text-white leading-snug">{a.name}</div>
              <div className="text-[11px] font-mono leading-relaxed text-white/40">{a.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── animated hero background ───────────────────── */
function HeroBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      // ── Base ──────────────────────────────────────────────────────────────
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      // ── Orb 1 — large, left-centre ────────────────────────────────────────
      const ox1 = W * 0.28 + Math.sin(t * 0.22) * 60;
      const oy1 = H * 0.42 + Math.cos(t * 0.18) * 35;
      const g1 = ctx.createRadialGradient(ox1, oy1, 0, ox1, oy1, W * 0.52);
      g1.addColorStop(0,   "rgba(255,255,255,0.07)");
      g1.addColorStop(0.4, "rgba(255,255,255,0.03)");
      g1.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // ── Orb 2 — smaller, right ────────────────────────────────────────────
      const ox2 = W * 0.78 + Math.cos(t * 0.28) * 45;
      const oy2 = H * 0.35 + Math.sin(t * 0.21) * 28;
      const g2 = ctx.createRadialGradient(ox2, oy2, 0, ox2, oy2, W * 0.35);
      g2.addColorStop(0,   "rgba(255,255,255,0.05)");
      g2.addColorStop(0.5, "rgba(255,255,255,0.02)");
      g2.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // ── Perspective grid ──────────────────────────────────────────────────
      const vx = W * 0.68; // vanishing point x
      const vy = H * 0.52; // vanishing point y
      const LINES = 22;
      const SPREAD = Math.PI * 0.55; // fan angle

      ctx.save();
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= LINES; i++) {
        const frac = i / LINES;
        const angle = -SPREAD / 2 + frac * SPREAD;
        const endX = vx + Math.cos(angle) * W * 1.6;
        const endY = vy + Math.sin(angle) * H * 1.6;

        // Fade lines near vanishing point, brighter at edges
        const edgeDist = Math.abs(frac - 0.5) * 2; // 0 = centre, 1 = edge
        const alpha = 0.02 + edgeDist * 0.05;

        const lg = ctx.createLinearGradient(vx, vy, endX, endY);
        lg.addColorStop(0,    `rgba(255,255,255,0)`);
        lg.addColorStop(0.15, `rgba(255,255,255,${alpha})`);
        lg.addColorStop(1,    `rgba(255,255,255,${alpha * 0.3})`);

        ctx.strokeStyle = lg;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Horizontal cross-lines (concentric, perspective-distorted ellipses)
      for (let r = 1; r <= 7; r++) {
        const pct = r / 7;
        const rx = W * 0.55 * pct;
        const ry = H * 0.38 * pct;
        const a = 0.012 + (1 - pct) * 0.025;
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath();
        ctx.ellipse(vx, vy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // ── Horizontal shimmer line ───────────────────────────────────────────
      const shimX = ((t * 0.18) % 1) * W * 1.4 - W * 0.2;
      const shimG = ctx.createLinearGradient(shimX - 300, 0, shimX + 300, 0);
      shimG.addColorStop(0,   "rgba(255,255,255,0)");
      shimG.addColorStop(0.5, "rgba(255,255,255,0.06)");
      shimG.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.fillStyle = shimG;
      ctx.fillRect(shimX - 300, H * 0.38, 600, 1);

      // ── Edge vignette ─────────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.72);
      vig.addColorStop(0.45, "rgba(5,5,5,0)");
      vig.addColorStop(1,    "rgba(5,5,5,0.96)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ── Bottom fade ───────────────────────────────────────────────────────
      const botFade = ctx.createLinearGradient(0, H * 0.6, 0, H);
      botFade.addColorStop(0, "rgba(5,5,5,0)");
      botFade.addColorStop(1, "rgba(5,5,5,1)");
      ctx.fillStyle = botFade;
      ctx.fillRect(0, H * 0.6, W, H);

      t += 0.006;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

/* ─────────────────────────── capability card ───────────────────────────── */
const CAPABILITIES: {
  label: string;
  desc: string;
  icon?: React.ComponentType<{ className?: string }>;
  logo?: string;
}[] = [
  { icon: Wallet, label: "Self Custodial", desc: "Your keys. Your coins. Only you can access or move your assets, always." },
  { logo: upiLogo, label: "Scan & Pay", desc: "Scan and pay with crypto at merchants. They receive INR. Available in India and other UPI supported countries." },
  { icon: Globe, label: "Real World Assets", desc: "Tokenized stocks, gold, silver, and commodities in one place. Own real world exposure from your wallet." },
  { icon: CreditCard, label: "Send & Receive", desc: "Pay anyone on Solana in USDC, USDT, or native tokens. Instant finality. Fees under a cent." },
  { icon: Code2, label: "Open Source", desc: "Core contracts and wallet code are open source. Inspect, verify, and build on transparent infrastructure." },
  { icon: Users, label: "Contacts Pay", desc: "Pay crypto to anyone in your contacts book. Request and approve crypto with people you trust, all inside the app." },
  { icon: Plane, label: "Multi Utility", desc: "Book flights and hotels, recharge mobile, and pay utility bills without leaving Solid One." },
  { icon: BarChart3, label: "Wallet Credit Score", desc: "A credit profile built from your on chain activity. Your score grows as you trade, pay, and use your wallet." },
];

function CapabilityCard({ icon: Icon, label, desc, logo }: { icon?: React.ElementType; label: string; desc: string; logo?: string }) {
  return (
    <motion.div
      variants={FADE_UP}
      className="glass-card glow-card p-6 flex flex-col gap-4 group cursor-default"
    >
      <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-colors duration-300 overflow-hidden bg-white/[0.03]">
        {logo ? (
          <img src={logo} alt="UPI" className="w-7 h-7 object-contain" />
        ) : Icon ? (
        <Icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-300" />
        ) : null}
      </div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">{label}</h3>
        <p className="text-[13px] text-white/40 leading-relaxed font-light">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════ HOME PAGE ══════════════════════════════════ */
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale   = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black overflow-x-hidden">

      {/* ── Header ── */}
      <header className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${isScrolled || mobileMenuOpen ? "bg-[#050505]/90 backdrop-blur-lg border-b border-white/6 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto flex w-full items-center justify-between gap-3 px-6 md:px-10">
          <img src={logoImg} alt="Solid One" className="h-8 w-auto shrink-0" />

          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-[13px] font-medium tracking-wide text-white/60">
            {[
              {
                label: "Company",
                links: [
                  { label: "About", href: "/about" },
                  { label: "Blog", href: "/blog" },
                  { label: "Careers", href: "/careers" },
                  { label: "Press", href: "/press" },
                ],
              },
              {
                label: "Legal",
                links: [
                  { label: "Privacy policy", href: "/privacy" },
                  { label: "Term of service", href: "/terms" },
                  { label: "Cookie policy", href: "/cookies" },
                ],
              },
            ].map((menu) => (
              <div key={menu.label} className="relative nav-dropdown-group">
                <button type="button" className="hover:text-white transition-colors">
                  {menu.label}
                </button>
                <div className="nav-dropdown-menu">
                  <div className="nav-dropdown-panel">
                    {menu.links.map((link) =>
                      typeof link === "string" ? (
                        <a key={link} href="#" className="nav-dropdown-item">{link}</a>
                      ) : (
                        <Link key={link.label} href={link.href} className="nav-dropdown-item">{link.label}</Link>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Link href="/developers" className="hover:text-white transition-colors duration-200 text-white/60">
              Developers
            </Link>

            <Link href="/support" className="hover:text-white transition-colors duration-200">
              Support
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <a href="https://x.com/solidone_co" target="_blank" rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors duration-200 flex items-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/>
              </svg>
            </a>
            <div className="extension-btn-border">
              <Link href="/extension">
                <Button className="rounded-[9px] bg-white text-black hover:bg-white/90 text-[14.3px] font-semibold h-9 px-5 flex items-center gap-2 border-0 shadow-none">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" alt="Chrome" width="19" height="19" className="flex-shrink-0" />
                  Extension
                </Button>
              </Link>
            </div>
          </div>

          <div className="shrink-0 md:hidden">
            <MobileMenuButton open={mobileMenuOpen} onToggle={() => setMobileMenuOpen((v) => !v)} />
          </div>
        </div>
      </header>

      <MobileNavMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main>
        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero background image */}
          <div className="absolute inset-0 z-0">
            <img src={heroImg} alt="" className="w-full h-full object-cover opacity-65" style={{ transform: "translateY(25%)", transformOrigin: "center top" }} />
            <div className="absolute inset-0 bg-[#050505]/20 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-transparent z-20" style={{ height: "55%" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-20" style={{ top: "auto", height: "30%" }} />
          </div>

          {/* Content */}
          <motion.div style={{ opacity: heroOpacity }} className="relative z-20 max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-24 w-full flex flex-col items-center text-center">
            <motion.div initial="hidden" animate="visible" variants={STAGGER} className="max-w-4xl flex flex-col items-center">
              {/* Badge */}
              <motion.div variants={FADE_UP} className="inline-flex items-center gap-2.5 px-3.5 py-1.5 mb-10 border border-white/15 bg-white/5 backdrop-blur-sm text-[11px] font-mono uppercase tracking-[0.18em] text-white/60 select-none">
                Built on{" "}
                <span className="inline-flex items-center gap-1.5 text-white">
                  <SiSolana className="w-3.5 h-3.5" />
                  Solana
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={FADE_UP} className="font-display hero-title text-[clamp(2.15rem,7vw,2.75rem)] sm:text-[clamp(1.8rem,4.8vw,4.5rem)] tracking-[0.06em] leading-[1.12] sm:leading-[1.15] mb-8 sm:mb-10">
                ONE APP.<br/>
                EVERY ASSET.<br/>
                ZERO LIMITS.
              </motion.h1>

              {/* Subline */}
              <motion.div variants={FADE_UP} className="relative inline-block mb-2 max-w-[min(100%,268px)] sm:max-w-none">
                {/* Corner squares — inner corner meets box corner */}
                <span className="absolute -top-[6px] -left-[6px] z-10 w-[6px] h-[6px] bg-white sm:-top-[8px] sm:-left-[8px] sm:w-[8px] sm:h-[8px]" />
                <span className="absolute -top-[6px] -right-[6px] z-10 w-[6px] h-[6px] bg-white sm:-top-[8px] sm:-right-[8px] sm:w-[8px] sm:h-[8px]" />
                <span className="absolute -bottom-[6px] -left-[6px] z-10 w-[6px] h-[6px] bg-white sm:-bottom-[8px] sm:-left-[8px] sm:w-[8px] sm:h-[8px]" />
                <span className="absolute -bottom-[6px] -right-[6px] z-10 w-[6px] h-[6px] bg-white sm:-bottom-[8px] sm:-right-[8px] sm:w-[8px] sm:h-[8px]" />
                <p className="relative z-0 text-white/90 font-mono text-[11px] sm:text-[15px] tracking-wide leading-snug sm:leading-relaxed px-3.5 py-2 sm:px-6 sm:py-3 border border-white/20 bg-[#050505]/80 backdrop-blur-sm select-none">
                  Spend anywhere, anytime. Pay fiat at any merchant, powered by your Solana.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div variants={FADE_UP} className="flex flex-row flex-nowrap items-center justify-center gap-3 mt-6 w-full max-w-full">
                {/* App Store */}
                <Link href="/app-store" className="flex items-center gap-2.5 px-5 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors min-w-[152px] shrink-0">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" className="flex-shrink-0">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[8px] font-mono uppercase tracking-[0.15em] opacity-70">Download on the</div>
                    <div className="text-[14px] font-semibold leading-tight -mt-0.5">App Store</div>
                  </div>
                </Link>

                {/* Google Play */}
                <Link href="/play-store" className="flex items-center gap-2.5 px-5 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors min-w-[152px] shrink-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" alt="Google Play" width="19" height="19" className="flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-[8px] font-mono uppercase tracking-[0.15em] opacity-70">Get it on</div>
                    <div className="text-[14px] font-semibold leading-tight -mt-0.5">Google Play</div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          </motion.div>
        </section>

        {/* ══ PARTNER LOGOS (below fold) ════════════════════════════════════ */}
        <section className="bg-[#050505]/50 backdrop-blur-sm py-4">
          <div className="border-t border-white/5" />
          <div className="border-t border-white/5 mt-1 mb-4" />
          <PartnerMarquee />
          <div className="border-t border-white/5 mt-4 mb-1" />
          <div className="border-t border-white/5" />
        </section>

        {/* ══ ASSET CLASSES ═════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">Unified Portfolio</div>
              <h2 className="font-display text-[clamp(1.85rem,6vw,2.35rem)] sm:text-[clamp(1.5rem,3vw,2.25rem)] tracking-[0.04em] text-white leading-[1.15]">
                <span className="block sm:inline">EVERY ASSET.</span>{" "}
                <span className="block sm:inline">ONE APP.</span>
              </h2>
            </div>
            <p className="text-[13px] font-mono text-white/35 max-w-xs sm:text-right leading-relaxed shrink-0">
              Solana native assets, RWAs, merchant pay & fiat ramps, one wallet.
            </p>
          </div>
          <AssetClassesGrid />
        </section>

        {/* ══ AI INTENT ENGINE ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-transparent">
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20">
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-16 items-start">
              <div className="flex justify-center lg:justify-start max-lg:-mb-2">
                <div className="relative w-full max-w-[min(420px,92vw)] select-none" onContextMenu={(e) => e.preventDefault()}>
                  <img
                    src={aiWalletImg}
                    alt=""
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-full h-auto object-contain select-none pointer-events-none [-webkit-user-drag:none] [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_75%,transparent_100%)]"
                  />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-transparent pointer-events-none" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent pointer-events-none" aria-hidden />
                </div>
              </div>
              <div className="w-full max-w-lg max-lg:max-w-none max-lg:pl-0 lg:pl-14 lg:ml-auto max-lg:-mt-6 lg:mt-20">
                <div className="text-left lg:text-right max-lg:w-full">
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">Inside the wallet</div>
                  <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] tracking-[0.04em] text-white leading-[1.05]">
                    INTENT BASED<br />AI EXECUTION ENGINE
                  </h2>
                </div>
                <div className="relative mt-10 grid grid-cols-2">
                  <div className="pointer-events-none absolute left-1/2 top-[12%] bottom-[12%] w-px -translate-x-1/2 bg-white/10" aria-hidden />
                  <div className="pointer-events-none absolute top-1/2 left-[12%] right-[12%] h-px -translate-y-1/2 bg-white/10" aria-hidden />
                  {[
                    { icon: MessageSquare, label: "Natural chat", desc: "No forms or menus" },
                    { icon: Sparkles, label: "Parse intent", desc: "AI reads your goal" },
                    { icon: Bot, label: "Auto execute", desc: "Swaps, sends, stakes" },
                    { icon: Shield, label: "You approve", desc: "Sign every action" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    const isLeft = i % 2 === 0;
                    const isTop = i < 2;
                    return (
                      <div
                        key={item.label}
                        className={`flex flex-col gap-2 ${isLeft ? "items-end text-right" : "items-start text-left"} ${isLeft ? "pr-5 lg:pr-8" : "pl-5 lg:pl-8"} ${isTop ? "pb-5 lg:pb-8" : "pt-5 lg:pt-8"}`}
                      >
                        <Icon className="w-6 h-6 text-white/70" strokeWidth={1.5} />
                        <div className="space-y-1">
                          <div className="text-sm font-semibold tracking-tight text-white leading-snug">{item.label}</div>
                          <div className="text-[12px] font-mono leading-relaxed text-white/40">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CAPABILITIES ══════════════════════════════════════════════════ */}
        <section id="product" className="py-32 max-w-7xl mx-auto px-6 md:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={STAGGER}>
            <motion.div variants={FADE_UP} className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">The Platform</motion.div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <motion.h2 variants={FADE_UP} className="font-display text-[clamp(2rem,3.9vw,2.93rem)] tracking-[0.04em] leading-[1.05]">
                YOUR WEALTH.<br />ONE INTERFACE.
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-white/40 font-light text-lg max-w-sm leading-relaxed md:text-right">
                We collapsed an entire financial ecosystem into a single, uncompromising app. No switching between platforms. No surrendering custody.
              </motion.p>
            </div>

            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5" variants={STAGGER}>
              {CAPABILITIES.map((c) => (
                <CapabilityCard key={c.label} {...c} />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ══ APP MOCKUP ════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-32">
          <div className="absolute inset-0 square-grid-bg pointer-events-none" aria-hidden />
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="max-lg:order-2 lg:order-1">
                <motion.div variants={FADE_UP} className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">Mobile App</motion.div>
                <motion.h2 variants={FADE_UP} className="font-display text-[clamp(2rem,3.9vw,2.93rem)] tracking-[0.04em] leading-[1.05] mb-6">
                  BUILT FOR SOVEREIGN
                  <br />
                  INDIVIDUALS.
                </motion.h2>
                <motion.p variants={FADE_UP} className="text-white/40 font-light text-lg leading-relaxed mb-10 max-w-md">
                  Your wallet. Your keys. Your rules.
                  <br />
                  One app; Infinity possibilities.
                </motion.p>
                <motion.div variants={STAGGER} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-lg">
                  {[
                    { icon: KeyRound, label: "Self custody" },
                    { icon: Unplug, label: "Air gapped" },
                    { icon: Fingerprint, label: "Biometric lock" },
                    { icon: ShieldCheck, label: "Secure enclave" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={item.label} variants={FADE_UP} className="app-feature-box">
                        <div className="app-feature-box-inner">
                          <div className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                            <Icon className="w-4 h-4 text-white/80" strokeWidth={1.5} />
                          </div>
                          <span className="text-[11px] font-semibold text-white/90 leading-snug">{item.label}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex w-full justify-center lg:justify-end max-lg:order-1 lg:order-2"
              >
                <div
                  className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 w-[min(440px,98vw)] h-[min(460px,72vh)] pointer-events-none bg-[radial-gradient(ellipse_at_center,#050505_58%,rgba(5,5,5,0.92)_70%,transparent_100%)]"
                  aria-hidden
                />
                <div
                  className="relative z-10 flex items-center justify-center w-full max-w-[min(320px,85vw)] md:max-w-[360px] min-h-[460px] select-none isolate overflow-visible max-lg:mx-auto max-lg:translate-x-0 lg:mx-0 lg:-translate-x-14"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src={appGlobeBg}
                    alt=""
                    aria-hidden
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 w-[240%] max-w-[min(640px,125vw)] h-auto object-contain opacity-85 mix-blend-lighten pointer-events-none select-none [-webkit-user-drag:none]"
                  />
                  <div className="relative z-10 w-full max-w-[min(224px,70vw)] md:max-w-[256px]">
                    <img
                      src={appScreenImg}
                      alt=""
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="relative w-full h-auto object-contain select-none pointer-events-none [-webkit-user-drag:none]"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ REAL WORLD ASSETS ════════════════════════════════════════════ */}
        <section id="rwa" className="py-32 max-w-7xl mx-auto px-6 md:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={STAGGER}>
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-24 items-start">
              <motion.div
                variants={FADE_IN}
                className="relative mx-auto w-full max-lg:translate-x-0 lg:-translate-x-14 overflow-visible select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <img
                  src={rwaImg}
                  alt=""
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="w-full aspect-video object-cover pointer-events-none select-none [-webkit-user-drag:none]"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#050505] via-[#050505]/55 to-transparent" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050505] via-[#050505]/55 to-transparent" aria-hidden />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#050505] via-[#050505]/55 to-transparent" aria-hidden />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#050505] via-[#050505]/55 to-transparent" aria-hidden />
              </motion.div>

              <div className="lg:pt-8 w-full max-w-lg lg:ml-auto text-left lg:text-right">
                <motion.div variants={FADE_UP} className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">Real World Assets</motion.div>
                <motion.h2 variants={FADE_UP} className="font-display text-[clamp(2rem,3.9vw,2.93rem)] tracking-[0.04em] leading-[1.05] mb-6">
                  PHYSICAL WEALTH.<br />DIGITAL RAILS.
                </motion.h2>
                <motion.p variants={FADE_UP} className="text-white/40 font-light text-lg leading-relaxed">
                  Own tokenized gold, silver, crude oil, and global equities beside your Solana portfolio. Vault backed metals, oracle priced commodities, and on chain stocks. One wallet, no brokerage account required.
                </motion.p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══ SECURITY ══════════════════════════════════════════════════════ */}
        <section id="security" className="py-32 max-w-7xl mx-auto px-6 md:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={STAGGER}>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="max-lg:order-2 lg:order-1">
                <motion.div variants={FADE_UP} className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">Architecture</motion.div>
                <motion.h2 variants={FADE_UP} className="font-display text-[clamp(2rem,3.9vw,2.93rem)] tracking-[0.04em] leading-[1.05] mb-6">
                  YOU HOLD THE KEYS.<br />WE HOLD NOTHING.
                </motion.h2>
                <motion.p variants={FADE_UP} className="text-white/40 font-light text-lg leading-relaxed">
                  Solid One is entirely non-custodial. Our code is open-source, our contracts are audited, and our architecture is mathematically incapable of touching your funds.
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex w-full justify-center overflow-visible select-none max-lg:order-1 max-lg:mx-auto lg:order-2 lg:justify-end"
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="relative mx-auto w-full max-w-lg max-lg:max-w-[min(360px,90vw)]">
                  <img
                    src={securityImg}
                    alt=""
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="w-full aspect-[3/2] object-contain pointer-events-none select-none [-webkit-user-drag:none]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent" aria-hidden />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" aria-hidden />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-32 lg:w-40 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-transparent" aria-hidden />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-32 lg:w-40 bg-gradient-to-l from-[#050505] via-[#050505]/75 to-transparent" aria-hidden />
                  <div
                    className="pointer-events-none absolute left-0 top-0 w-44 h-44 bg-[radial-gradient(ellipse_at_top_left,#050505_0%,#050505_50%,transparent_72%)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute right-0 bottom-0 w-44 h-44 bg-[radial-gradient(ellipse_at_bottom_right,#050505_0%,#050505_50%,transparent_72%)]"
                    aria-hidden
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={STAGGER} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-14 items-stretch">
              {[
                { icon: Code2, label: "Open-source contracts", desc: "Every line of our on-chain code is publicly auditable on GitHub." },
                { icon: ScanEye, label: "Pre-sign verification", desc: "Review every recipient, amount, and contract call on device before anything leaves your wallet." },
                { icon: LockKeyhole, label: "No private key storage", desc: "Keys never leave your device. We have zero server-side custody." },
                { icon: UserCheck, label: "Multi-sig accounts", desc: "Require N-of-M approvals for high-value transactions." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                <motion.div key={item.label} variants={FADE_UP} className="app-feature-box h-full">
                  <div className="app-feature-box-inner gap-3 p-4">
                    <div className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                      <Icon className="w-4 h-4 text-white/80" strokeWidth={1.5} />
                    </div>
                    <div className="text-[13px] font-semibold text-white/90 leading-snug">{item.label}</div>
                    <p className="m-0 text-[12px] text-white/35 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );})}
            </motion.div>
          </motion.div>
        </section>

        {/* ══ SCAN & PAY / UPI ══════════════════════════════════════════════ */}
        <section id="infrastructure" className="py-32 max-w-7xl mx-auto px-6 md:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={STAGGER}>
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex w-full justify-center lg:justify-start"
              >
                <div
                  className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 w-[min(440px,98vw)] h-[min(460px,72vh)] pointer-events-none bg-[radial-gradient(ellipse_at_center,#050505_58%,rgba(5,5,5,0.92)_70%,transparent_100%)]"
                  aria-hidden
                />
                <div
                  className="relative z-10 flex items-center justify-center w-full max-w-[min(320px,85vw)] md:max-w-[360px] min-h-[460px] select-none isolate overflow-visible max-lg:mx-auto max-lg:translate-x-0 lg:mx-0 lg:translate-x-4"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src={appGlobeBg}
                    alt=""
                    aria-hidden
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 w-[240%] max-w-[min(640px,125vw)] h-auto object-contain opacity-85 mix-blend-lighten pointer-events-none select-none [-webkit-user-drag:none]"
                  />
                  <div className="relative z-10 w-full max-w-[min(224px,70vw)] md:max-w-[256px]">
                    <img
                      src={upiScanPayImg}
                      alt=""
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="relative w-full h-auto object-contain select-none pointer-events-none [-webkit-user-drag:none]"
                    />
                  </div>
                </div>
              </motion.div>

              <div className="w-full max-w-xl lg:ml-auto text-left lg:text-right">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}>
                  <motion.div variants={FADE_UP} className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">Scan & Pay</motion.div>
                  <motion.h2 variants={FADE_UP} className="font-display text-[clamp(2rem,3.9vw,2.93rem)] tracking-[0.04em] leading-[1.05] mb-6">
                    YOU PAY IN SOL<br />OR USDC.
                  </motion.h2>
                  <motion.p variants={FADE_UP} className="text-white/40 font-light text-lg leading-relaxed mb-8">
                    Scan any merchant UPI QR from Solid One. You spend crypto at live rates. The merchant receives Indian Rupees in their bank account across UPI supported countries. No new POS. No crypto training for staff.
                  </motion.p>
                  <motion.div variants={STAGGER} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-stretch">
                    {[
                      { icon: QrCode, label: "Scan UPI QR", desc: "Standard merchant codes at checkout" },
                      { icon: Wallet, label: "Pay SOL or USDC", desc: "Spend from your wallet at live rates" },
                      { icon: CreditCard, label: "Merchant gets INR", desc: "Instant rupee settlement to their bank" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.div key={item.label} variants={FADE_UP} className="app-feature-box h-full">
                          <div className="app-feature-box-inner gap-3 p-4 h-full">
                            <div className="w-8 h-8 flex items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                              <Icon className="w-4 h-4 text-white/80" strokeWidth={1.5} />
                            </div>
                            <div className="text-[12px] font-semibold text-white/90 leading-snug">{item.label}</div>
                            <p className="m-0 text-[11px] text-white/35 font-light leading-relaxed">{item.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══ CTA BANNER ════════════════════════════════════════════════════ */}
        <section className="py-40">
          <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}>
              <motion.h2 variants={FADE_UP} className="font-display text-[clamp(2.25rem,6vw,5.25rem)] tracking-[0.04em] leading-[0.88] mb-8 flex flex-col items-center gap-3 md:gap-4">
                <span>THE FUTURE</span>
                <span className="inline-flex items-center justify-center gap-[0.2em]">
                  IS
                  <img
                    src={logoMarkImg}
                    alt=""
                    className="h-[0.85em] w-[0.85em] object-contain shrink-0"
                    draggable={false}
                  />
                  SOLID.
                </span>
              </motion.h2>
              <motion.div variants={FADE_UP} className="flex flex-row flex-nowrap items-center justify-center gap-3 mt-6 w-full max-w-full">
                <Link href="/app-store" className="flex items-center gap-2.5 px-5 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors min-w-[152px] shrink-0">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" className="flex-shrink-0">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[8px] font-mono uppercase tracking-[0.15em] opacity-70">Download on the</div>
                    <div className="text-[14px] font-semibold leading-tight -mt-0.5">App Store</div>
                  </div>
                </Link>
                <Link href="/play-store" className="flex items-center gap-2.5 px-5 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors min-w-[152px] shrink-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" alt="Google Play" width="19" height="19" className="flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-[8px] font-mono uppercase tracking-[0.15em] opacity-70">Get it on</div>
                    <div className="text-[14px] font-semibold leading-tight -mt-0.5">Google Play</div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
