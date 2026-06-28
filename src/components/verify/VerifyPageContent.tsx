import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Globe,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { verifyChannel, type VerifiedChannel, type VerifyResult } from "@/lib/verify-api";

const VERIFY_WARNING_KEY = "solidone.verify.warning.v1";

const SAFETY_WARNINGS = [
  "Solid One will never ask for your seed phrase, private keys, or wallet recovery words in chat, email, or social DMs.",
  "We will never ask you to send crypto, SOL, USDC, or any payment to verify your account or unlock a feature.",
  "Official support is only through verified channels you confirm on this page. Impersonators often use look alike handles.",
  "If someone pressures you to act quickly, offers guaranteed returns, or requests remote access to your phone, stop and verify here.",
];

function kindIcon(kind: VerifiedChannel["kind"]) {
  if (kind === "x") return FaXTwitter;
  if (kind === "telegram") return FaTelegram;
  if (kind === "email") return Mail;
  return Globe;
}

function handleLabel(channel: VerifiedChannel): string {
  if (channel.kind === "x") return `@${channel.handle}`;
  if (channel.kind === "email") return channel.handle;
  if (channel.kind === "domain") return channel.handle;
  return `@${channel.handle}`;
}

function ChannelAvatar({ channel }: { channel: VerifiedChannel }) {
  const [failed, setFailed] = useState(false);
  const Icon = kindIcon(channel.kind);
  const showImage = Boolean(channel.avatarUrl) && !failed;

  return (
    <div className="relative shrink-0">
      {showImage ? (
        <img
          src={channel.avatarUrl!}
          alt=""
          className="h-16 w-16 rounded-full object-cover border border-white/20 bg-white/5"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="h-16 w-16 rounded-full border border-white/15 bg-white/[0.04] flex items-center justify-center">
          <Icon className="h-7 w-7 text-white/55" />
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black ring-2 ring-[#050505]">
        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
      </span>
    </div>
  );
}

function RoleBadge({ role }: { role: VerifiedChannel["role"] }) {
  const isOfficial = role === "official";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
        isOfficial ? "border-white/25 text-white/75 bg-white/[0.06]" : "border-white/15 text-white/55 bg-white/[0.03]"
      }`}
    >
      {isOfficial ? "Official" : "Founding team"}
    </span>
  );
}

function ChannelProfileCard({ channel }: { channel: VerifiedChannel }) {
  const Icon = kindIcon(channel.kind);
  const external = channel.kind !== "email";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/12 bg-black/40 backdrop-blur-md p-5 md:p-6"
    >
      <div className="flex items-start gap-4">
        <ChannelAvatar channel={channel} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-[16px] truncate">{channel.displayName}</p>
            <RoleBadge role={channel.role} />
          </div>
          <p className="text-[13px] text-white/70 font-medium truncate">{handleLabel(channel)}</p>
          {channel.subtitle ? (
            <p className="mt-2 text-[13px] text-white/45 leading-relaxed">{channel.subtitle}</p>
          ) : null}
          <a
            href={channel.url}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
            Open verified channel
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function VerifyResultPanel({ result }: { result: VerifyResult }) {
  if (!result.query) return null;

  if (!result.verified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-md p-5 md:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-300" />
          </div>
          <div>
            <p className="font-semibold text-red-100">Not verified</p>
            <p className="mt-1.5 text-[13px] text-white/55 leading-relaxed">{result.message}</p>
            <p className="mt-3 text-[11px] text-white/30 font-mono break-all">{result.query}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center gap-2 text-white/80">
        <ShieldCheck className="h-4 w-4" />
        <span className="text-[12px] font-medium uppercase tracking-[0.14em]">Verified channel</span>
      </div>
      <ChannelProfileCard channel={result.channel} />
    </motion.div>
  );
}

function VerifyWarningDialog({ open, onContinue }: { open: boolean; onContinue: () => void }) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md border-white/12 bg-[#0a0a0a] text-white sm:rounded-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <ShieldAlert className="h-5 w-5 text-amber-200" />
          </div>
          <DialogTitle className="text-center text-lg">Stay safe before you verify</DialogTitle>
          <DialogDescription className="text-center text-white/45 text-[13px] leading-relaxed pt-1">
            Read this carefully. Scammers impersonate crypto teams every day.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 text-[13px] text-white/60 leading-relaxed list-disc pl-4 marker:text-white/25">
          {SAFETY_WARNINGS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <DialogFooter className="sm:justify-center pt-2">
          <Button
            type="button"
            className="w-full rounded-full bg-white text-black hover:bg-white/90 font-semibold h-11"
            onClick={onContinue}
          >
            I understand, continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VerifyPageContent() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [warningOpen, setWarningOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(VERIFY_WARNING_KEY);
      if (!seen) setWarningOpen(true);
    } catch {
      setWarningOpen(true);
    }
  }, []);

  const dismissWarning = () => {
    try {
      sessionStorage.setItem(VERIFY_WARNING_KEY, "1");
    } catch {
      /* ignore */
    }
    setWarningOpen(false);
  };

  const runVerify = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResult(null);
      return;
    }
    setSearching(true);
    try {
      const next = await verifyChannel(trimmed);
      setResult(next);
    } catch {
      setResult({
        verified: false,
        query: trimmed,
        message: "Could not verify right now. Only trust channels that return verified on this page.",
      });
    } finally {
      setSearching(false);
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runVerify(query);
  };

  return (
    <>
      <VerifyWarningDialog open={warningOpen} onContinue={dismissWarning} />

      <div className="w-full max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-[clamp(1.125rem,3.2vw,2rem)] font-semibold tracking-tight leading-tight whitespace-nowrap">
          Solid One Official Verification Channel
        </h1>
        <p className="mt-4 text-[14px] md:text-[15px] text-white/45 leading-relaxed max-w-md mx-auto">
          Check whether a social media account, email, or domain is an official Solid One channel. Protect
          yourself against phishing and fraud.
        </p>

        <form onSubmit={onSubmit} className="relative mt-8 md:mt-10 max-w-xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/25 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="X, Telegram, email, or domain"
            className="h-[60px] md:h-[64px] pl-12 pr-[6.5rem] rounded-full border-white/10 bg-white/[0.04] text-[15px] md:text-[16px] placeholder:text-white/28 focus-visible:ring-white/20 focus-visible:border-white/20"
          />
          <Button
            type="submit"
            disabled={searching || !query.trim() || warningOpen}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white text-black hover:bg-white/90 font-semibold h-11 md:h-12 px-6 text-[14px]"
          >
            {searching ? "…" : "Verify"}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={result.query + String(result.verified)}
              className="mt-8 text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <VerifyResultPanel result={result} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
