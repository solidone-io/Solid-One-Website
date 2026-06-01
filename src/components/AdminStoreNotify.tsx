import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteStoreNotifySignup,
  fetchStoreNotifySignups,
  storePlatformLabel,
  type StoreNotifyRow,
} from "@/lib/store-notify-api";
import { useToast } from "@/hooks/use-toast";

type AdminStoreNotifyProps = { token: string };

export function AdminStoreNotify({ token }: AdminStoreNotifyProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<StoreNotifyRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchStoreNotifySignups(token));
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

  const handleDelete = async (id: number) => {
    try {
      await deleteStoreNotifySignup(token, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Removed", description: "Signup deleted." });
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
        <p className="text-[13px] text-white/40 font-light">{rows.length} store notify signups</p>
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
        <p className="text-white/40 text-sm">No signups yet.</p>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">Email</TableHead>
                <TableHead className="text-white/50">Store</TableHead>
                <TableHead className="text-white/50">Submitted</TableHead>
                <TableHead className="text-white/50 w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="border-white/8">
                  <TableCell className="font-mono text-sm">{row.email}</TableCell>
                  <TableCell className="text-white/70 text-sm">{storePlatformLabel(row.platform)}</TableCell>
                  <TableCell className="text-white/50 text-sm">
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDelete(row.id)}
                      className="text-white/40 hover:text-red-400 hover:bg-red-400/10"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
