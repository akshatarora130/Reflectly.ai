"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  MessageSquare,
  BookOpen,
  GamepadIcon,
  Heart,
  Users,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Main Feature Card - AI Companion (Full Width)
const MainFeatureCard = () => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/dashboard/ai-companion")}
      className="bg-[#1a4a4b] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] w-full mb-8 group shadow-[0_0_50px_0_rgba(0,0,0,0.1)] hover:shadow-[0_0_60px_0_rgba(0,0,0,0.15)]"
    >
      <div className="p-8 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a5a5b]/20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#2a5a5b]/20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-[#2a5a5b]/10 blur-2xl"></div>

        {/* Decorative elements */}
        <div className="absolute top-12 right-12 w-20 h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full"></div>
        <div className="absolute bottom-12 left-12 w-1 h-20 bg-gradient-to-b from-white/0 via-white/20 to-white/0 rounded-full"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="md:w-1/2">
              <div className="flex items-center mb-6">
                <div className="rounded-xl p-3 bg-white/10 backdrop-blur-md text-white mr-4 shadow-md">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="bg-[#072728]/60 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300 mr-2" />
                  <span className="text-white/90 text-xs font-medium tracking-wide">
                    MAIN FEATURE
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight leading-tight">
                AI Companion
              </h2>
              <p className="text-white/80 mb-6 text-xs leading-relaxed">
                Your personal AI wellness assistant is ready to chat. Get
                emotional support, guidance, and personalized recommendations
                tailored to your unique needs and goals.
              </p>

              <button className="bg-white text-[#014D4E] px-5 py-2.5 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center shadow-md group-hover:shadow-lg">
                <span className="text-xs">Start Conversation</span>
                <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="md:w-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 mr-3 shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white text-xs mb-1">
                    Personalized Support
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Guidance based on your unique needs
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 mr-3 shadow-md">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white text-xs mb-1">
                    Safe Space
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Express yourself in confidence
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 mr-3 shadow-md">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white text-xs mb-1">
                    Instant Assistance
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Available 24/7 whenever needed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Secondary Feature Card - Analysis Dashboard (Full Width)
const SecondaryFeatureCard = () => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/dashboard/analysis")}
      className="w-full mb-8 group"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-[#1a4a4b] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] shadow-[0_0_40px_0_rgba(0,0,0,0.08)] hover:shadow-[0_0_50px_0_rgba(0,0,0,0.12)] md:w-5/12 p-8 relative">
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#2a5a5b]/20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#2a5a5b]/20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-16 h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-1 h-16 bg-gradient-to-b from-white/0 via-white/20 to-white/0 rounded-full"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-5">
              <div className="rounded-xl p-2.5 bg-white/10 backdrop-blur-md text-white mr-3 shadow-md">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="bg-[#072728]/60 backdrop-blur-md px-3 py-1.5 rounded-full inline-flex items-center shadow-md">
                <TrendingUp className="h-3 w-3 text-blue-300 mr-1.5" />
                <span className="text-white/90 text-xs font-medium tracking-wide">
                  KEY INSIGHTS
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-3 tracking-tight leading-tight">
              Analysis Dashboard
            </h2>
            <p className="text-white/80 text-xs leading-relaxed">
              Gain valuable insights about your emotional well-being with
              comprehensive reports, progress tracking, and personalized
              recommendations for continued growth.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-[0_0_40px_0_rgba(0,0,0,0.08)] md:w-7/12">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Comprehensive Analytics
              </h3>
              <p className="text-gray-600 mb-5 text-xs leading-relaxed">
                Our advanced analytics platform helps you understand patterns in
                your emotional well-being and provides actionable insights to
                improve your mental health journey.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-3 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#1a4a4b] rounded-lg p-1.5 mr-2 shadow-md">
                      <TrendingUp className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="font-medium text-gray-800 text-xs">
                      Trend Analysis
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Identify patterns in your emotional responses
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-3 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#1a4a4b] rounded-lg p-1.5 mr-2 shadow-md">
                      <Clock className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="font-medium text-gray-800 text-xs">
                      Progress Tracking
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Monitor improvements in your well-being
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-3 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <div className="bg-[#1a4a4b] rounded-lg p-1.5 mr-2 shadow-md">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="font-medium text-gray-800 text-xs">
                      Smart Insights
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Receive AI-powered recommendations
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="text-[#014D4E] font-medium flex items-center group-hover:underline">
                <span className="text-xs">View Full Analysis</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Regular Feature Card - Now in a 2x2 grid
const FeatureCard = ({
  title,
  icon: Icon,
  description,
  path,
  bgColor = "bg-[#1a4a4b]",
  benefits = [],
}: {
  title: string;
  icon: any;
  description: string;
  path: string;
  bgColor?: string;
  benefits?: string[];
}) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(path)}
      className="bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] flex flex-col h-full group shadow-[0_0_30px_0_rgba(0,0,0,0.06)] hover:shadow-[0_0_40px_0_rgba(0,0,0,0.1)]"
    >
      <div className={`p-5 ${bgColor} relative overflow-hidden`}>
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="flex justify-between items-start relative z-10">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <div className="rounded-lg p-2 bg-white/10 backdrop-blur-md text-white shadow-md">
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50">
        <p className="text-gray-600 mb-3 flex-1 text-xs leading-relaxed">
          {description}
        </p>

        {benefits.length > 0 && (
          <div className="mb-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center mb-1 last:mb-0">
                <CheckCircle2 className="h-3 w-3 text-[#1a4a4b] mr-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center text-[#014D4E] font-medium mt-auto group-hover:underline">
          <span className="text-xs">Explore {title}</span>
          <ArrowRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014D4E]"></div>
      </div>
    );
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.split(" ")[0][0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Reflectly.AI"
                width={40}
                height={40}
              />
              <span className="ml-3 text-lg font-bold text-[#014D4E]">
                Reflectly.AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <Bell className="h-4 w-4" />
              </button>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="focus:outline-none"
                >
                  {session?.user?.image ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={session.user.image || "/placeholder.svg"}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#014D4E] text-white flex items-center justify-center">
                      {getUserInitials()}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-700">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-100">
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        <span>Settings</span>
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-xs text-red-600 hover:bg-gray-100">
                        <LogOut className="mr-2 h-3.5 w-3.5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-[#1a4a4b] rounded-xl p-8 mb-8 text-white shadow-xl relative overflow-hidden w-full">
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2a5a5b]/20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#2a5a5b]/20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-20 h-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-1 h-20 bg-gradient-to-b from-white/0 via-white/20 to-white/0 rounded-full"></div>

          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2 tracking-tight">
              Welcome Back
              {session?.user?.name
                ? `, ${session.user.name.split(" ")[0]}!`
                : "!"}
            </h1>
            <p className="text-white/80 max-w-2xl text-xs leading-relaxed">
              Your wellness journey continues. Explore our tools and resources
              designed to support your mental health and well-being.
            </p>
          </div>
        </div>

        {/* Main Feature - AI Companion */}
        <MainFeatureCard />

        {/* Secondary Feature - Analysis Dashboard */}
        <SecondaryFeatureCard />

        {/* Section Title */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800">Other Features</h2>
        </div>

        {/* Other Features in a 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FeatureCard
            title="Journal"
            icon={BookOpen}
            description="Document your thoughts, feelings, and experiences with mood tracking to gain insights into your emotional patterns."
            path="/dashboard/journal"
            bgColor="bg-[#2a6b69]"
            benefits={[
              "Daily mood tracking",
              "Emotion pattern analysis",
              "Guided journaling prompts",
            ]}
          />

          <FeatureCard
            title="Wellness Games"
            icon={GamepadIcon}
            description="Engage in interactive games designed to promote mental wellness, mindfulness, and cognitive health."
            path="/dashboard/games"
            bgColor="bg-[#2d5c7f]"
            benefits={[
              "Mindfulness exercises",
              "Cognitive training",
              "Stress reduction activities",
            ]}
          />

          <FeatureCard
            title="Self-Care Activities"
            icon={Heart}
            description="Discover personalized self-care activities tailored to your needs, preferences, and current emotional state."
            path="/dashboard/self-care"
            bgColor="bg-[#7f365c]"
            benefits={[
              "Personalized recommendations",
              "Guided meditation sessions",
              "Breathing exercises",
            ]}
          />

          <FeatureCard
            title="Connect with Therapists"
            icon={Users}
            description="Find and connect with licensed therapists for professional support when you need additional guidance."
            path="/dashboard/therapist"
            bgColor="bg-[#4a5c7f]"
            benefits={[
              "Licensed professionals",
              "Secure video sessions",
              "Personalized matching",
            ]}
          />
        </div>
      </div>
    </div>
  );
}
