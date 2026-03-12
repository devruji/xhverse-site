export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export const items: GalleryItem[] = [
  {
    id: "gallery-01",
    src: "/images/gallery-01.svg",
    alt: "Abstract, cinematic landscape rendered in deep blues and neons.",
    caption: "First exploration from the xhverse series.",
    width: 1600,
    height: 1200,
  },
  {
    id: "gallery-02",
    src: "/images/gallery-02.svg",
    alt: "Dense, dreamlike collage of architectural fragments and light.",
    caption: "A denser, more architectural cut into the same imagined world.",
    width: 1600,
    height: 1200,
  },
  {
    id: "og-cover",
    src: "/images/og-cover.svg",
    alt: "Cover image for the xhverse site, gradient tones and subtle noise.",
    caption: "The current cover image for xhverse.",
    width: 1600,
    height: 900,
  },
];
