/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Only redirect /api/chat to the Python backend
        source: "/api/chat",
        destination: "http://localhost:4000/api/chat",
      },
      {
        // Only redirect /api/status to the Python backend
        source: "/api/status",
        destination: "http://localhost:4000/api/status",
      },
      {
        // Redirect /api/transcribe to the Python backend
        source: "/api/transcribe",
        destination: "http://localhost:4000/api/transcribe",
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
