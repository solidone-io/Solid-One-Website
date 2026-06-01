import type { LegalBlock } from "@/content/privacy-policy";

export type LegalSectionNav = {
  id: string;
  number: string;
  label: string;
  full: string;
};

export function sectionIdFromHeading(heading: string): string {
  const match = heading.match(/^(\d+)\.\s*(.+)$/);
  if (!match) {
    return `section-${heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }
  const slug = match[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `section-${match[1]}-${slug}`;
}

export function sectionsFromBlocks(blocks: LegalBlock[]): LegalSectionNav[] {
  return blocks
    .filter((b): b is LegalBlock & { type: "h2" } => b.type === "h2")
    .map((b) => {
      const match = b.text.match(/^(\d+)\.\s*(.+)$/);
      const number = match?.[1] ?? "";
      const label = match?.[2] ?? b.text;
      return {
        id: sectionIdFromHeading(b.text),
        number,
        label,
        full: b.text,
      };
    });
}
