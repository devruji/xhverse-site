export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  /** Optional syndication link; empty when the piece is site-only. */
  mediumUrl: string;
  readingTime: string;
  /** Full post body (Markdown); used on `/blog/[slug]` and when Supabase is empty. */
  bodyMarkdown: string;
};

export const posts: BlogPost[] = [
  {
    slug: "building-xhverse",
    title: "Building xhverse",
    excerpt:
      "Notes on the design, architecture, and guiding ideas behind this small corner of the web.",
    date: "2026-03-01",
    tags: ["process", "astro", "design"],
    mediumUrl: "https://medium.xhverse.co/building-xhverse",
    readingTime: "6 min read",
    bodyMarkdown: `## Why this site exists

xhverse is a **personal archive**: a stable place on my own domain for projects, writing, and references.

## What I optimized for

- **Clarity** over novelty
- **Fast static delivery** with Astro
- **Honest metadata** and readable structure

## Medium

A longer version of some pieces may also appear on [Medium](https://medium.xhverse.co); this page is the canonical, full-text home when published here.`,
  },
  {
    slug: "images-as-interfaces",
    title: "Images as interfaces",
    excerpt:
      "Thinking about images not just as decoration, but as interactive surfaces for navigation and story.",
    date: "2026-02-14",
    tags: ["visuals", "interaction"],
    mediumUrl: "https://medium.xhverse.co/images-as-interfaces",
    readingTime: "4 min read",
    bodyMarkdown: `## Beyond illustration

Images can do more than illustrate a paragraph. They can **carry hierarchy**, suggest sequence, and invite exploration.

## Quiet interaction

Not every interface needs motion. Sometimes contrast, cropping, and placement are enough to signal *where to look next*.`,
  },
  {
    slug: "fragments-and-worlds",
    title: "Fragments & worlds",
    excerpt:
      "On using tiny textual fragments to suggest larger fictional spaces without fully defining them.",
    date: "2026-01-27",
    tags: ["writing", "worldbuilding"],
    mediumUrl: "https://medium.xhverse.co/fragments-and-worlds",
    readingTime: "5 min read",
    bodyMarkdown: `## Small pieces, large implication

A single line can imply history, geography, or conflict if the reader meets it in the right context.

## Leaving room

Worldbuilding does not require a wiki. **Strategic gaps** often feel more alive than exhaustive explanation.`,
  },
];
