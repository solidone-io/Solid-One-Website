import { useCallback, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminInstalls, type InstallRecord } from "@/lib/admin-download-api";
import { useRealtimePoll } from "@/hooks/use-realtime-poll";
import { useToast } from "@/hooks/use-toast";

type AdminInstallsProps = {
  token: string;
  onStats?: (count: number) => void;
};

function fmtWhen(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function UserCell({ row }: { row: InstallRecord }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="flex items-center gap-3 min-w-0">
      {row.picture && !imgFailed ? (
        <img
          src={row.picture}
          alt=""
          referrerPolicy="no-referrer"
          className="h-9 w-9 rounded-full object-cover shrink-0 border border-white/10"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
          {(row.name || "?").charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{row.name || "Unknown user"}</div>
        <div className="text-[11px] text-white/40 font-mono truncate">{row.googleSub.slice(0, 12)}…</div>
      </div>
    </div>
  );
}

export function AdminInstalls({ token, onStats }: AdminInstallsProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<InstallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const { installs } = await fetchAdminInstalls(token);
      setRows(installs);
      onStats?.(installs.length);
      setLastUpdated(new Date());
    } catch (err) {
      toast({
        title: "Could not load installs",
        description: err instanceof Error ? err.message : "Failed to load.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, onStats, toast]);

  useRealtimePoll(load, Boolean(token), 10000);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" />
            <h2 className="text-[15px] font-semibold">APK installs</h2>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              {rows.length} genuine
            </span>
          </div>
          <p className="text-[12px] text-white/40 mt-1">
            Each row is a unique Google account that tapped Install on the download page.
            {lastUpdated ? ` Updated ${lastUpdated.toLocaleTimeString()}.` : ""}
          </p>
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
        <p className="text-white/40 text-sm py-8 text-center">Loading installs…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-white/50 text-sm">No installs recorded yet.</p>
          <p className="text-white/30 text-xs mt-1">They appear when someone signs in with Google and taps Install.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0a0a0a]/50">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">User</TableHead>
                <TableHead className="text-white/50">Gmail</TableHead>
                <TableHead className="text-white/50">Installed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.googleSub} className="border-white/8 hover:bg-white/[0.02]">
                  <TableCell>
                    <UserCell row={row} />
                  </TableCell>
                  <TableCell className="font-mono text-sm text-emerald-300/90">
                    {row.email || <span className="text-white/30">No email on token</span>}
                  </TableCell>
                  <TableCell className="text-white/50 text-sm whitespace-nowrap">{fmtWhen(row.installedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
