import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileMenuButton } from "@/components/MobileNavMenu";
import logoImg from "@assets/solid-one-logo.png";

export type LegalTocSection = {
  id: string;
  number: string;
  label: string;
};

type LegalMobileTocMenuProps = {
  open: boolean;
  onClose: () => void;
  sections: LegalTocSection[];
  activeId: string | null;
  title?: string;
};

export function LegalMobileTocMenu({ open, onClose, sections, activeId, title = "On this page" }: LegalMobileTocMenuProps) {
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
        <motion.aside
          className="fixed inset-0 z-[55] flex h-[100dvh] w-full flex-col bg-[#080808] backdrop-blur-xl lg:hidden"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <a href="/" onClick={onClose}>
              <img src={logoImg} alt="Solid One" className="h-7 w-auto" draggable={false} />
            </a>
            <MobileMenuButton open className="mobile-menu-btn flex" onToggle={onClose} />
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-6 py-5" aria-label="Table of contents">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.22em] text-white/30">{title}</p>
            <ul className="space-y-1">
              {sections.map((section, index) => {
                const active = activeId === section.id;
                return (
                  <motion.li
                    key={section.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + index * 0.03 }}
                  >
                    <a
                      href={`#${section.id}`}
                      onClick={onClose}
                      className={`mobile-nav-link block rounded-xl border px-4 py-3.5 text-[14px] leading-snug transition-colors ${
                        active
                          ? "border-white/20 bg-white/[0.06] font-medium text-white"
                          : "border-white/8 bg-white/[0.02] font-light text-white/55 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="text-white/35 font-mono text-[11px] mr-1.5">{section.number}.</span>
                      {section.label}
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
