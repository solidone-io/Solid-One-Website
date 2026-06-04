import { useEffect, useState } from "react";
import { Link } from "wouter";
import { MobileMenuButton, MobileNavMenu } from "@/components/MobileNavMenu";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/solid-one-logo.png";

type HomeSiteHeaderProps = {
  /** When true, header always uses solid background (e.g. inner pages). */
  solid?: boolean;
};

export function HomeSiteHeader({ solid = true }: HomeSiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (solid) return;
    const fn = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [solid]);

  const headerSolid = solid || isScrolled || mobileMenuOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
          headerSolid ? "bg-[#050505]/90 backdrop-blur-lg border-b border-white/6 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto flex w-full items-center justify-between gap-3 px-6 md:px-10">
          <Link href="/" className="shrink-0">
            <img src={logoImg} alt="Solid One" className="h-8 w-auto" draggable={false} />
          </Link>

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
                    {menu.links.map((link) => (
                      <Link key={link.label} href={link.href} className="nav-dropdown-item">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Link href="/developers" className="hover:text-white transition-colors">
              Developers
            </Link>
            <Link href="/support" className="hover:text-white transition-colors">
              Support
            </Link>
            <Link href="/download" className="hover:text-white transition-colors text-white/80">
              Download
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="https://x.com/solidone_co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
              </svg>
            </a>
            <div className="extension-btn-border">
              <Link href="/extension">
                <Button className="rounded-[9px] bg-white text-black hover:bg-white/90 text-[14px] font-semibold h-9 px-5 border-0 shadow-none">
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
    </>
  );
}
