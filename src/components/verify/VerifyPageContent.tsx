import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Globe,
  Mail,
  Search,
  ShieldCheck,
} from "lucide-react";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchOfficialChannelLists,
  verifyChannel,
  type VerifiedChannel,
  type VerifyResult,
} from "@/lib/verify-api";

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
          className="h-14 w-14 rounded-full object-cover border-2 border-emerald-500/40 bg-white/5"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="h-14 w-14 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center">
          <Icon className="h-6 w-6 text-white/60" />
        </div>
      )}
      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black ring-2 ring-[#0a0a0a]">
        <BadgeCheck className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );
}

function RoleBadge({ role }: { role: VerifiedChannel["role"] }) {
  const isOfficial = role === "official";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        isOfficial
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
          : "bg-amber-500/10 text-amber-200 border border-amber-500/20"
      }`}
    >
      {isOfficial ? "Official" : "Founding team"}
    </span>
  );
}

export function ChannelProfileCard({
  channel,
  compact = false,
}: {
  channel: VerifiedChannel;
  compact?: boolean;
}) {
  const Icon = kindIcon(channel.kind);
  const external = channel.kind !== "email";

  return (
    <motion.a
      href={channel.url}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group block rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 transition-colors hover:border-emerald-500/30 hover:bg-white/[0.07] ${
        compact ? "" : "md:p-5"
      }`}
    >
      <div className="flex items-start gap-4">
        <ChannelAvatar channel={channel} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-[15px] truncate">{channel.displayName}</p>
            <RoleBadge role={channel.role} />
          </div>
          <p className="text-[13px] text-emerald-400/90 font-medium truncate">{handleLabel(channel)}</p>
          {channel.subtitle ? (
            <p className="mt-2 text-[12px] text-white/45 leading-relaxed line-clamp-2">{channel.subtitle}</p>
          ) : null}
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-white/35">
            <Icon className="h-3.5 w-3.5" />
            <span className="group-hover:text-white/55 transition-colors">Verified channel</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

function VerifyResultPanel({ result }: { result: VerifyResult }) {
  if (!result.query) return null;

  if (!result.verified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5 md:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-5 w-5 text-red-300" />
          </div>
          <div>
            <p className="font-semibold text-red-200">Not verified</p>
            <p className="mt-1 text-[13px] text-white/55 leading-relaxed">{result.message}</p>
            <p className="mt-3 text-[12px] text-white/35 font-mono break-all">Query: {result.query}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-3 flex items-center gap-2 text-emerald-300">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-[13px] font-semibold uppercase tracking-wider">Verified official channel</span>
      </div>
      <ChannelProfileCard channel={result.channel} />
    </motion.div>
  );
}

export function VerifyPageContent() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [official, setOfficial] = useState<VerifiedChannel[]>([]);
  const [foundingTeam, setFoundingTeam] = useState<VerifiedChannel[]>([]);

  useEffect(() => {
    fetchOfficialChannelLists()
      .then(({ official: o, foundingTeam: f }) => {
        setOfficial(o);
        setFoundingTeam(f);
      })
      .catch(() => {});
  }, []);

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
        message: "Could not verify right now. Compare against the official list below.",
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
    <div className="max-w-3xl mx-auto px-6 md:px-10 pb-16">
      <section className="text-center mb-10 md:mb-12">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Solid One Official Verification Channel
        </h1>
        <p className="mt-3 text-[15px] text-white/50 leading-relaxed max-w-xl mx-auto">
          Check whether a social media account, email, or domain is an official Solid One channel — protect
          yourself against phishing and fraud.
        </p>
      </section>

      <section className="mb-10">
        <form onSubmit={onSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="X handle, Telegram @username, email, or domain…"
            className="h-14 pl-12 pr-28 rounded-2xl border-white/12 bg-white/[0.04] text-[15px] placeholder:text-white/30 focus-visible:ring-emerald-500/40"
          />
          <Button
            type="submit"
            disabled={searching || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-10 px-5"
          >
            {searching ? "Checking…" : "Verify"}
          </Button>
        </form>
        <p className="mt-3 text-[12px] text-white/35 text-center">
          Try{" "}
          <button type="button" className="text-emerald-400/80 hover:text-emerald-300 underline-offset-2 hover:underline" onClick={() => { setQuery("@solidone_co"); void runVerify("@solidone_co"); }}>
            @solidone_co
          </button>
          ,{" "}
          <button type="button" className="text-emerald-400/80 hover:text-emerald-300 underline-offset-2 hover:underline" onClick={() => { setQuery("operations@solidone.io"); void runVerify("operations@solidone.io"); }}>
            operations@solidone.io
          </button>
          , or{" "}
          <button type="button" className="text-emerald-400/80 hover:text-emerald-300 underline-offset-2 hover:underline" onClick={() => { setQuery("@Soubhagyaweb3"); void runVerify("@Soubhagyaweb3"); }}>
            @Soubhagyaweb3
          </button>
        </p>
      </section>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.section key={result.query + String(result.verified)} className="mb-12" layout>
            <VerifyResultPanel result={result} />
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-1">Official channels</h2>
        <p className="text-[13px] text-white/45 mb-5">Company accounts, email, website, and community group.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {official.map((channel) => (
            <ChannelProfileCard key={channel.id} channel={channel} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">Founding team</h2>
        <p className="text-[13px] text-white/45 mb-5">
          Verified founding team members on X and Telegram. Always cross-check here before trusting DMs.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {foundingTeam.map((channel) => (
            <ChannelProfileCard key={channel.id} channel={channel} />
          ))}
        </div>
      </section>
    </div>
  );
}
