import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitSupportRequest } from "@/lib/support-api";
import { useToast } from "@/hooks/use-toast";

const labelClass = "block text-[12px] font-mono uppercase tracking-[0.12em] text-white/40 mb-2";
const star = <span className="text-amber-300/90 ml-0.5">*</span>;

export function SupportForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await submitSupportRequest({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      toast({ title: "Message sent", description: result.message });
    } catch (err) {
      toast({
        title: "Could not send",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/12 bg-white/[0.04] px-6 py-8 text-center">
        <p className="text-[15px] font-semibold text-white mb-2">Thank you for reaching out</p>
        <p className="text-[13px] text-white/50 leading-relaxed">
          We have received your message and will respond to your email as soon as possible.
        </p>
      </div>
    );
  }

  const fieldClass = "bg-[#111] border-white/12 text-white placeholder:text-white/35";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="support-name" className={labelClass}>
            Name{star}
          </label>
          <Input
            id="support-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            maxLength={120}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="support-email" className={labelClass}>
            Email{star}
          </label>
          <Input
            id="support-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="support-subject" className={labelClass}>
          Subject
        </label>
        <Input
          id="support-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={loading}
          maxLength={200}
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="support-message" className={labelClass}>
          Message{star}
        </label>
        <Textarea
          id="support-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          required
          maxLength={5000}
          rows={6}
          className={`${fieldClass} resize-y min-h-[140px]`}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto h-10 rounded-[9px] bg-white text-black hover:bg-white/90 px-8 font-semibold"
      >
        {loading ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
