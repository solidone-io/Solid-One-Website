import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Star,
  X,
} from "lucide-react";
import { DOWNLOAD_APP } from "@/content/download-app";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchDownloadReviews,
  fetchDownloadStats,
  fetchMyDownloadReview,
  flagDownloadReview,
  postDownloadReview,
  voteReviewHelpful,
  type DownloadReview,
  type DownloadStats,
} from "@/lib/download-api";
import { getDownloadAuth } from "@/lib/download-auth";
import { InstallActionBar } from "@/components/download/InstallActionBar";
import { GoogleSignInButton } from "@/components/download/GoogleSignInButton";
import { useToast } from "@/hooks/use-toast";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return String(n);
}

const EMPTY_DOWNLOAD_STATS: DownloadStats = {
  downloadCount: 0,
  reviewCount: 0,
  averageRating: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

function starFillForAverage(avg: number, index: number): "full" | "half" | "empty" {
  if (avg >= index) return "full";
  if (avg >= index - 0.5) return "half";
  return "empty";
}

function AverageStarRow({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = starFillForAverage(value, i);
        if (fill === "full") {
          return <Star key={i} className={`${sz} fill-emerald-400 text-emerald-400`} />;
        }
        if (fill === "half") {
          return (
            <span key={i} className={`relative inline-block ${sz}`}>
              <Star className={`${sz} fill-white/10 text-white/20`} />
              <span className="absolute inset-0 w-1/2 overflow-hidden">
                <Star className={`${sz} fill-emerald-400 text-emerald-400`} />
              </span>
            </span>
          );
        }
        return <Star key={i} className={`${sz} fill-white/10 text-white/20`} />;
      })}
    </span>
  );
}

function StarRow({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  return <AverageStarRow value={value} size={size} />;
}

function InteractiveStars({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const active = readOnly ? value : hover || value;

  return (
    <div className="flex gap-2 justify-center md:justify-start">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= active;
        const StarIcon = (
          <Star
            className={`h-9 w-9 ${filled ? "fill-emerald-400 text-emerald-400" : "fill-white/10 text-white/25"}`}
          />
        );

        if (readOnly) {
          return (
            <span key={i} className="p-1" aria-hidden>
              {StarIcon}
            </span>
          );
        }

        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(i);
            }}
            className="p-1 transition-transform hover:scale-110"
          >
            {StarIcon}
          </button>
        );
      })}
    </div>
  );
}

function RatingBars({ stats }: { stats: DownloadStats }) {
  const total = stats.reviewCount;

  return (
    <div className="flex-1 space-y-2 min-w-[160px]">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = stats.distribution[star];
        const barPct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-[11px] text-white/45">
            <span className="w-3 shrink-0 text-right tabular-nums">{star}</span>
            <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500/85 transition-all duration-500"
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RatingsSummaryPanel({ stats }: { stats: DownloadStats }) {
  const avg = stats.averageRating;
  return (
    <div className="flex items-center gap-5 sm:gap-6 shrink-0">
      <div className="text-center shrink-0">
        <p className="text-[44px] sm:text-5xl font-light leading-none tabular-nums tracking-tight">
          {avg.toFixed(1)}
        </p>
        <div className="mt-1.5 flex justify-center">
          <AverageStarRow value={avg} size="sm" />
        </div>
        <p className="text-[11px] text-white/40 mt-1.5 tabular-nums">{formatCount(stats.reviewCount)} reviews</p>
      </div>
      <RatingBars stats={stats} />
    </div>
  );
}

const SCREENSHOT_GAP = 12;

const MOBILE_SCREENSHOTS_MQ = "(max-width: 767px)";
const VISIBLE_SCREENSHOTS_DESKTOP = 3;
const VISIBLE_SCREENSHOTS_MOBILE = 2;

function visibleScreenshotsCount(): number {
  if (typeof window === "undefined") return VISIBLE_SCREENSHOTS_DESKTOP;
  return window.matchMedia(MOBILE_SCREENSHOTS_MQ).matches
    ? VISIBLE_SCREENSHOTS_MOBILE
    : VISIBLE_SCREENSHOTS_DESKTOP;
}

function ScreenshotCarousel() {
  const screenshots = DOWNLOAD_APP.screenshots;
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lightboxScrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const tapRef = useRef({ x: 0, y: 0, moved: false });
  const [cardWidth, setCardWidth] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isScreenshotCard = (target: EventTarget | null) =>
    target instanceof Element && Boolean(target.closest("[data-screenshot-card]"));

  const scrollLightboxTo = useCallback((index: number) => {
    const el = lightboxScrollRef.current;
    if (!el) return;
    const slide = el.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({ inline: "center", behavior: "smooth" });
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const id = requestAnimationFrame(() => scrollLightboxTo(lightboxIndex));
    return () => cancelAnimationFrame(id);
  }, [lightboxIndex, scrollLightboxTo]);

  const stepLightbox = useCallback(
    (direction: -1 | 1) => {
      setLightboxIndex((current) => {
        if (current === null) return null;
        const next = (current + direction + screenshots.length) % screenshots.length;
        requestAnimationFrame(() => scrollLightboxTo(next));
        return next;
      });
    },
    [screenshots.length, scrollLightboxTo],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, stepLightbox]);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const visible = visibleScreenshotsCount();
      const gaps = SCREENSHOT_GAP * Math.max(0, visible - 1);
      setCardWidth(Math.floor((viewport.clientWidth - gaps) / visible));
    };
    measure();
    const ro = new ResizeObserver(measure);
    const mq = window.matchMedia(MOBILE_SCREENSHOTS_MQ);
    const onMqChange = () => measure();
    if (viewportRef.current) ro.observe(viewportRef.current);
    mq.addEventListener("change", onMqChange);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el || cardWidth <= 0) return;
    el.scrollBy({ left: direction * (cardWidth + SCREENSHOT_GAP), behavior: "smooth" });
  };

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || e.button !== 0 || isScreenshotCard(e.target)) return;
    if (e.pointerType === "mouse") {
      dragRef.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
      el.setPointerCapture(e.pointerId);
    }
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.scrollLeft - dx;
  };

  const endTrackDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current.active = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="relative w-full">
      <div ref={viewportRef} className="w-full overflow-hidden">
        <div
          ref={scrollRef}
          role="region"
          aria-label="App screenshots"
          className="flex items-start overflow-x-auto touch-pan-x cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
          style={{ gap: SCREENSHOT_GAP }}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={endTrackDrag}
          onPointerCancel={endTrackDrag}
        >
          {screenshots.map((shot, i) => (
            <button
              key={i}
              type="button"
              data-screenshot-card
              aria-label={`View ${shot.alt}`}
              className="shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] cursor-pointer text-left transition-opacity hover:opacity-95 touch-manipulation"
              style={{ width: cardWidth || undefined }}
              onPointerDown={(e) => {
                e.stopPropagation();
                tapRef.current = { x: e.clientX, y: e.clientY, moved: false };
              }}
              onPointerMove={(e) => {
                if (
                  Math.hypot(e.clientX - tapRef.current.x, e.clientY - tapRef.current.y) > 10
                ) {
                  tapRef.current.moved = true;
                }
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                if (!tapRef.current.moved) openLightbox(i);
              }}
              onPointerCancel={(e) => {
                e.stopPropagation();
              }}
            >
              <img
                src={shot.src}
                alt={shot.alt}
                className="block w-full h-auto rounded-2xl pointer-events-none"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous screenshot"
        onClick={() => scrollByCard(-1)}
        className="absolute top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#141414] text-white/70 transition-colors hover:bg-white/10 hover:text-white left-0 -translate-x-[calc(100%+10px)]"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next screenshot"
        onClick={() => scrollByCard(1)}
        className="absolute top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#141414] text-white/70 transition-colors hover:bg-white/10 hover:text-white right-0 translate-x-[calc(100%+10px)]"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Screenshot viewer"
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 px-4 py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxIndex(null)}
              >
            <button
              type="button"
              aria-label="Close"
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#141414]/90 text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="h-5 w-5" />
            </button>

            {screenshots.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute left-2 md:left-6 top-1/2 z-20 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#141414]/90 text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    stepLightbox(-1);
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute right-2 md:right-6 top-1/2 z-20 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#141414]/90 text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    stepLightbox(1);
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div
              className="relative w-full max-w-[min(92vw,480px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={lightboxScrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]"
                onScroll={() => {
                  const el = lightboxScrollRef.current;
                  if (!el || el.clientWidth <= 0) return;
                  const index = Math.round(el.scrollLeft / el.clientWidth);
                  if (index >= 0 && index < screenshots.length && index !== lightboxIndex) {
                    setLightboxIndex(index);
                  }
                }}
              >
                {screenshots.map((shot, i) => (
                  <div
                    key={i}
                    className="flex w-full shrink-0 snap-center snap-always items-center justify-center px-1"
                  >
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      className="max-h-[min(78vh,640px)] w-auto max-w-full rounded-2xl border border-white/10 shadow-2xl"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[12px] text-white/45 tabular-nums">
                {lightboxIndex + 1} / {screenshots.length}
              </p>
            </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

function UserAvatar({ name, picture, className = "h-9 w-9" }: { name: string; picture?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(picture) && !failed;

  if (!showImage) {
    return (
      <div
        className={`${className} rounded-full bg-white/10 flex items-center justify-center text-sm font-medium shrink-0`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={picture}
      alt=""
      referrerPolicy="no-referrer"
      className={`${className} rounded-full object-cover shrink-0`}
      onError={() => setFailed(true)}
    />
  );
}

function ReviewCard({
  review,
  onHelpful,
  onFlag,
}: {
  review: DownloadReview;
  onHelpful: (id: number, helpful: boolean) => void;
  onFlag: (id: number, reason: "spam" | "inappropriate") => void;
}) {
  const dateTime = new Date(review.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="relative py-5 border-b border-white/6 last:border-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Review options"
            className="absolute top-4 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-white transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[180px] bg-[#1a1a1a] border-white/10 text-white"
        >
          <DropdownMenuItem
            className="text-[13px] focus:bg-white/10 focus:text-white cursor-pointer"
            onClick={() => onFlag(review.id, "spam")}
          >
            Flag as spam
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] focus:bg-white/10 focus:text-white cursor-pointer"
            onClick={() => onFlag(review.id, "inappropriate")}
          >
            Flag as inappropriate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-start gap-3">
        <UserAvatar name={review.userName} picture={review.userPicture} className="h-10 w-10" />
        <div className="flex-1 min-w-0 pr-9">
          <p className="font-medium text-[14px] truncate">{review.userName}</p>
          <div className="mt-1">
            <StarRow value={review.stars} size="sm" />
          </div>
          {review.text ? (
            <p className="mt-2 text-[14px] text-white/65 leading-relaxed">{review.text}</p>
          ) : null}
          {review.adminReply ? (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
              <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-300/90 mb-1.5">
                Response from Solid One
              </p>
              <p className="text-[13px] text-white/75 leading-relaxed whitespace-pre-wrap">{review.adminReply.text}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 pl-[52px] text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="text-[11px] text-white/35 shrink-0">{dateTime}</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Was this helpful?</span>
          <button
            type="button"
            className="hover:text-white transition-colors"
            onClick={() => onHelpful(review.id, true)}
          >
            Yes ({review.helpfulYes})
          </button>
          <button
            type="button"
            className="hover:text-white transition-colors"
            onClick={() => onHelpful(review.id, false)}
          >
            No ({review.helpfulNo})
          </button>
        </div>
      </div>
    </article>
  );
}

export function DownloadPageContent() {
  const { toast } = useToast();
  const auth = getDownloadAuth();
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [reviews, setReviews] = useState<DownloadReview[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [allReviewsOpen, setAllReviewsOpen] = useState(false);
  const [myReview, setMyReview] = useState<DownloadReview | null>(null);
  const [draftStars, setDraftStars] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [ratingAgreed, setRatingAgreed] = useState(false);
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [search, setSearch] = useState("");
  const [modalReviews, setModalReviews] = useState<DownloadReview[]>([]);
  const [modalTotal, setModalTotal] = useState(0);

  const refresh = useCallback(async () => {
    const authed = Boolean(getDownloadAuth());
    const [s, r, mine] = await Promise.all([
      fetchDownloadStats(),
      fetchDownloadReviews({ limit: 5, offset: 0 }),
      authed ? fetchMyDownloadReview().catch(() => null) : Promise.resolve(null),
    ]);
    setStats(s);
    setReviews(r.reviews);
    setReviewTotal(r.total);
    setMyReview(mine);
  }, []);

  const hasReviewed = Boolean(myReview);

  const openRatingDialog = (stars: number) => {
    if (!getDownloadAuth()) {
      toast({
        title: "Sign in to rate",
        description: "Use Sign in to install above, then leave a review.",
      });
      return;
    }
    if (hasReviewed) return;
    setDraftStars(stars);
    setRatingText("");
    setRatingAgreed(false);
    setRatingOpen(true);
  };

  const closeRatingDialog = () => {
    setRatingOpen(false);
    setDraftStars(0);
    setRatingText("");
    setRatingAgreed(false);
  };

  useEffect(() => {
    refresh().catch(() => {});
    const id = window.setInterval(() => refresh().catch(() => {}), 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const loadModalReviews = useCallback(async () => {
    const data = await fetchDownloadReviews({
      limit: 100,
      offset: 0,
      filter,
      search,
    });
    setModalReviews(data.reviews);
    setModalTotal(data.total);
    setStats(data.stats);
  }, [filter, search]);

  useEffect(() => {
    if (allReviewsOpen) loadModalReviews().catch(() => {});
  }, [allReviewsOpen, loadModalReviews]);

  const handlePostReview = async () => {
    if (draftStars < 1) return;
    setPosting(true);
    try {
      const { review, stats: newStats } = await postDownloadReview(draftStars, ratingText);
      setStats(newStats);
      setMyReview(review);
      closeRatingDialog();
      await refresh();
      toast({ title: "Review posted", description: "Thank you for your feedback." });
    } catch (err) {
      toast({
        title: "Could not post review",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const avg = stats?.averageRating ?? 0;
  const reviewCount = stats?.reviewCount ?? 0;
  const downloads = stats?.downloadCount ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 pb-16">
      {/* Hero — Play Store style */}
      <section className="pt-4 pb-8 border-b border-white/6">
        <div className="flex gap-5">
          <img
            src={DOWNLOAD_APP.icon}
            alt=""
            className="h-[86px] w-[86px] rounded-[22px] border border-white/10 shadow-lg shrink-0"
            draggable={false}
          />
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className="md:hidden">{DOWNLOAD_APP.name}</span>
              <span className="hidden md:inline">{DOWNLOAD_APP.fullName}</span>
            </h1>
            <p className="text-emerald-400/90 text-[14px] mt-0.5">{DOWNLOAD_APP.developer}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {DOWNLOAD_APP.heroTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[12px] text-white/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold tabular-nums">{avg.toFixed(1)}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{formatCount(reviewCount)} reviews</p>
          </div>
          <div className="border-x border-white/8">
            <p className="text-lg font-semibold">{formatCount(downloads)}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Downloads</p>
          </div>
          <div>
            <p className="text-lg font-semibold">Everyone</p>
            <p className="text-[11px] text-white/40 mt-0.5">Rated</p>
          </div>
        </div>

        <InstallActionBar onStatsChange={setStats} />

        {!getDownloadAuth() && (
          <p className="mt-4 text-[12px] text-white/35 text-center">
            Sign in with Google to download. Reviews also require sign-in.
          </p>
        )}
      </section>

      {/* Rate CTA + live ratings summary */}
      <section className="py-6 border-b border-white/6">
        <div className="max-md:text-center">
          <p className="text-[15px] font-medium">Rate this app</p>
          <p className="text-[13px] text-white/45 mt-1">
            {hasReviewed ? "Your rating" : "Tell others what you think"}
          </p>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div
            className="min-w-0 max-md:flex max-md:justify-center"
            onClick={() => !hasReviewed && openRatingDialog(0)}
            role={hasReviewed ? undefined : "button"}
            tabIndex={hasReviewed ? undefined : 0}
            onKeyDown={(e) => !hasReviewed && e.key === "Enter" && openRatingDialog(0)}
          >
            <InteractiveStars
              value={hasReviewed ? (myReview?.stars ?? 0) : 0}
              readOnly={hasReviewed}
              onChange={hasReviewed ? undefined : (n) => openRatingDialog(n)}
            />
          </div>
          <RatingsSummaryPanel stats={stats ?? EMPTY_DOWNLOAD_STATS} />
        </div>
      </section>

      {/* Screenshots */}
      <section className="relative py-6 border-b border-white/6">
        <ScreenshotCarousel />
      </section>

      {/* About */}
      <section className="py-4 border-b border-white/6">
        <button
          type="button"
          className="w-full flex items-center justify-between py-2 text-left"
          onClick={() => setAboutOpen((v) => !v)}
        >
          <span className="font-medium">About this app</span>
          <ChevronDown className={`h-5 w-5 text-white/40 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
        </button>
        <p className="text-[14px] text-white/55 leading-relaxed text-justify w-full">{DOWNLOAD_APP.shortAbout}</p>
        <AnimatePresence>
          {aboutOpen && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-[14px] text-white/50 leading-relaxed mt-4 overflow-hidden whitespace-pre-wrap text-justify w-full"
            >
              {DOWNLOAD_APP.fullAbout}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap gap-2 mt-4">
          {DOWNLOAD_APP.categories.map((c) => (
            <span key={c} className="rounded-full border border-white/12 px-3 py-1 text-[12px] text-white/50">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Data safety */}
      <section className="py-4 border-b border-white/6">
        <button
          type="button"
          className="w-full flex items-center justify-between py-2 text-left"
          onClick={() => setSafetyOpen((v) => !v)}
        >
          <span className="font-medium">Data safety</span>
          <ChevronRight className={`h-5 w-5 text-white/40 transition-transform ${safetyOpen ? "rotate-90" : ""}`} />
        </button>
        <AnimatePresence>
          {safetyOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[14px] text-white/50 leading-relaxed mt-2 whitespace-pre-wrap text-justify w-full"
            >
              {DOWNLOAD_APP.dataSafety}
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      {/* Recent reviews */}
      <section className="py-4">
        <h3 className="font-medium mb-2">Recent ratings</h3>
        {reviews.length === 0 ? (
          <p className="text-[14px] text-white/40 py-6">No reviews yet. Be the first to rate Solid One.</p>
        ) : (
          reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onHelpful={async (id, helpful) => {
                try {
                  await voteReviewHelpful(id, helpful);
                  await refresh();
                } catch (err) {
                  toast({
                    title: "Could not vote",
                    description: err instanceof Error ? err.message : "",
                    variant: "destructive",
                  });
                }
              }}
              onFlag={async (id, reason) => {
                try {
                  const s = await flagDownloadReview(id, reason);
                  setStats(s);
                  await refresh();
                  toast({ title: "Review flagged" });
                } catch {
                  toast({ title: "Could not flag", variant: "destructive" });
                }
              }}
            />
          ))
        )}
        {reviewTotal > 5 && (
          <Button
            variant="outline"
            className="w-full mt-4 rounded-full border-white/15 bg-transparent hover:bg-white/5"
            onClick={() => setAllReviewsOpen(true)}
          >
            View all {reviewTotal} reviews
          </Button>
        )}
      </section>


      {/* Rating dialog */}
      <Dialog
        open={ratingOpen}
        onOpenChange={(open) => {
          if (!open) closeRatingDialog();
          else setRatingOpen(true);
        }}
      >
        <DialogContent
          className="max-w-md gap-2 bg-[#111] border-white/10 text-white sm:top-[50%] top-[auto] bottom-0 sm:bottom-auto sm:translate-y-[-50%] translate-y-0 rounded-t-2xl sm:rounded-lg max-h-[92dvh]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-3 mb-1">
              <img src={DOWNLOAD_APP.icon} alt="" className="h-11 w-11 rounded-xl" />
              <div>
                <DialogTitle className="text-left text-base sm:text-lg">{DOWNLOAD_APP.shortName}</DialogTitle>
                <p className="text-[13px] text-white/50">Rate this application</p>
              </div>
            </div>
          </DialogHeader>

          {auth ? (
            <div className="flex items-center gap-3 py-2 border-y border-white/8">
              <UserAvatar name={auth.user.name} picture={auth.user.picture} />
              <p className="text-[14px] font-medium">{auth.user.name}</p>
            </div>
          ) : (
            <div className="py-3 border-y border-white/8">
              <p className="text-[13px] text-white/50 mb-3 text-center">Sign in to post a review</p>
              <GoogleSignInButton />
            </div>
          )}

          <p className="text-[12px] text-white/45 leading-relaxed mt-1">
            Reviews are public and include your Google account name and profile photo.
          </p>

          <div className="py-2">
            <InteractiveStars value={draftStars} onChange={setDraftStars} />
          </div>

          <label className="block text-[13px] text-white/50 mb-1.5 mt-0.5">
            Describe your experience (optional)
          </label>
          <textarea
            className="w-full min-h-[100px] rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            maxLength={500}
            value={ratingText}
            onChange={(e) => setRatingText(e.target.value)}
            placeholder="Share what you liked or what could improve…"
          />
          <p className="text-[11px] text-white/35 text-right mt-1">{ratingText.length}/500</p>

          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              id="agree"
              checked={ratingAgreed}
              onCheckedChange={(v) => setRatingAgreed(v === true)}
            />
            <label htmlFor="agree" className="text-[12px] text-white/45 cursor-pointer">
              I confirm this review reflects my own experience
            </label>
          </div>

          <Button
            className="w-full mt-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
            disabled={draftStars < 1 || !ratingAgreed || posting}
            onClick={handlePostReview}
          >
            {posting ? "Posting…" : "Post"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* All reviews modal */}
      <Dialog open={allReviewsOpen} onOpenChange={setAllReviewsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-[#111] border-white/10 text-white">
          <DialogHeader className="shrink-0">
            <div className="flex items-center gap-3">
              <img src={DOWNLOAD_APP.icon} alt="" className="h-9 w-9 rounded-lg" />
              <div>
                <DialogTitle>{DOWNLOAD_APP.name}</DialogTitle>
                <p className="text-[12px] text-white/45">Ratings and reviews</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
                <input
                  className="w-full h-10 pl-9 pr-3 rounded-full bg-white/5 border border-white/10 text-[13px]"
                  placeholder="Search reviews"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-[120px] rounded-full border-white/10 bg-white/5 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-2 pr-1">
            {modalReviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onHelpful={async (id, helpful) => {
                  await voteReviewHelpful(id, helpful);
                  await loadModalReviews();
                }}
                onFlag={async (id, reason) => {
                  await flagDownloadReview(id, reason);
                  await loadModalReviews();
                }}
              />
            ))}
            {modalReviews.length === 0 && (
              <p className="text-center text-white/40 py-8">No reviews match your filters.</p>
            )}
          </div>
          <p className="text-[11px] text-white/35 text-center py-2 shrink-0">
            Showing {modalReviews.length} of {modalTotal}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
