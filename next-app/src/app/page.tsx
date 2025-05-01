import { header } from "framer-motion/client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
  <div>
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 md:px-24 lg:px-12"
      style={{
        backgroundImage: 'url("/bg.png")',
      }}
    >
      <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 w-full max-w-3xl flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#014D4E] leading-tight mb-16">
          Reflectly.AI :
          Mental Health For Your Best Self
        </h1>
        <br />
        <p className="text-lg text-[#014D4E]/90 mb-6 max-w-xl">
          Join others just like you, using the leading AI-powered mental health coach to reduce feelings of stress, curb overthinking, and unlock your best self. Indulge into fun games and activities to keep your mind at the right track.
        </p>
        <Link
          href="/login"
          className="inline-block bg-white text-[#014D4E] px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition"
        >
          LOG IN
        </Link>
      </div>
    </div>
    <div>
    <section className="w-full px-6 md:px-12 lg:px-24 py-20 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Text Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-4">
            Always <span className="text-green-600 italic font-medium">Available</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-md">
            Whether you're dealing with late-night worries or early morning doubts, our AI Companion AURA is here for you 24/7.
          </p>
        </div>

        {/* Right Image */}
        <div className="flex justify-center relative">
          <Image
            src="/available-section.png" // Replace with your uploaded image
            alt="User with phone and app UI"
            width={600}
            height={400}
            className="rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
    </div>
  </div>
  );
}
