/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Only redirect /api/chat to the Python backend
        source: "/api/chat/:path*",
        destination: "http://localhost:4000/api/chat/:path*",
      },
      {
        // Only redirect /api/status to the Python backend
        source: "/api/status/:path*",
        destination: "http://localhost:4000/api/status/:path*",
      },
      // Add other specific Python backend endpoints as needed
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
