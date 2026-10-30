export type TocItem = { id: string; text: string; level: number };

export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  let index = 0;
  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    index += 1;
    items.push({
      id: `section-${index}`,
      text: match[2].replace(/[*_`]/g, "").trim(),
      level: match[1].length,
    });
  }
  return items;
}

export function addHeadingIds(html: string): string {
  let index = 0;
  return html.replace(/<h([23])>(.*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    index += 1;
    return `<h${level} id="section-${index}">${inner}</h${level}>`;
  });
}
