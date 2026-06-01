import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
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
import { AdminStoreNotify } from "@/components/AdminStoreNotify";
import { AdminSupport } from "@/components/AdminSupport";
import {
  ADMIN_TOKEN_KEY,
  adminLogin,
  deleteSubscriber,
  fetchSubscribers,
  type SubscriberRow,
} from "@/lib/subscribers-api";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(ADMIN_TOKEN_KEY));
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (token) loadSubscribers(token);
  }, [token, loadSubscribers]);

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
        <div className="w-full max-w-sm border border-white/10 bg-[#0a0a0a] rounded-2xl p-8">
          <h1 className="font-display text-2xl tracking-wide mb-2">Admin</h1>
          <p className="text-white/40 text-sm mb-6 font-light">Newsletter, blog, store notify, and support</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#111] border-white/10 text-white"
            />
            <Button type="submit" disabled={loginLoading} className="w-full bg-white text-black hover:bg-white/90">
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
      <header className="border-b border-white/8 px-6 md:px-10 py-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl tracking-wide">Admin panel</h1>
          <p className="text-[13px] text-white/40 font-light mt-1">Manage subscribers, blog, store signups, and support</p>
        </div>
        <div className="flex items-center gap-3">
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

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 mb-8 h-10 p-1">
            <TabsTrigger value="blog" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60">
              Blog
            </TabsTrigger>
            <TabsTrigger
              value="subscribers"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
            >
              Subscribers
            </TabsTrigger>
            <TabsTrigger
              value="store-notify"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
            >
              Store notify
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="data-[state=active]:bg-white data-[state=active]:text-black text-white/60"
            >
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blog">
            <AdminBlog token={token} />
          </TabsContent>

          <TabsContent value="subscribers">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] text-white/40 font-light">{rows.length} subscribers</p>
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
              <div className="rounded-xl border border-white/10 overflow-hidden">
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
        </Tabs>
      </main>
    </div>
  );
}
