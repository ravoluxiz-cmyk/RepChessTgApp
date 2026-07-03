import type { MetadataRoute } from "next"

const SITE_URL = "https://repchesskrd.ru"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = [
    { path: "/", priority: 1 },
    { path: "/chess-krasnodar", priority: 0.92 },
    { path: "/tournaments/krasnodar", priority: 0.9 },
    { path: "/tournaments", priority: 0.9 },
    { path: "/beginners/chess-krasnodar", priority: 0.87 },
    { path: "/beginners", priority: 0.86 },
    { path: "/lessons/chess-krasnodar", priority: 0.82 },
    { path: "/club", priority: 0.85 },
    { path: "/lessons", priority: 0.8 },
    { path: "/merch", priority: 0.75 },
    { path: "/partners", priority: 0.7 },
    { path: "/corporate/chess-events-krasnodar", priority: 0.68 },
    { path: "/corporate", priority: 0.65 },
    { path: "/rating/leaderboard", priority: 0.55 },
  ]

  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.path === "/" ? "weekly" : "daily",
    priority: route.priority,
  }))
}
