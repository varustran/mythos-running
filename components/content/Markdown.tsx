import { marked } from "marked";
import { addHeadingIds } from "@/lib/markdown";

marked.setOptions({ gfm: true, breaks: false });

export function Markdown({ content }: { content: string }) {
  const html = addHeadingIds(marked.parse(content) as string);
  return <div className="prose-mythos" dangerouslySetInnerHTML={{ __html: html }} />;
}
