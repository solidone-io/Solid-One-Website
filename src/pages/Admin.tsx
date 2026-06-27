import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Download,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  Radio,
  Star,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminBlog } from "@/components/AdminBlog";
import { AdminInstalls } from "@/components/AdminInstalls";
import { AdminRatings } from "@/components/AdminRatings";
import { AdminStoreNotify } from "@/components/AdminStoreNotify";
import { AdminSupport } from "@/components/AdminSupport";
import { useRealtimePoll } from "@/hooks/use-realtime-poll";
import {
  ADMIN_TOKEN_KEY,
  adminLogin,
  deleteSubscriber,
  fetchSubscribers,
  type SubscriberRow,
} from "@/lib/subscribers-api";
import { useToast } from "@/hooks/use-toast";

function MetricPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "emerald" | "amber" | "violet";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
      : tone === "amber"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
        : tone === "violet"
          ? "border-violet-500/25 bg-violet-500/10 text-violet-200"
          : "border-white/10 bg-white/[0.04] text-white/80";
  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <div className="text-[10px] font-mono uppercase tracking-[0.16em] opacity-70">{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(ADMIN_TOKEN_KEY));

  useEffect(() => {
    document.title = "Solid One Admin";
    const robots = document.querySelector('meta[name="robots"]');
    const previous = robots?.getAttribute("content") ?? null;
    robots?.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = "Solid One: One App. Infinity possibilities.";
      if (robots) {
        if (previous) robots.setAttribute("content", previous);
        else robots.removeAttribute("content");
      }
    };
  }, []);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [installCount, setInstallCount] = useState(0);
  const [ratingAvg, setRatingAvg] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  const loadSubscribers = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      setRows(await fetchSubscribers(authToken));
    } catch (err) {
      toast({
        title: "Could not load subscribers",
        description: err instanceof Error ? err.message : "Failed to load.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useRealtimePoll(
    () => {
      if (token) void loadSubscribers(token);
    },
    Boolean(token),
    15000,
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const t = await adminLogin(password);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, t);
      setToken(t);
      setPassword("");
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid password.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setRows([]);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteSubscriber(token, id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Removed", description: "Subscriber deleted." });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not delete.",
        variant: "destructive",
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm border border-white/10 bg-[#0a0a0a] rounded-2xl p-8 shadow-2xl">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
            <LayoutDashboard className="h-5 w-5 text-white/70" />
          </div>
          <h1 className="font-display text-2xl tracking-wide mb-2">Solid One Admin</h1>
          <p className="text-white/40 text-sm mb-6 font-light">Website data, installs, ratings, and content</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#111] border-white/10 text-white h-11"
            />
            <Button type="submit" disabled={loginLoading} className="w-full bg-white text-black hover:bg-white/90 h-11">
              {loginLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <Link href="/" className="block text-center text-[13px] text-white/40 hover:text-white mt-6">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050505]/95 backdrop-blur-md px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg tracking-wide">Admin</h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <Radio className="h-3 w-3 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-[12px] text-white/40 font-light mt-0.5">Auto-refreshes every 10–15 seconds</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-white/15 text-white/70">
            Log out
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-white/15 text-white/70">
              Site
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <MetricPill label="Newsletter" value={rows.length} tone="violet" />
          <MetricPill label="APK installs" value={installCount} tone="emerald" />
          <MetricPill label="Avg rating" value={ratingCount ? ratingAvg.toFixed(1) : "—"} tone="amber" />
          <MetricPill label="Reviews" value={ratingCount} />
        </div>

        <Tabs defaultValue="installs" className="w-full">
          <TabsList className="bg-white/[0.03] border border-white/10 mb-6 h-auto flex-wrap justify-start gap-1 p-1.5">
            <TabsTrigger value="installs" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-black text-white/60">
              <Download className="h-3.5 w-3.5" />
              Installs
            </TabsTrigger>
            <TabsTrigger value="ratings" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-black text-white/60">
              <Star className="h-3.5 w-3.5" />
              Ratings
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-black text-white/60">
              <Mail className="h-3.5 w-3.5" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="store-notify" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-black text-white/60">
              <Store className="h-3.5 w-3.5" />
              Store notify
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-black text-white/60">
              <MessageSquare className="h-3.5 w-3.5" />
              Support
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-black text-white/60">
              <Newspaper className="h-3.5 w-3.5" />
              Blog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installs">
            <AdminInstalls token={token} onStats={setInstallCount} />
          </TabsContent>

          <TabsContent value="ratings">
            <AdminRatings
              token={token}
              onStats={(avg, count) => {
                setRatingAvg(avg);
                setRatingCount(count);
              }}
            />
          </TabsContent>

          <TabsContent value="subscribers">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-white/40">{rows.length} newsletter subscribers</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSubscribers(token)}
                disabled={loading}
                className="border-white/15 text-white/70"
              >
                Refresh
              </Button>
            </div>
            {loading && rows.length === 0 ? (
              <p className="text-white/40 text-sm">Loading...</p>
            ) : rows.length === 0 ? (
              <p className="text-white/40 text-sm">No subscribers yet.</p>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0a0a0a]/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/50">Email</TableHead>
                      <TableHead className="text-white/50">Subscribed</TableHead>
                      <TableHead className="text-white/50 w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} className="border-white/8">
                        <TableCell className="font-mono text-sm">{row.email}</TableCell>
                        <TableCell className="text-white/50 text-sm">
                          {new Date(row.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(row.id)}
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
          </TabsContent>

          <TabsContent value="store-notify">
            <AdminStoreNotify token={token} />
          </TabsContent>

          <TabsContent value="support">
            <AdminSupport token={token} />
          </TabsContent>

          <TabsContent value="blog">
            <AdminBlog token={token} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
