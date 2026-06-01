import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Eye, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BlogBody } from "@/components/BlogBody";
import { BlogRichEditor } from "@/components/BlogRichEditor";
import {
  createPost,
  deletePost,
  fetchAdminPosts,
  slugifyTitle,
  updatePost,
  uploadBlogImage,
  type BlogPost,
} from "@/lib/blog-api";
import { useToast } from "@/hooks/use-toast";

type EditorState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  published: boolean;
};

const emptyEditor = (): EditorState => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: null,
  published: false,
});

function postToEditor(post: BlogPost): EditorState {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    coverImage: post.coverImage,
    published: post.published,
  };
}

type AdminBlogProps = { token: string };

export function AdminBlog({ token }: AdminBlogProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [slugTouched, setSlugTouched] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await fetchAdminPosts(token));
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const startNew = () => {
    setSelectedId("new");
    setEditor(emptyEditor());
    setSlugTouched(false);
  };

  const startEdit = (post: BlogPost) => {
    setSelectedId(post.id);
    setEditor(postToEditor(post));
    setSlugTouched(true);
  };

  const updateField = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
    setEditor((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched && selectedId === "new") {
        next.slug = slugifyTitle(String(value));
      }
      return next;
    });
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBlogImage(token, file);
      setEditor((prev) => ({ ...prev, coverImage: url }));
      toast({ title: "Image uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const bodyIsEmpty = (html: string) => html.replace(/<[^>]+>/g, "").trim().length === 0;

  const handleSave = async () => {
    if (!editor.title.trim() || !editor.excerpt.trim() || bodyIsEmpty(editor.body)) {
      toast({ title: "Missing fields", description: "Title, excerpt, and body are required.", variant: "destructive" });
      return;
    }
    const slug = editor.slug.trim() ? slugifyTitle(editor.slug) : slugifyTitle(editor.title);
    const payload = {
      title: editor.title.trim(),
      slug,
      excerpt: editor.excerpt.trim(),
      body: editor.body,
      coverImage: editor.coverImage,
      published: editor.published,
    };

    setSaving(true);
    try {
      if (selectedId === "new") {
        const created = await createPost(token, payload);
        toast({ title: "Published", description: created.published ? "Post is live." : "Saved as draft." });
        setSelectedId(created.id);
        setEditor(postToEditor(created));
      } else if (typeof selectedId === "number") {
        const updated = await updatePost(token, selectedId, payload);
        toast({ title: "Saved", description: updated.published ? "Post is live." : "Draft updated." });
        setEditor(postToEditor(updated));
      }
      await loadPosts();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(token, id);
      if (selectedId === id) {
        setSelectedId(null);
        setEditor(emptyEditor());
      }
      toast({ title: "Deleted" });
      await loadPosts();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not delete.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8">
      <aside className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg tracking-wide">Blog posts</h2>
          <Button size="sm" onClick={startNew} className="bg-white text-black hover:bg-white/90 h-8 px-3">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>

        {loading && <p className="text-white/40 text-sm">Loading...</p>}
        {!loading && posts.length === 0 && (
          <p className="text-white/40 text-sm font-light">No posts yet. Create your first one.</p>
        )}

        <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {posts.map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => startEdit(post)}
                className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                  selectedId === post.id
                    ? "border-white/25 bg-white/[0.06]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/18"
                }`}
              >
                <p className="text-sm font-medium text-white/85 truncate">{post.title}</p>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <span className="text-[11px] text-white/35 font-mono truncate">/{post.slug}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      post.published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {post.published ? "Live" : "Draft"}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0">
        {selectedId === null ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/40 text-sm font-light">
            Select a post or create a new one to edit.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-white/80 font-medium flex items-center gap-2">
                <Pencil className="w-4 h-4 text-white/40" />
                {selectedId === "new" ? "New post" : "Edit post"}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview((v) => !v)}
                  className="border-white/15 text-white/70 lg:hidden"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                {typeof selectedId === "number" && (
                  <>
                    <Link href={`/blog/${editor.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="border-white/15 text-white/70" disabled={!editor.published}>
                        View live
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedId)}
                      className="border-white/15 text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {saving ? "Saving..." : "Save post"}
                </Button>
              </div>
            </div>

            <div className={`grid gap-8 ${showPreview ? "xl:grid-cols-2" : ""}`}>
              <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 md:p-6">
                <div className="space-y-2">
                  <Label className="text-white/50">Title</Label>
                  <Input
                    value={editor.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="bg-[#111] border-white/10 text-white"
                    placeholder="Post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50">URL slug</Label>
                  <Input
                    value={editor.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      updateField("slug", e.target.value);
                    }}
                    className="bg-[#111] border-white/10 text-white font-mono text-sm"
                    placeholder="my-post-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50">Excerpt</Label>
                  <Textarea
                    value={editor.excerpt}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    className="bg-[#111] border-white/10 text-white min-h-[80px] resize-y"
                    placeholder="Short summary for the blog list"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50">Body</Label>
                  <p className="text-[12px] text-white/30 font-light">
                    Bold, italic, underline, headings, and lists. Saved as rich text on the live post.
                  </p>
                  <BlogRichEditor
                    key={selectedId === "new" ? "new" : `post-${selectedId}`}
                    content={editor.body}
                    onChange={(html) => updateField("body", html)}
                    placeholder="Write your post…"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-white/50">Cover image</Label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                      className="border-white/15 text-white/70"
                    >
                      <ImagePlus className="w-4 h-4 mr-1.5" />
                      {uploading ? "Uploading..." : "Upload image"}
                    </Button>
                    {editor.coverImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateField("coverImage", null)}
                        className="text-white/40"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {editor.coverImage && (
                    <img
                      src={editor.coverImage}
                      alt=""
                      className="rounded-xl border border-white/10 max-h-48 w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                  <div>
                    <Label className="text-white/70">Published</Label>
                    <p className="text-[12px] text-white/35 font-light mt-0.5">Visible on the public blog</p>
                  </div>
                  <Switch checked={editor.published} onCheckedChange={(v) => updateField("published", v)} />
                </div>
              </div>

              <div
                className={`rounded-2xl border border-white/10 bg-[#050505] p-5 md:p-6 ${
                  showPreview ? "block" : "hidden"
                } xl:block`}
              >
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/35 mb-4">Live preview</p>
                  {editor.coverImage && (
                    <div className="rounded-xl overflow-hidden border border-white/10 mb-6 aspect-[16/9]">
                      <img src={editor.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h4 className="font-display text-2xl tracking-[0.04em] mb-3">
                    {editor.title || "Post title"}
                  </h4>
                  <p className="text-white/45 font-light mb-6">{editor.excerpt || "Excerpt appears here."}</p>
                  <BlogBody body={editor.body || "<p>Your content will appear here.</p>"} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
