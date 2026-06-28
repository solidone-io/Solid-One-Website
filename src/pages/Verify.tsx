import { HomeSiteHeader } from "@/components/HomeSiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VerifyPageContent } from "@/components/verify/VerifyPageContent";
import verifyHeroBg from "@assets/verify-hero-bg.png";

export default function Verify() {
  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage: `url(${verifyHeroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center 42%",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 78%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      <HomeSiteHeader />

      <main className="relative z-10">
        <section className="box-border min-h-[100dvh] flex items-center justify-center pt-[5.5rem] md:pt-[6.5rem] pb-8">
          <VerifyPageContent />
        </section>

        <div className="border-t border-white/6 pt-6 md:pt-8 pb-2">
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
