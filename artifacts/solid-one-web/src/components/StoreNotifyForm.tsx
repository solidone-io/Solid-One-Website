import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitStoreNotify, type StorePlatform } from "@/lib/store-notify-api";
import { useToast } from "@/hooks/use-toast";

type StoreNotifyFormProps = {
  platform: StorePlatform;
  storeName: string;
};

export function StoreNotifyForm({ platform, storeName }: StoreNotifyFormProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) {
      toast({
        title: "Email required",
        description: "Enter your email to get notified.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await submitStoreNotify(address, platform);
      setSubmitted(true);
      toast({ title: "You're on the list", description: result.message });
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto rounded-xl border border-white/12 bg-white/[0.04] px-5 py-6 text-center">
        <p className="text-[14px] font-semibold text-white mb-1">You are on the notify list</p>
        <p className="text-[13px] text-white/50 leading-relaxed">
          We will email you when Solid One is available on the {storeName}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto text-center">
      <p className="text-[13px] text-white/45 mb-4">
        Get notified when the app is live on the {storeName}.
      </p>
      <div className="flex flex-row items-center gap-2">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="h-10 min-w-0 flex-1 bg-[#111] border-white/12 text-white placeholder:text-white/35"
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-10 shrink-0 rounded-[9px] bg-white text-black hover:bg-white/90 px-5 font-semibold whitespace-nowrap"
        >
          {loading ? "Saving..." : "Notify me"}
        </Button>
      </div>
    </form>
  );
}
