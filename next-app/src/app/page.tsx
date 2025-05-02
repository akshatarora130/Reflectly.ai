import { header } from "framer-motion/client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo or Title */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.svg"
              alt="logo"
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-[#014D4E] font-serif">
              Reflectly.AI
            </h1>
          </div>

          {/* Navigation Links */}
          <div>
            <Link
              href="/login"
              className="bg-[#014D4E] text-white px-5 py-2 rounded-full text-sm md:text-base font-medium hover:bg-[#026a6b] transition"
            >
              LOG IN
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 md:px-24 lg:px-12"
        style={{
          backgroundImage: 'url("/bg.png")',
        }}
      >
        <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 w-full max-w-3xl flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#014D4E] leading-tight mb-16">
            Mental Health
            <br /> For Your Best Self
          </h1>
          <p className="text-lg text-[#014D4E]/90 mb-6 max-w-xl">
            Join others just like you, using the leading AI-powered mental
            health coach to reduce feelings of stress, curb overthinking, and
            unlock your best self. Indulge into fun games and activities to keep
            your mind at the right track.
          </p>
        </div>
      </div>

      {/* Available Section */}
      <div className="min-h-screen flex items-center bg-white px-6 md:px-12 lg:px-24">
        <section className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-4">
              Always{" "}
              <span className="text-green-600 italic font-medium">
                Available
              </span>
            </h2>
            <p className="text-lg text-gray-700 max-w-md">
              Whether you're dealing with late-night worries or early morning
              doubts, our AI Companion AURA is here for you 24/7.
              <br /> Get your personalised reports for each session and feel
              free to get back to any chat anytime. <br /> Aura is the ultimate
              friendly compaion you need for all your issues!
            </p>
          </div>

          {/* Right Image */}
          <div className="flex justify-center relative">
            <Image
              src="/image.png"
              alt="User with phone and app UI"
              width={600}
              height={400}
              className="rounded-2xl object-cover"
            />
          </div>
        </section>
      </div>

      <div
        className="flex justify-center items-center px-6 py-20"
        style={{ backgroundColor: "#F1E9D2" }}
      >
        <div className="bg-white/80 rounded-3xl shadow-lg p-12 max-w-6xl w-full text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#014D4E]">
            Protecting Your{" "}
            <span className="italic text-green-600">Emotional Journey</span>
          </h2>

          <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-16">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-green-900 text-white flex items-center justify-center text-4xl shadow-lg">
                🔒
              </div>
              <h3 className="mt-8 text-2xl font-semibold">Privacy First</h3>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                Your conversations remain confidential, encrypted, and protected
                by the best digital security.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-green-900 text-white flex items-center justify-center text-4xl shadow-lg">
                👓
              </div>
              <h3 className="mt-8 text-2xl font-semibold">
                Journaling Insights
              </h3>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                Personally curated journaling analysis and streak points for
                everyday journaling entries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-green-900 text-white flex items-center justify-center text-4xl shadow-lg">
                🔍
              </div>
              <h3 className="mt-8 text-2xl font-semibold">
                Healing process made fun
              </h3>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                Enjoy the path to healing with games, activities, therapist
                sessions and much more.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center bg-white px-6 md:px-12 lg:px-24">
        <section className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="flex justify-start relative order-2 md:order-1">
            <Image
              src="/image copy.png"
              alt="User with phone and app UI"
              width={600}
              height={400}
              className="rounded-2xl object-cover"
            />
          </div>

          {/* Right Text */}
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-4">
              Affordable{" "}
              <span className="text-green-600 italic font-medium">
                Self Improvement
              </span>
            </h2>
            <p className="text-lg text-gray-700 max-w-md">
              Reflectly offers psychologically and carefully desgined ways to
              improve your well being and actions in the social world. <br />
              Feel free to reach out to AURA for anything and everything. <br />
              Start journaling to earn points and streaks everyday. <br />
              Engaging games hook you up for collecting points while also
              promise to soothe your brain.
              <br /> Lastly, don't forget your weekly meetup with your favourite
              therpists!
            </p>
          </div>
        </section>
      </div>

      <div className="px-6 py-12 md:py-24">
        <div className="bg-green-900 rounded-[3rem] px-6 py-16 md:py-24 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            Your Journey Begins Here
            <br />
            <span className="text-green-300 italic font-medium">
              Start For Free.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Log In and get started on your insightful yet fun loving journey!
          </p>
        </div>
      </div>
    </div>
  );
}
