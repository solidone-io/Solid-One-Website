import { useCallback, useState } from "react";
import { MessageSquare, RefreshCw, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAdminReviewReply,
  fetchAdminDownloadReviews,
  postAdminReviewReply,
  type AdminDownloadReview,
} from "@/lib/admin-download-api";
import { useRealtimePoll } from "@/hooks/use-realtime-poll";
import { useToast } from "@/hooks/use-toast";

type AdminRatingsProps = {
  token: string;
  onStats?: (avg: number, count: number) => void;
};

function StarDisplay({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-300">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < value ? "fill-current" : "text-white/15"}`} />
      ))}
    </span>
  );
}

function ReviewAdminCard({
  review,
  token,
  onUpdated,
}: {
  review: AdminDownloadReview;
  token: string;
  onUpdated: (r: AdminDownloadReview) => void;
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(review.adminReply?.text ?? "");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(!review.adminReply);

  const saveReply = async () => {
    const text = draft.trim();
    if (!text) {
      toast({ title: "Reply required", description: "Write a reply before saving.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const updated = await postAdminReviewReply(token, review.id, text);
      onUpdated(updated);
      setEditing(false);
      toast({ title: "Reply published", description: "Visible on the download page." });
    } catch (err) {
      toast({
        title: "Could not save reply",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeReply = async () => {
    setSaving(true);
    try {
      const updated = await deleteAdminReviewReply(token, review.id);
      onUpdated(updated);
      setDraft("");
      setEditing(true);
      toast({ title: "Reply removed" });
    } catch (err) {
      toast({
        title: "Could not remove reply",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-xl border border-white/10 bg-[#0a0a0a]/60 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {review.userPicture ? (
            <img
              src={review.userPicture}
              alt=""
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold shrink-0">
              {review.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-sm">{review.userName}</div>
            <div className="text-[12px] font-mono text-emerald-300/80 truncate">{review.userEmail || "No email"}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <StarDisplay value={review.stars} />
              <span className="text-[11px] text-white/35">{new Date(review.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="text-[11px] text-white/35">
          Helpful {review.helpfulYes} · Not {review.helpfulNo}
        </div>
      </div>

      {review.text ? (
        <p className="text-[14px] text-white/70 leading-relaxed border-l-2 border-white/10 pl-3">{review.text}</p>
      ) : (
        <p className="text-[13px] text-white/35 italic">No written feedback — rating only.</p>
      )}

      {review.adminReply && !editing ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-300/90">
              <MessageSquare className="h-3.5 w-3.5" />
              Your reply · {new Date(review.adminReply.repliedAt).toLocaleString()}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-white/50 hover:text-white"
                onClick={() => {
                  setDraft(review.adminReply?.text ?? "");
                  setEditing(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-red-300/80 hover:text-red-300"
                onClick={() => void removeReply()}
                disabled={saving}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-[14px] text-white/80 leading-relaxed whitespace-pre-wrap">{review.adminReply.text}</p>
        </div>
      ) : (
        <div className="space-y-2 pt-1 border-t border-white/8">
          <label className="text-[11px] font-mono uppercase tracking-wider text-white/40">Reply as Solid One</label>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Thank the user or address their feedback — shown publicly on the download page."
            className="min-h-[88px] bg-[#111] border-white/10 text-white resize-none"
            maxLength={1000}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-emerald-500 text-black hover:bg-emerald-400"
              onClick={() => void saveReply()}
              disabled={saving}
            >
              {saving ? "Saving…" : review.adminReply ? "Update reply" : "Publish reply"}
            </Button>
            {review.adminReply ? (
              <Button
                variant="outline"
                size="sm"
                className="border-white/15 text-white/60"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}

export function AdminRatings({ token, onStats }: AdminRatingsProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<AdminDownloadReview[]>([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { reviews, stats } = await fetchAdminDownloadReviews(token);
      setRows(reviews);
      setAvg(stats.averageRating);
      onStats?.(stats.averageRating, reviews.length);
    } catch (err) {
      toast({
        title: "Could not load ratings",
        description: err instanceof Error ? err.message : "Failed to load.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, onStats, toast]);

  useRealtimePoll(load, Boolean(token), 10000);

  const unanswered = rows.filter((r) => !r.adminReply).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <h2 className="text-[15px] font-semibold">Ratings & feedback</h2>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {avg.toFixed(1)} avg · {rows.length} reviews
            </span>
            {unanswered > 0 ? (
              <span className="text-[11px] text-white/50">{unanswered} awaiting reply</span>
            ) : null}
          </div>
          <p className="text-[12px] text-white/40 mt-1">Reply to reviews — your response appears on the public download page.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="border-white/15 text-white/70"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && rows.length === 0 ? (
        <p className="text-white/40 text-sm py-8 text-center">Loading ratings…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-white/50 text-sm">No ratings yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((review) => (
            <ReviewAdminCard
              key={review.id}
              review={review}
              token={token}
              onUpdated={(updated) => setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
