import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";

const LAUNCH_AT = new Date(2026, 7, 15, 0, 0, 0, 0);

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdown(now: Date): CountdownParts {
  const diff = Math.max(0, LAUNCH_AT.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[4.5rem] md:min-w-[5.5rem]">
      <div className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-4 md:py-5">
        <span className="block text-center font-display text-[clamp(2rem,6vw,3.25rem)] tabular-nums tracking-[0.04em] text-white leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/40">{label}</span>
    </div>
  );
}

export default function Extension() {
  const [parts, setParts] = useState<CountdownParts>(() => getCountdown(new Date()));

  useEffect(() => {
    const tick = () => setParts(getCountdown(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,900px)] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
      </div>

      <MarketingHeader />

      <main className="relative z-10 pt-28 md:pt-36 pb-8 flex flex-col min-h-[calc(100vh-120px)]">
        <section className="flex-1 flex items-center justify-center px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl text-center"
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/40 mb-5">Solid One</p>
            <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] tracking-[0.06em] leading-[1.05] mb-3">
              CHROME EXTENSION
            </h1>
            <p className="text-[15px] text-white/50 font-light mb-10">Launching 15 August 2026</p>

            <div className="flex justify-center gap-3 md:gap-4 mb-6">
              <CountdownUnit value={parts.days} label="Days" />
              <CountdownUnit value={parts.hours} label="Hours" />
              <CountdownUnit value={parts.minutes} label="Minutes" />
              <CountdownUnit value={parts.seconds} label="Seconds" />
            </div>
          </motion.div>
        </section>
      </main>

      <div className="relative z-10 border-t border-white/6 pt-6 md:pt-8">
        <SiteFooter />
      </div>
    </div>
  );
}
