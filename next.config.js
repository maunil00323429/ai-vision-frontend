/** @type {import('next').NextConfig} */
const nextConfig = {
  // In development, proxy /api/* to local Python when BACKEND_URL is set
  async rewrites() {
    const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (process.env.NODE_ENV === 'development' && backend) {
      const base = backend.replace(/\/$/, '');
      return [{ source: '/api/:path*', destination: `${base}/api/:path*` }];
    }
    return [];
  },
};

module.exports = nextConfig;
