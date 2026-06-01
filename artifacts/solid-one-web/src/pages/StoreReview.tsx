import { Link } from "wouter";
import { motion } from "framer-motion";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StoreNotifyForm } from "@/components/StoreNotifyForm";
import type { StorePlatform } from "@/lib/store-notify-api";

type StoreKind = "apple" | "google";

const STORE: Record<
  StoreKind,
  {
    eyebrow: string;
    title: string;
    badge: string;
    body: string;
    storeName: string;
  }
> = {
  apple: {
    eyebrow: "iOS",
    title: "APP STORE",
    badge: "Under Apple review",
    body: "The Solid One app is currently under review by Apple. It will be visible on the App Store shortly.",
    storeName: "App Store",
  },
  google: {
    eyebrow: "Android",
    title: "GOOGLE PLAY",
    badge: "Under Google review",
    body: "The Solid One app is currently under review by Google. It will be visible on Google Play shortly.",
    storeName: "Google Play",
  },
};

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function StoreReviewPage({ kind }: { kind: StoreKind }) {
  const config = STORE[kind];
  const platform: StorePlatform = kind === "apple" ? "apple" : "google";

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
            className="w-full max-w-lg text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04]">
                {kind === "apple" ? (
                  <AppleIcon className="h-8 w-8 text-white" />
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg"
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8"
                    draggable={false}
                  />
                )}
              </div>
            </div>

            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/40 mb-4">{config.eyebrow}</p>
            <h1 className="font-display text-[clamp(2rem,5vw,3rem)] tracking-[0.06em] leading-[1.05] mb-4">
              {config.title}
            </h1>

            <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-[12px] font-mono uppercase tracking-[0.12em] text-amber-200/90 mb-6">
              {config.badge}
            </span>

            <p className="text-[15px] text-white/55 font-light leading-relaxed mb-8">{config.body}</p>

            <div className="mb-8">
              <StoreNotifyForm platform={platform} storeName={config.storeName} />
            </div>

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

export function AppStoreReview() {
  return <StoreReviewPage kind="apple" />;
}

export function PlayStoreReview() {
  return <StoreReviewPage kind="google" />;
}
