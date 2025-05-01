import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#014D4E] mb-4">
          Welcome to reflectly.ai
        </h1>
        <p className="text-xl text-gray-600 mb-8">Your personal AI companion</p>

        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-[#014D4E] text-white px-6 py-3 rounded-md hover:bg-[#013638] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
