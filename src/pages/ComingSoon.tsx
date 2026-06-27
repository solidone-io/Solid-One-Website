import { Link } from "wouter";
import { motion } from "framer-motion";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";

const FADE_UP = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

type ComingSoonProps = {
  title: string;
  eyebrow?: string;
};

export function ComingSoon({ title, eyebrow = "Solid One" }: ComingSoonProps) {
  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,900px)] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
      </div>

      <MarketingHeader
        extraLinks={[
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
        ]}
      />

      <main className="relative z-10 pt-28 md:pt-36 pb-8">
        <section className="px-6 md:px-10 py-8 md:py-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={FADE_UP}
            className="max-w-lg w-full mx-auto text-center"
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/40 mb-5">{eyebrow}</p>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] tracking-[0.06em] leading-[1.05] mb-5">
              {title}
            </h1>
            <p className="text-2xl md:text-3xl font-light text-white/70 mb-4">Coming soon</p>
            <p className="text-[15px] text-white/40 font-light leading-relaxed mb-10">
              We are working on this section. Check back later or follow us for updates.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[9px] bg-white text-black hover:bg-white/90 text-[14px] font-semibold h-10 px-6 transition-colors"
            >
              Back to home
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

export default function CareersComingSoon() {
  return <ComingSoon title="CAREERS" eyebrow="Company" />;
}

export function PressComingSoon() {
  return <ComingSoon title="PRESS" eyebrow="Company" />;
}

export function DevelopersComingSoon() {
  return <ComingSoon title="DEVELOPERS" eyebrow="Build on Solid One" />;
}
