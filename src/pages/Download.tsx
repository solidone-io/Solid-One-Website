import { HomeSiteHeader } from "@/components/HomeSiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DownloadPageContent } from "@/components/download/DownloadPageContent";

export default function Download() {
  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black max-md:overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,900px)] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
      </div>

      <HomeSiteHeader />

      <main className="relative z-10 pt-28 md:pt-32">
        <DownloadPageContent />
      </main>
      <div className="relative z-10 border-t border-white/6 pt-6 md:pt-8 mt-8">
        <SiteFooter />
      </div>
    </div>
  );
}
