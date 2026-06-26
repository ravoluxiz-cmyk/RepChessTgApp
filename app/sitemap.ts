import type { MetadataRoute } from "next"

const SITE_URL = "https://repchesskrd.ru"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = [
    { path: "/", priority: 1 },
    { path: "/tournaments", priority: 0.9 },
    { path: "/club", priority: 0.85 },
    { path: "/lessons", priority: 0.8 },
    { path: "/merch", priority: 0.75 },
    { path: "/partners", priority: 0.7 },
    { path: "/rating/leaderboard", priority: 0.55 },
  ]

  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.path === "/" ? "weekly" : "daily",
    priority: route.priority,
  }))
}
