import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { LegalBlock } from "@/content/privacy-policy";
import { sectionIdFromHeading, sectionsFromBlocks } from "@/lib/legal-sections";

const SIDEBAR_TOP_PX = 112;
const SIDEBAR_WIDTH_PX = 280;

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } },
};

type LegalDocumentPageProps = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  blocks: LegalBlock[];
  contact?: ReactNode;
  afterContact?: ReactNode;
  showSectionNav?: boolean;
};

function LegalParagraph({ text }: { text: string }) {
  return <p className="legal-p whitespace-pre-wrap text-justify">{text}</p>;
}

function LegalSectionNavPanel({
  sections,
  activeId,
}: {
  sections: ReturnType<typeof sectionsFromBlocks>;
  activeId: string | null;
}) {
  return (
    <nav className="legal-sidebar-nav" aria-label="Table of contents">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mb-4 px-3">On this page</p>
      <ul className="space-y-0.5">
        {sections.map((section) => {
          const active = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`block rounded-lg px-3 py-2 text-[13px] leading-snug whitespace-nowrap transition-colors border-l-2 ${
                  active
                    ? "border-white text-white bg-white/[0.06] font-medium"
                    : "border-transparent text-white/45 hover:text-white/80 hover:bg-white/[0.03]"
                }`}
              >
                <span className="text-white/35 font-mono text-[11px] mr-1.5">{section.number}.</span>
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function LegalDocumentPage({
  title,
  effectiveDate,
  lastUpdated,
  blocks,
  contact,
  afterContact,
  showSectionNav = true,
}: LegalDocumentPageProps) {
  const sections = useMemo(() => sectionsFromBlocks(blocks), [blocks]);
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const hasNav = showSectionNav && sections.length > 0;

  const railRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [navPinned, setNavPinned] = useState(true);
  const [navLeft, setNavLeft] = useState(0);

  const updateSidebarPosition = useCallback(() => {
    const rail = railRef.current;
    const nav = navRef.current;
    const footer = footerRef.current;
    if (!rail || !nav || !footer) return;

    const railRect = rail.getBoundingClientRect();
    const footerTop = footer.getBoundingClientRect().top;
    const navHeight = nav.offsetHeight;
    const fixedBottom = SIDEBAR_TOP_PX + navHeight + 32;

    if (footerTop <= fixedBottom) {
      setNavPinned(false);
    } else {
      setNavPinned(true);
      setNavLeft(railRect.left);
    }
  }, []);

  useLayoutEffect(() => {
    if (!hasNav) return;
    updateSidebarPosition();
  }, [hasNav, updateSidebarPosition, sections.length]);

  useEffect(() => {
    if (!hasNav) return;
    const onUpdate = () => updateSidebarPosition();
    window.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate);
    const nav = navRef.current;
    const ro = nav ? new ResizeObserver(onUpdate) : null;
    if (nav && ro) ro.observe(nav);
    return () => {
      window.removeEventListener("scroll", onUpdate);
      window.removeEventListener("resize", onUpdate);
      ro?.disconnect();
    };
  }, [hasNav, updateSidebarPosition]);

  useEffect(() => {
    if (!hasNav) return;

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.sort(
          (a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top,
        )[0];
        if (topmost?.target.id) setActiveId(topmost.target.id);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: [0, 0.1, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections, hasNav]);

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,900px)] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
      </div>

      <MarketingHeader />

      <main className="relative z-10 pt-28 md:pt-32 pb-8">
        <div className="px-6 md:px-10 flex justify-center">
          <div className={`w-full ${hasNav ? "max-w-[1000px]" : "max-w-3xl"}`}>
            <div className={hasNav ? "lg:flex lg:gap-x-10 xl:gap-x-12 lg:items-stretch" : ""}>
              {hasNav && (
                <div
                  ref={railRef}
                  className="hidden lg:block shrink-0 relative self-stretch"
                  style={{ width: SIDEBAR_WIDTH_PX }}
                  aria-hidden
                >
                  <div
                    ref={navRef}
                    className={`z-30 ${navPinned ? "fixed" : "absolute bottom-0 left-0"}`}
                    style={
                      navPinned
                        ? { top: SIDEBAR_TOP_PX, left: navLeft, width: SIDEBAR_WIDTH_PX }
                        : { width: SIDEBAR_WIDTH_PX }
                    }
                  >
                    <LegalSectionNavPanel sections={sections} activeId={activeId} />
                  </div>
                </div>
              )}

              <div className="min-w-0 flex-1">
                {hasNav && (
                  <div className="lg:hidden mb-6 -mx-1 overflow-x-auto pb-1">
                    <div className="flex gap-2 px-1 min-w-min">
                      {sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] border transition-colors ${
                            activeId === section.id
                              ? "bg-white text-black border-white"
                              : "border-white/15 text-white/50 hover:text-white"
                          }`}
                        >
                          {section.number}. {section.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <motion.header
                  initial="hidden"
                  animate="visible"
                  variants={FADE_UP}
                  className={`text-left mb-8 md:mb-10 ${hasNav ? "lg:pl-2" : ""}`}
                >
                  <h1 className="font-display text-[clamp(1.5rem,4vw,1.75rem)] tracking-[0.06em] font-semibold mb-3">
                    {title}
                  </h1>
                  <p className="text-[13px] text-white/50 font-medium">Effective Date: {effectiveDate}</p>
                  <p className="text-[13px] text-white/50 font-medium mt-1">Last Updated: {lastUpdated}</p>
                </motion.header>

                <motion.article initial="hidden" animate="visible" variants={FADE_UP} className="legal-document">
                  {blocks.map((block, i) =>
                    block.type === "h2" ? (
                      <h2
                        key={`${block.text}-${i}`}
                        id={sectionIdFromHeading(block.text)}
                        className="legal-h2 legal-section-anchor"
                      >
                        {block.text}
                      </h2>
                    ) : (
                      <LegalParagraph key={`${block.text.slice(0, 32)}-${i}`} text={block.text} />
                    ),
                  )}
                  {contact}
                  {afterContact}
                </motion.article>

                <div className="mt-12">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-[9px] bg-white text-black hover:bg-white/90 text-[14px] font-semibold h-10 px-6 transition-colors"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div ref={footerRef} id="legal-page-footer" className="relative z-10 border-t border-white/6 pt-6 md:pt-8 mt-8">
        <SiteFooter />
      </div>
    </div>
  );
}
