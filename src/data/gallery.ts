export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
};

export const items: GalleryItem[] = [
  {
    id: "gallery-01",
    src: "/images/gallery-01.jpg",
    alt: "Abstract, cinematic landscape rendered in deep blues and neons.",
    caption: "First exploration from the xhverse series.",
  },
  {
    id: "gallery-02",
    src: "/images/gallery-02.jpg",
    alt: "Dense, dreamlike collage of architectural fragments and light.",
    caption: "A denser, more architectural cut into the same imagined world.",
  },
  {
    id: "og-cover",
    src: "/images/og-cover.jpg",
    alt: "Cover image for the xhverse site, gradient tones and subtle noise.",
    caption: "The current cover image for xhverse.",
  },
];

