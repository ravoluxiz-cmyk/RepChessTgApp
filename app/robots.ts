import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/tournaments",
          "/club",
          "/merch",
          "/lessons",
          "/partners",
          "/rating/leaderboard",
        ],
        disallow: [
          "/admin",
          "/api",
          "/profile",
          "/login",
          "/logout",
          "/match",
          "/rating/history",
          "/rating/predict",
        ],
      },
    ],
    sitemap: "https://repchesskrd.ru/sitemap.xml",
    host: "https://repchesskrd.ru",
  }
}
