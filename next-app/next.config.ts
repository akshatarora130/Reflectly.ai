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
      // Game-related API routes
      {
        // Word Drop game content
        source: "/api/games/word-drop/content",
        destination: "http://localhost:4000/api/games/word-drop/content",
      },
      {
        // Would You Rather questions
        source: "/api/games/would-you-rather/questions",
        destination:
          "http://localhost:4000/api/games/would-you-rather/questions",
      },
      {
        // Memory Match pairs
        source: "/api/games/memory-match/pairs",
        destination: "http://localhost:4000/api/games/memory-match/pairs",
      },
      {
        // Breathing Rhythm exercise
        source: "/api/games/breathing-rhythm/exercise",
        destination:
          "http://localhost:4000/api/games/breathing-rhythm/exercise",
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
