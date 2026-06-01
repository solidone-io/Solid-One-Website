import DOMPurify from "dompurify";

function isHtml(body: string): boolean {
  const t = body.trim();
  return t.startsWith("<") && /<\/[a-z][\s\S]*>/i.test(t);
}

function isEmptyHtml(body: string): boolean {
  const t = body.replace(/<[^>]+>/g, "").trim();
  return t.length === 0;
}

export function BlogBody({ body, className = "" }: { body: string; className?: string }) {
  if (isHtml(body) && !isEmptyHtml(body)) {
    const clean = DOMPurify.sanitize(body, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "strike",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "blockquote",
      ],
    });
    return <div className={`blog-prose ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  const blocks = body.split(/\n\n+/).filter(Boolean);
  if (blocks.length === 0) {
    return <p className={`text-[15px] text-white/35 font-light ${className}`}>No content yet.</p>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block) => (
        <p key={block.slice(0, 48)} className="text-[15px] text-white/45 font-light leading-relaxed whitespace-pre-wrap">
          {block}
        </p>
      ))}
    </div>
  );
}
