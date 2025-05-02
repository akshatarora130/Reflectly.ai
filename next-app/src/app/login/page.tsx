"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-gray-50">
      {/* Left Column - Branding */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              className="relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white  rounded-full p-4">
                {/* Replacing the bot icon with logo.svg */}
                <img src="/logo.svg" alt="Reflectly Logo" className="h-10 w-10" />
              </div>
            </motion.div>
          </div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#014D4E] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Reflectly.AI
          </motion.h1>

          <motion.p
            className="text-center mb-8 text-gray-600 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your personal AI companion for mental wellness
          </motion.p>

          <motion.div
            className="space-y-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg border border-gray-200 relative overflow-hidden group"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-[#FFE4C4]/20 to-transparent w-[200%] opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />

              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-500">
              By signing in, you agree to our
              <a href="#" className="text-[#014D4E] hover:underline ml-1">
                Terms of Service
              </a>{" "}
              and
              <a href="#" className="text-[#014D4E] hover:underline ml-1">
                Privacy Policy
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column - Features/Benefits */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#014D4E] to-[#013638] text-white p-16 items-center justify-center">
        <motion.div
          className="max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6">
            Meet Aura, your AI companion
          </h2>

          <div className="space-y-6">
            {[
              {
                title: "Personalized Support",
                description:
                  "Get tailored mental wellness guidance based on your unique needs and preferences.",
              },
              {
                title: "Available 24/7",
                description:
                  "Access support whenever you need it, day or night, with no waiting or appointments.",
              },
              {
                title: "Private & Secure",
                description:
                  "Your conversations are private and protected with enterprise-grade security.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              >
                <div className="bg-white/10 rounded-full p-2 mt-1">
                  <Sparkles className="h-4 w-4 text-[#FFE4C4]" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-[#FFE4C4]">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 mt-1">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-10 flex items-center gap-2 text-[#FFE4C4]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">Discover more</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
