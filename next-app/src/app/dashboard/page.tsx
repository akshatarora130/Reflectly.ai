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
  ChevronRight,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

// Dashboard card component with improved styling
const DashboardCard = ({
  title,
  icon: Icon,
  description,
  path,
  color,
  isPrimary = false,
}: {
  title: string;
  icon: any;
  description: string;
  path: string;
  color: string;
  isPrimary?: boolean;
}) => {
  const router = useRouter();

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl border border-[#FFE4C4]/30 ${
        isPrimary ? "md:col-span-2" : ""
      }`}
      onClick={() => router.push(path)}
    >
      <div
        className={`p-5 flex items-center justify-between ${color} text-white`}
      >
        <h3 className="text-xl font-semibold">{title}</h3>
        <Icon className="h-6 w-6" />
      </div>
      <div className="p-5">
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium text-[#014D4E] hover:underline">
          Go to {title} <ChevronRight className="ml-1 h-4 w-4" />
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
      <div className="flex justify-center items-center min-h-screen bg-[#FFE4C4]/10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#014D4E]"></div>
      </div>
    );
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="min-h-screen bg-[#FFE4C4]/10">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#FFE4C4]/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image src="/logo.svg" alt="Logo" width={36} height={36} />
            <span className="text-2xl font-bold text-[#014D4E] tracking-tight">
              Reflectly.AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-[#FFE4C4]/20 text-[#014D4E]">
              <Bell className="h-5 w-5" />
            </button>

            {/* Custom dropdown without shadcn components */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none"
              >
                {session?.user?.image ? (
                  <div className="h-9 w-9 rounded-full border-2 border-[#014D4E]/10 overflow-hidden">
                    <Image
                      src={session.user.image || "/placeholder.svg"}
                      alt={session.user.name || "User"}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#014D4E] text-white flex items-center justify-center border-2 border-[#014D4E]/10">
                    {getUserInitials()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-[#014D4E]">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <div className="py-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[#014D4E] to-[#267365] rounded-xl p-6 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Welcome Back{session?.user?.name ? `, ${session.user.name}` : ""}!
          </h1>
          <p className="text-white/80">
            Access all your wellness tools and resources from this dashboard.
            How are you feeling today?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="AI Companion"
            icon={MessageSquare}
            description="Chat with your AI companion for emotional support, guidance, and personalized wellness recommendations."
            path="/dashboard/ai-companion"
            color="bg-gradient-to-r from-[#014D4E] to-[#267365]"
            isPrimary={true}
          />

          <DashboardCard
            title="Analysis"
            icon={BarChart3}
            description="View comprehensive reports and insights about your emotional well-being, progress tracking, and personalized recommendations."
            path="/dashboard/analysis"
            color="bg-gradient-to-r from-[#267365] to-[#3A9188]"
            isPrimary={true}
          />

          <DashboardCard
            title="Journal"
            icon={BookOpen}
            description="Document your thoughts, feelings, and experiences in your personal journal with mood tracking."
            path="/dashboard/journal"
            color="bg-[#3A9188]"
          />

          <DashboardCard
            title="Games"
            icon={GamepadIcon}
            description="Engage in games designed to promote mental wellness, mindfulness, and cognitive health."
            path="/dashboard/games"
            color="bg-[#4EB19D]"
          />

          <DashboardCard
            title="Self-Care Cards"
            icon={Heart}
            description="Discover self-care activities tailored to your needs, preferences, and current emotional state."
            path="/dashboard/self-care"
            color="bg-[#63C5AF]"
          />

          <DashboardCard
            title="Therapist"
            icon={Users}
            description="Connect with licensed therapists for professional mental health support and guidance."
            path="/dashboard/therapist"
            color="bg-[#77D8C0]"
          />
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-[#FFE4C4]/30">
          <h2 className="text-xl font-semibold text-[#014D4E] mb-4">
            Your Wellness Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FFE4C4]/20 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Weekly Mood Average</p>
              <p className="text-2xl font-bold text-[#014D4E]">Positive</p>
              <p className="text-xs text-green-600">↑ 12% from last week</p>
            </div>
            <div className="bg-[#FFE4C4]/20 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Journal Entries</p>
              <p className="text-2xl font-bold text-[#014D4E]">7</p>
              <p className="text-xs text-green-600">↑ 2 more than last week</p>
            </div>
            <div className="bg-[#FFE4C4]/20 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Mindfulness Minutes</p>
              <p className="text-2xl font-bold text-[#014D4E]">45</p>
              <p className="text-xs text-green-600">↑ 15 more than last week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
