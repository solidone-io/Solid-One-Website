import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";
import { BlogBody } from "@/components/BlogBody";
import { MarketingHeader } from "@/components/MarketingHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchPublicPost, type BlogPost } from "@/lib/blog-api";

const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetchPublicPost(slug)
      .then(setPost)
      .catch((err) => setError(err instanceof Error ? err.message : "Post not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-white selection:text-black overflow-x-hidden">
      <MarketingHeader
        extraLinks={[
          { label: "Blog", href: "/blog" },
          { label: "About", href: "/about" },
        ]}
      />

      <main className="relative z-10 pt-28 md:pt-36 pb-8">
        <article className="max-w-3xl mx-auto px-6 md:px-10 pb-20 md:pb-28">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[13px] text-white/50 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Link>

          {loading && <p className="text-white/40 text-sm font-light">Loading...</p>}
          {error && (
            <div className="rounded-2xl border border-white/10 p-8 text-center">
              <p className="text-white/50 mb-4">{error}</p>
              <Link href="/blog" className="text-[13px] text-white/70 hover:text-white">
                Back to blog
              </Link>
            </div>
          )}

          {post && (
            <motion.div initial="hidden" animate="visible" variants={FADE_UP}>
              <div className="flex items-center gap-2 text-[12px] text-white/35 font-mono mb-5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.createdAt)}
              </div>
              <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] tracking-[0.04em] leading-[1.08] mb-6">
                {post.title}
              </h1>
              <p className="text-lg text-white/50 font-light leading-relaxed mb-10">{post.excerpt}</p>

              {post.coverImage && (
                <div className="rounded-[24px] overflow-hidden border border-white/10 mb-10 aspect-[16/9] bg-white/[0.03]">
                  <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <BlogBody body={post.body} />
            </motion.div>
          )}
        </article>
      </main>

      <div className="relative z-10 border-t border-white/6 pt-6 md:pt-8">
        <SiteFooter />
      </div>
    </div>
  );
}
