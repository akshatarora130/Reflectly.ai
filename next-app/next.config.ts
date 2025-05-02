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
      {
        // Redirect journal analysis to the Python backend
        source: "/api/journal/analyze",
        destination: "http://localhost:4000/api/journal/analyze",
      },
      {
        // Redirect chat report generation to the Python backend
        source: "/api/chat/report",
        destination: "http://localhost:4000/api/chat/report",
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
