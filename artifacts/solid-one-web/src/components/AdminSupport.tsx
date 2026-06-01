import { Fragment, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";
import {
  deleteSupportRequest,
  fetchSupportRequests,
  toggleSupportRequestStar,
  type SupportRequestRow,
} from "@/lib/support-api";
import { useToast } from "@/hooks/use-toast";

type AdminSupportProps = { token: string };

export function AdminSupport({ token }: AdminSupportProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<SupportRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchSupportRequests(token));
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggleStar = async (id: number) => {
    try {
      const updated = await toggleSupportRequestStar(token, id);
      setRows((prev) => {
        const next = prev.map((r) => (r.id === id ? updated : r));
        return next.sort((a, b) => {
          if (a.starred !== b.starred) return a.starred ? -1 : 1;
          return b.createdAt.localeCompare(a.createdAt);
        });
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update star.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSupportRequest(token, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
      toast({ title: "Removed", description: "Support request deleted." });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not delete.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-white/40 font-light">{rows.length} support requests</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="border-white/15 text-white/70"
        >
          Refresh
        </Button>
      </div>
      {loading && rows.length === 0 ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-white/40 text-sm">No support requests yet.</p>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">From</TableHead>
                <TableHead className="text-white/50">Subject</TableHead>
                <TableHead className="text-white/50">Submitted</TableHead>
                <TableHead className="text-white/50 w-[140px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow className={`border-white/8 ${row.starred ? "bg-amber-400/[0.06]" : ""}`}>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => void handleToggleStar(row.id)}
                        className="p-1 rounded-md hover:bg-white/10 transition-colors"
                        aria-label={row.starred ? "Unmark as important" : "Mark as important"}
                        title={row.starred ? "Unmark important" : "Mark important"}
                      >
                        <Star
                          className={`h-4 w-4 ${row.starred ? "fill-amber-300 text-amber-300" : "text-white/30"}`}
                        />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-white flex items-center gap-1.5">
                        {row.name}
                        {row.starred && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80">
                            Important
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[12px] text-white/45">{row.email}</div>
                    </TableCell>
                    <TableCell className="text-white/70 text-sm max-w-[200px] truncate">
                      {row.subject.trim() || "—"}
                    </TableCell>
                    <TableCell className="text-white/50 text-sm whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                          className="text-white/40 hover:text-white"
                        >
                          {expandedId === row.id ? "Hide" : "View"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleDelete(row.id)}
                          className="text-white/40 hover:text-red-400 hover:bg-red-400/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === row.id && (
                    <TableRow className="border-white/8 bg-white/[0.02]">
                      <TableCell colSpan={5} className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap py-4">
                        {row.message}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
