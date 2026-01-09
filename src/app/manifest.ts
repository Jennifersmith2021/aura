import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aura - Closet & Lifestyle Companion",
    short_name: "Aura",
    description: "AI-powered personal assistant for fashion, wellness, and intimate lifestyle tracking",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23ec4899' width='192' height='192'/><text x='96' y='120' font-size='100' font-weight='bold' fill='white' text-anchor='middle' font-family='system-ui'>A</text></svg>",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23ec4899' width='192' height='192'/><text x='96' y='120' font-size='100' font-weight='bold' fill='white' text-anchor='middle' font-family='system-ui'>A</text></svg>",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23ec4899' width='192' height='192' rx='45'/><text x='96' y='120' font-size='100' font-weight='bold' fill='white' text-anchor='middle' font-family='system-ui'>A</text></svg>",
        sizes: "180x180",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 540 720'><rect fill='%23000' width='540' height='720'/><rect fill='%23ec4899' x='20' y='20' width='500' height='680' rx='20'/><text x='270' y='360' font-size='60' font-weight='bold' fill='white' text-anchor='middle'>Aura</text></svg>",
        sizes: "540x720",
        type: "image/svg+xml",
        form_factor: "narrow",
      },
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'><rect fill='%23000' width='1280' height='720'/><rect fill='%23ec4899' x='40' y='40' width='1200' height='640' rx='20'/><text x='640' y='360' font-size='80' font-weight='bold' fill='white' text-anchor='middle'>Aura</text></svg>",
        sizes: "1280x720",
        type: "image/svg+xml",
        form_factor: "wide",
      },
    ],
    categories: ["lifestyle", "shopping", "productivity"],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "View Closet",
        short_name: "Closet",
        description: "View and manage your closet",
        url: "/closet",
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect fill='%23ec4899' width='96' height='96'/><text x='48' y='60' font-size='50' font-weight='bold' fill='white' text-anchor='middle'>👗</text></svg>",
            sizes: "96x96",
            type: "image/svg+xml",
          },
        ],
      },
      {
        name: "Track Measurements",
        short_name: "Measurements",
        description: "Track your body measurements",
        url: "/vanity",
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect fill='%23ec4899' width='96' height='96'/><text x='48' y='60' font-size='50' font-weight='bold' fill='white' text-anchor='middle'>📏</text></svg>",
            sizes: "96x96",
            type: "image/svg+xml",
          },
        ],
      },
      {
        name: "Shopping",
        short_name: "Shop",
        description: "Search and add items",
        url: "/shopping",
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect fill='%23ec4899' width='96' height='96'/><text x='48' y='60' font-size='50' font-weight='bold' fill='white' text-anchor='middle'>🛍️</text></svg>",
            sizes: "96x96",
            type: "image/svg+xml",
          },
        ],
      },
    ],
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "image",
            accept: ["image/*"],
          },
        ],
      },
    },
  };
}
