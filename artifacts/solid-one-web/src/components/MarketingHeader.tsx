import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/solid-one-logo.png";

type MarketingHeaderProps = {
  extraLinks?: { label: string; href: string }[];
};

export function MarketingHeader({ extraLinks = [] }: MarketingHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-xl border-b border-white/6">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <Link href="/">
          <img src={logoImg} alt="Solid One" className="h-8 w-auto" draggable={false} />
        </Link>
        <div className="flex items-center gap-5">
          {extraLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-white/55 hover:text-white transition-colors font-medium tracking-wide"
            >
              {link.label}
            </Link>
          ))}
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
  );
}
