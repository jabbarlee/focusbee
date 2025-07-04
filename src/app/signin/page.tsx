"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Star } from "lucide-react";

export default function SigninPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard or home page after successful signin
      router.push("/");
    }, 2000);
  };

  const handleBackToFocus = () => {
    router.back();
  };

  const handleSignUpRedirect = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-bee-gradient relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 gap-4 p-8 transform rotate-12 scale-150">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-amber-400/60 transform rotate-45"
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-center p-6 relative">
          <button
            onClick={handleBackToFocus}
            className="absolute left-6 flex items-center justify-center gap-2 px-6 py-3 bg-white/80 hover:bg-white text-amber-800 font-bold rounded-xl transition-colors duration-200 h-12"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-900">
              Focus<span className="text-amber-600">Bee</span>
            </h1>
            <p className="text-sm text-amber-700">Welcome Back</p>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Welcome section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-2">
                Welcome Back! 🐝
              </h2>

              <p className="text-amber-700 leading-relaxed">
                Ready to continue your focus journey? Let's get back to being
                productive together! ✨
              </p>
            </div>

            {/* Signin form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field */}
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Your hive address 📧
                  </label>
                  <div className="relative">
                    <Mail
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors duration-200 bg-white/80"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Your secret buzz 🔐
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors duration-200 bg-white/80"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-amber-700 hover:text-amber-800 underline transition-colors duration-200"
                  >
                    Forgot your buzz? 🤔
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-4 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Buzzing you in...
                    </>
                  ) : (
                    <>
                      <Star
                        size={20}
                        className="transition-transform duration-300 group-hover:rotate-180"
                      />
                      Let's Focus! 🎯
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-amber-700">
                  New to the hive?{" "}
                  <button
                    onClick={handleSignUpRedirect}
                    className="font-semibold text-amber-800 hover:text-amber-900 underline transition-colors duration-200"
                  >
                    Join us here
                  </button>
                </p>
              </div>
            </div>

            {/* Companion message */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 shadow-lg">
              <div className="text-center">
                <p className="text-amber-700 text-sm leading-relaxed">
                  "Welcome back, busy bee! I've missed our focus sessions
                  together. Ready to dive back into productivity? 🚀"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
