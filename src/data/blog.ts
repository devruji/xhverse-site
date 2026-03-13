export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  mediumUrl: string;
  readingTime: string;
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
  },
];
