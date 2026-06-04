import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DOWNLOAD_APP } from "@/content/download-app";
import { googleAuthDownload } from "@/lib/download-api";
import { setDownloadAuth } from "@/lib/download-auth";
import { useToast } from "@/hooks/use-toast";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function pictureFromCredential(credential: string): string {
  try {
    const part = credential.split(".")[1];
    if (!part) return "";
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { picture?: string };
    return payload.picture ?? "";
  } catch {
    return "";
  }
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(s);
  });
}

type GoogleSignInGateProps = {
  onSignedIn: () => void;
};

export function GoogleSignInGate({ onSignedIn }: GoogleSignInGateProps) {
  const { toast } = useToast();
  const btnRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !btnRef.current) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !btnRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          use_fedcm_for_prompt: false,
          callback: async (response) => {
            setLoading(true);
            try {
              const { token, user } = await googleAuthDownload(response.credential);
              const picture = user.picture || pictureFromCredential(response.credential);
              setDownloadAuth({ token, user: { ...user, picture } });
              onSignedIn();
            } catch (err) {
              toast({
                title: "Sign-in failed",
                description: err instanceof Error ? err.message : "Please try again.",
                variant: "destructive",
              });
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 300,
          text: "continue_with",
          shape: "rectangular",
        });
      })
      .catch(() => {
        toast({
          title: "Sign-in unavailable",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [onSignedIn, toast]);

  return (
    <div className="fixed inset-0 z-[70] flex min-h-screen items-center justify-center bg-black px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px] rounded-none border border-white/10 bg-[#0a0a0a] p-8 text-center"
      >
        <img
          src={DOWNLOAD_APP.icon}
          alt=""
          className="mx-auto h-16 w-16 rounded-2xl border border-white/10 mb-5"
          draggable={false}
        />
        <p className="text-[13px] text-emerald-400/90 font-medium tracking-wide mb-1">{DOWNLOAD_APP.shortName}</p>
        <h1 className="font-display text-2xl tracking-tight text-white mb-2">Sign in to continue</h1>
        <p className="text-[14px] text-white/55 leading-relaxed mb-8">
          Sign in with Google to access Solid One.
        </p>

        {!CLIENT_ID ? (
          <p className="text-[14px] text-white/50 border border-white/10 bg-white/[0.03] px-4 py-3">
            Sign in is temporarily unavailable. Please try again later.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div ref={btnRef} className={loading ? "opacity-50 pointer-events-none" : ""} />
            {loading && <p className="text-[12px] text-white/45">Signing you in…</p>}
          </div>
        )}

        <p className="mt-8 text-[11px] text-white/35 leading-relaxed">
          We only use your Google account to verify identity purposes. Your data are never shared with anybody.
        </p>
      </motion.div>
    </div>
  );
}
