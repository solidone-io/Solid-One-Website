import { Link } from "wouter";
import { motion } from "framer-motion";
import { KeyRound, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { SiSolana } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import logoImg from "@assets/solid-one-logo.png";
import missionLogoImg from "@/assets/solid-one-mission-logo.png";

const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const } },
};

const VALUES = [
  {
    icon: KeyRound,
    title: "Self custody first",
    body: "You hold your keys. Solid One is software that helps you interact with Solana and integrated services without taking custody of your assets.",
  },
  {
    icon: Layers,
    title: "Everyday utility",
    body: "From swaps and portfolio views to scan and pay, utilities, and real world asset access, we focus on tools people can use in daily life, not speculation alone.",
  },
  {
    icon: ShieldCheck,
    title: "Security by design",
    body: "Verification, clear signing flows, and thoughtful UX reduce the chance of costly mistakes on irreversible blockchain networks.",
  },
  {
    icon: Sparkles,
    title: "Open ecosystem",
    body: "We build alongside Solana partners, liquidity sources, and payment rails so users benefit from a composable, growing stack.",
  },
];

const HIGHLIGHTS = [
  { value: "Self custodial", label: "You control your wallet" },
  { value: "Solana native", label: "Fast, low cost on chain" },
  { value: "One app", label: "Assets, pay, RWA, security" },
];

export default function About() {
  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,900px)] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/3 right-0 w-[480px] h-[480px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_65%)]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link href="/">
            <img src={logoImg} alt="Solid One" className="h-8 w-auto" draggable={false} />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/" className="text-[13px] text-white/55 hover:text-white transition-colors font-medium tracking-wide">
              Home
            </Link>
            <div className="extension-btn-border hidden sm:block">
              <Link href="/extension">
                <Button className="rounded-[9px] bg-white text-black hover:bg-white/90 text-[14px] font-semibold h-9 px-5 border-0 shadow-none">
                  Extension
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 md:pt-36">
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <motion.div initial="hidden" animate="visible" variants={FADE_UP}>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/40 mb-5">Company</p>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] tracking-[0.04em] leading-[1.05] mb-6 max-w-4xl">
              ABOUT SOLID ONE
            </h1>
            <p className="text-lg md:text-[1.35rem] text-white/50 font-light leading-relaxed max-w-2xl">
              A self custodial digital asset platform built on Solana, designed to make crypto secure, useful, and
              accessible for everyone.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={FADE_UP}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-14 md:mt-16"
          >
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 md:px-6 md:py-6"
              >
                <p className="text-[15px] font-semibold text-white/90 mb-1">{item.value}</p>
                <p className="text-[13px] text-white/40 font-light">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-stretch">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={FADE_UP}
              className="flex flex-col justify-center"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Mission</p>
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] tracking-[0.04em] leading-[1.08] mb-6">
                FINANCE THAT STAYS YOURS
              </h2>
              <p className="text-[15px] text-white/45 font-light leading-relaxed mb-4 max-w-xl">
                We believe the next wave of finance will be self custodial, global, and programmable. Solid One exists to
                give people a single, trustworthy place to manage digital assets, pay with crypto where it matters, and
                explore real world assets, all without giving up control of their wallets.
              </p>
              <p className="text-[15px] text-white/45 font-light leading-relaxed max-w-xl">
                Glider Web3 Solutions Limited develops and operates Solid One from India, with a long term commitment to
                compliance, transparency, and responsible product design.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={FADE_UP}
              className="rounded-[28px] bg-white flex items-center justify-center min-h-[280px] md:min-h-[320px] p-8 md:p-12"
            >
              <img
                src={missionLogoImg}
                alt="Solid One"
                className="w-full max-w-[280px] md:max-w-[320px] h-auto object-contain"
                draggable={false}
              />
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="mb-10 md:mb-12">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Product</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] tracking-[0.04em]">WHAT WE BUILD</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {VALUES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={FADE_UP}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card glow-card p-6 md:p-8 flex gap-5"
                >
                  <div className="w-11 h-11 shrink-0 border border-white/12 flex items-center justify-center bg-white/[0.04]">
                    <Icon className="w-5 h-5 text-white/75" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-2.5 text-white/90">{item.title}</h3>
                    <p className="text-[14px] text-white/40 font-light leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="rounded-[28px] border border-white/10 bg-white/[0.02] p-8 md:p-12 lg:p-14"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12">
              <div className="w-14 h-14 shrink-0 border border-white/15 flex items-center justify-center bg-white/[0.04]">
                <SiSolana className="w-7 h-7 text-white/80" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Ecosystem</p>
                <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] tracking-[0.04em] mb-5">BUILT ON SOLANA</h2>
                <p className="text-[15px] text-white/45 font-light leading-relaxed mb-4 max-w-3xl">
                  Solana&apos;s speed and low fees make it practical for payments, trading, and everyday on chain activity.
                  Solid One is native to this ecosystem, integrating with leading protocols, oracles, and infrastructure
                  partners so users get reliable execution and up to date market context.
                </p>
                <p className="text-[15px] text-white/45 font-light leading-relaxed max-w-3xl">
                  Whether you are sending SOL, swapping tokens, scanning to pay a merchant, or exploring tokenized real
                  world assets, Solid One is built to keep you in control while surfacing the best of what Solana has to
                  offer.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24 md:pb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="max-w-3xl"
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4">Legal entity</p>
            <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] tracking-[0.04em] mb-6">THE COMPANY</h2>
            <p className="text-[15px] text-white/45 font-light leading-relaxed mb-5">
              Solid One is developed and operated by{" "}
              <span className="text-white/75">Glider Web3 Solutions Limited</span>, incorporated in India (CIN:
              U62099OD2026PTC053357). Registered office: 541, K9, Kalinga Nagar, Bhubaneswar, 751003, India.
            </p>
            <p className="text-[14px] text-white/35 font-light leading-relaxed">
              We are a product and engineering team focused on Web3 financial technology, not a bank, broker, or custodian.
              For legal and risk information, see the disclaimer below.
            </p>
            <Link
              href="/"
              className="inline-flex mt-8 text-[13px] font-medium text-white/60 hover:text-white transition-colors tracking-wide"
            >
              ← Back to home
            </Link>
          </motion.div>
        </section>
      </main>

      <div className="relative z-10 border-t border-white/6 pt-6 md:pt-8">
        <SiteFooter />
      </div>
    </div>
  );
}
