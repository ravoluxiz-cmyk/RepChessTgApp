import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    if (!apiBase) return []
    return [
      { source: '/api/auth/telegram', destination: `${apiBase}/api/auth/telegram` }
    ]
  }
}

export default nextConfig
