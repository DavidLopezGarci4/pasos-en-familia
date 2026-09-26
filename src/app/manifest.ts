import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pasos · Crecemos en familia",
    short_name: "Pasos",
    description: "Acompañar hábitos, registrar puntos y celebrar avances en familia.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f8f4",
    theme_color: "#233d33",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
