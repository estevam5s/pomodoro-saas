import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "FocusTimer — Pomodoro", short_name: "FocusTimer", description: "Cronômetro Pomodoro com foco em produtividade e estatísticas.", start_url: "/", display: "standalone", background_color: "#0b1220", theme_color: "#ef4444", lang: "pt-BR",
    icons: [ { src: "/icon-512.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" } ] };
}
