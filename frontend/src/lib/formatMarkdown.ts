/**
 * Normalize AI-generated markdown that may contain HTML artifacts.
 * Converts <br> variants to newlines so react-markdown renders them cleanly.
 */
export function normalizeMarkdown(content: string): string {
  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
