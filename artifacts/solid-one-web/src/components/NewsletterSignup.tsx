import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeEmail } from "@/lib/subscribers-api";
import { useToast } from "@/hooks/use-toast";

const headingClass =
  "w-full max-md:text-center md:text-left text-[clamp(1.75rem,3.2vw,2.35rem)] font-semibold tracking-tight leading-tight bg-transparent outline-none";

export function NewsletterSignup() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const startEditing = () => {
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSubscribe = async () => {
    let address = email.trim();
    if (!address) {
      startEditing();
      return;
    }

    setLoading(true);
    try {
      const result = await subscribeEmail(address);
      toast({ title: "Subscribed", description: result.message });
      setEmail("");
      setEditing(false);
    } catch (err) {
      toast({
        title: "Could not subscribe",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-md:flex-1 max-md:ml-0 bg-[#ececee] rounded-2xl px-5 py-5 max-md:px-6 max-md:py-5 lg:px-10 lg:py-7 flex flex-col max-md:items-center sm:flex-row sm:items-center sm:justify-between gap-4 max-md:gap-3 sm:gap-5">
      <div className="min-w-0 flex-1 max-md:w-full max-md:flex max-md:flex-col max-md:items-center">
        {editing ? (
          <input
            ref={inputRef}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              if (!email.trim()) setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSubscribe();
              }
              if (e.key === "Escape") {
                setEditing(false);
                if (!email.trim()) setEmail("");
              }
            }}
            disabled={loading}
            placeholder="Enter your email"
            className={`${headingClass} text-black placeholder:text-black/35`}
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            disabled={loading}
            className={`${headingClass} text-black hover:text-black/70 transition-colors disabled:opacity-50`}
          >
            {email || "Enter your email"}
          </button>
        )}
        <p className="mt-2 text-[14px] text-black/55 font-light leading-relaxed max-w-md max-md:text-center">
          Subscribe for updates and join the Solid One community on Solana.
        </p>
      </div>
      <Button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="shrink-0 max-md:mx-auto rounded-xl bg-[#d8d8dc] text-black hover:bg-[#cacace] disabled:opacity-50 h-11 px-6 text-[14px] font-semibold border-0 shadow-none"
      >
        {loading ? "..." : "Subscribe"}
      </Button>
    </div>
  );
}
