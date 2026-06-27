import { useEffect, useRef, useState } from "react";
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

type GoogleSignInButtonProps = {
  onSignedIn?: () => void;
  width?: number;
};

export function GoogleSignInButton({ onSignedIn, width = 280 }: GoogleSignInButtonProps) {
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
              onSignedIn?.();
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
          theme: "filled_black",
          size: "large",
          width,
          text: "signin_with",
          shape: "pill",
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
  }, [onSignedIn, toast, width]);

  if (!CLIENT_ID) {
    return (
      <p className="text-[13px] text-white/50 text-center px-2">
        Sign-in is temporarily unavailable.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={btnRef} className={loading ? "opacity-50 pointer-events-none" : ""} />
      {loading && <p className="text-[12px] text-white/45">Signing you in…</p>}
    </div>
  );
}
