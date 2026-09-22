import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dear Tomorrow",
    short_name: "Dear Tomorrow",
    description: "Leave something for the person you'll become.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FFF8EC", // --cream
    theme_color: "#1B72BC", // --sky-deep
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
