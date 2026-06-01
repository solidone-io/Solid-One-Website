import { motion } from "framer-motion";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SupportForm } from "@/components/SupportForm";

export default function Support() {
  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,900px)] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
      </div>

      <MarketingHeader />

      <main className="relative z-10 pt-28 md:pt-36 pb-8">
        <section className="max-w-xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/40 mb-4 text-center">
              Solid One
            </p>
            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] tracking-[0.06em] leading-[1.05] mb-3 text-center">
              SUPPORT
            </h1>
            <p className="text-[15px] text-white/50 font-light leading-relaxed mb-8 text-center">
              Have a question or need help? Send us a message and our team will get back to you.
            </p>

            <SupportForm />
          </motion.div>
        </section>
      </main>

      <div className="relative z-10 border-t border-white/6 pt-6 md:pt-8 mt-12">
        <SiteFooter />
      </div>
    </div>
  );
}
