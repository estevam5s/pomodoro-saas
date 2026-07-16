import type { MetadataRoute } from "next";
const BASE = "https://pomodoro-saas-rho.vercel.app";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api", "/admin", "/login", "/register", "/app"] }], sitemap: `${BASE}/sitemap.xml`, host: BASE };
}
