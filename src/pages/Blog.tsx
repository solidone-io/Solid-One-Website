import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchPublicPosts, type BlogPost } from "@/lib/blog-api";

const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicPosts()
      .then(setPosts)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load blog."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,900px)] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)]" />
      </div>

      <MarketingHeader extraLinks={[{ label: "About", href: "/about" }]} />

      <main className="relative z-10 pt-28 md:pt-36 pb-8">
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16 md:pb-20">
          <motion.div initial="hidden" animate="visible" variants={FADE_UP}>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/40 mb-5">Insights</p>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] tracking-[0.04em] leading-[1.05] mb-6">
              BLOG
            </h1>
            <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl">
              Product updates, ecosystem news, and perspectives from the Solid One team.
            </p>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          {loading && <p className="text-white/40 text-sm font-light">Loading posts...</p>}
          {error && <p className="text-red-400/90 text-sm">{error}</p>}
          {!loading && !error && posts.length === 0 && (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] px-8 py-16 text-center">
              <p className="text-white/45 font-light">No posts yet. Check back soon.</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={FADE_UP}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <div className="glass-card glow-card h-full flex flex-col overflow-hidden">
                    <div className="aspect-[16/10] bg-white/[0.04] border-b border-white/8 overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[11px] font-mono uppercase tracking-[0.2em] text-white/25">
                          Solid One
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-[12px] text-white/35 font-mono mb-3">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.createdAt)}
                      </div>
                      <h2 className="text-lg font-semibold text-white/90 mb-2 group-hover:text-white transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-[14px] text-white/40 font-light leading-relaxed flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-5 text-[13px] text-white/55 group-hover:text-white transition-colors">
                        Read more
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>
      </main>

      <div className="relative z-10 border-t border-white/6 pt-6 md:pt-8">
        <SiteFooter />
      </div>
    </div>
  );
}
