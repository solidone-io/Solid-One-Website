import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import logoImg from "@assets/solid-one-logo.png";

const MENU_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Support", href: "/support" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Term of service", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/developers" },
      { label: "API", href: "/developers" },
      { label: "GitHub", href: "/developers" },
    ],
  },
] as const;

type MobileNavMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenuButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="mobile-menu-btn hidden max-md:flex"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onToggle}
    >
      <span />
      <span />
      <span />
    </button>
  );
}

export function MobileNavMenu({ open, onClose }: MobileNavMenuProps) {
  const [expanded, setExpanded] = useState<string | null>("Company");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.aside
            className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-[#080808] backdrop-blur-xl md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <a href="/" onClick={onClose}>
                <img src={logoImg} alt="Solid One" className="h-7 w-auto" draggable={false} />
              </a>
              <MobileMenuButton open onToggle={onClose} />
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
              <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">Menu</p>
              {MENU_SECTIONS.map((section, sectionIndex) => {
                const isOpen = expanded === section.title;
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + sectionIndex * 0.06 }}
                    className="mb-2 overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                      onClick={() => setExpanded(isOpen ? null : section.title)}
                    >
                      <span className="text-[15px] font-medium tracking-wide text-white">{section.title}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 border-t border-white/6 px-3 pb-3 pt-1">
                            {section.links.map((link, linkIndex) => (
                              <motion.div
                                key={link.label}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: linkIndex * 0.04 }}
                              >
                                <Link
                                  href={link.href}
                                  onClick={onClose}
                                  className="mobile-nav-link block rounded-lg px-3 py-2.5 text-[14px] font-light text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
                                >
                                  {link.label}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 }}
                className="mt-2"
              >
                <Link
                  href="/support"
                  onClick={onClose}
                  className="mobile-nav-link flex w-full items-center rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/[0.04]"
                >
                  Support
                </Link>
              </motion.div>
            </nav>

            <div className="border-t border-white/8 px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <a
                href="https://x.com/solidone_co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-[14px] font-semibold text-black transition-colors hover:bg-white/90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
                </svg>
                Follow on X
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
