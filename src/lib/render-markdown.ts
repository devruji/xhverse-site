import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const CALLOUT_LABELS = {
  summary: "Summary",
  decision: "Decision rule",
  warning: "Watch out",
  check: "Design check",
  note: "Note",
} as const;

type CalloutType = keyof typeof CALLOUT_LABELS;

export type TocEntry = {
  id: string;
  text: string;
  level: 2 | 3;
};

marked.setOptions({ gfm: true });

export function slugifyHeading(text: string): string {
  const plain = text.replace(/<[^>]+>/g, "").trim();
  const base = plain
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base || "section";
}

function uniqueHeadingId(base: string, used: Map<string, number>): string {
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export function extractTableOfContents(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const usedIds = new Map<string, number>();

  for (const token of marked.lexer(markdown)) {
    if (token.type === "heading" && (token.depth === 2 || token.depth === 3)) {
      const text = token.text.trim();
      const base = slugifyHeading(text);
      entries.push({
        id: uniqueHeadingId(base, usedIds),
        text,
        level: token.depth,
      });
    }
  }

  return entries;
}

function injectHeadingIds(html: string, toc: TocEntry[]): string {
  if (toc.length === 0) return html;
  let tocIndex = 0;
  return html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, inner) => {
    if (/\bid\s*=/.test(attrs)) return match;
    const entry = toc[tocIndex];
    if (!entry) return match;
    tocIndex += 1;
    return `<${tag}${attrs} id="${entry.id}">${inner}</${tag}>`;
  });
}

function isExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//i.test(href);
}

function isSameOriginAssetPath(src: string | undefined): boolean {
  if (!src) return false;
  return src.startsWith("/") && !src.startsWith("//");
}

function isCalloutType(value: string): value is CalloutType {
  return Object.hasOwn(CALLOUT_LABELS, value);
}

function stripQuotePrefix(line: string): string {
  return line.replace(/^>\s?/, "");
}

function renderCallout(type: CalloutType, content: string): string {
  const inner = marked.parse(content.trim(), { async: false }) as string;
  return `<blockquote class="article-callout article-callout--${type}" data-callout="${type}"><p class="article-callout__label">${CALLOUT_LABELS[type]}</p>${inner}</blockquote>`;
}

export function transformCalloutMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const marker = lines[index].match(/^>\s?\[!([a-z]+)\]\s*$/i);
    const type = marker?.[1].toLowerCase();
    if (!type || !isCalloutType(type)) {
      output.push(lines[index]);
      continue;
    }

    const content: string[] = [];
    index += 1;
    while (index < lines.length && lines[index].startsWith(">")) {
      content.push(stripQuotePrefix(lines[index]));
      index += 1;
    }
    index -= 1;
    output.push(renderCallout(type, content.join("\n")));
  }

  return output.join("\n");
}

/**
 * Renders Markdown to sanitized HTML for trusted-but-unknown markup (CMS / DB body).
 */
export function renderMarkdownToHtml(markdown: string): string {
  const transformed = transformCalloutMarkdown(markdown);
  const toc = extractTableOfContents(transformed);
  const raw = marked.parse(transformed, { async: false }) as string;
  const withIds = injectHeadingIds(raw, toc);
  return sanitizeHtml(withIds, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      blockquote: ["class", "data-callout"],
      p: ["class"],
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      h2: ["id"],
      h3: ["id"],
    },
    allowedClasses: {
      blockquote: [
        "article-callout",
        "article-callout--summary",
        "article-callout--decision",
        "article-callout--warning",
        "article-callout--check",
        "article-callout--note",
      ],
      p: ["article-callout__label"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href;
        const external = isExternalHref(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(external
              ? {
                  rel: "noopener noreferrer",
                  target: "_blank",
                }
              : {}),
          },
        };
      },
      img: (tagName, attribs) => {
        if (!isSameOriginAssetPath(attribs.src)) {
          return { tagName: "span", attribs: {} };
        }
        return {
          tagName,
          attribs: {
            ...attribs,
            loading: attribs.loading ?? "lazy",
            decoding: attribs.decoding ?? "async",
          },
        };
      },
    },
  });
}
