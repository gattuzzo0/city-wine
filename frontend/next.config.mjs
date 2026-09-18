/** @type {import('next').NextConfig} */
const backend = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '')

const nextConfig = {
  agentRules: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (backend) return []
    return [{ source: '/api/:path*', destination: 'http://127.0.0.1:8000/api/:path*' }]
  },
}

export default nextConfig
