"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/actions/auth";
import { Button } from "@/components/ui";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Star } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match! Please check and try again.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpWithEmail(
        formData.name,
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess(result.message);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFocus = () => {
    router.back();
  };

  const handleSignInRedirect = () => {
    router.push("/signin");
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
          <Button
            onClick={handleBackToFocus}
            variant="ghost"
            className="absolute left-6 flex items-center gap-2 px-6 py-3 h-12"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-900">
              Focus<span className="text-amber-600">Bee</span>
            </h1>
            <p className="text-sm text-amber-700">Join the Hive</p>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {" "}
            {/* Welcome section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-2">
                Welcome to the Hive! 🐝
              </h2>

              <p className="text-amber-700 leading-relaxed">
                Your bee companion is excited to help you track your focus
                journey! Let's get you buzzing with productivity. ✨
              </p>
            </div>
            {/* Signup form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-amber-200">
              {/* Error/Success messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name field */}
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    What should we call you? 🍯
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors duration-200 bg-white/80"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

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
                    Create a secret buzz 🔐
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

                {/* Confirm password field */}
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Confirm your secret buzz 🔒
                  </label>
                  <div className="relative">
                    <Lock
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors duration-200 bg-white/80"
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating your hive account...
                    </>
                  ) : (
                    <>
                      <Star
                        size={20}
                        className="transition-transform duration-300 group-hover:rotate-180"
                      />
                      Join the Hive! 🎉
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-amber-700">
                  Already part of the hive?{" "}
                  <Button
                    onClick={handleSignInRedirect}
                    variant="ghost"
                    className="font-semibold underline p-0 h-auto"
                  >
                    Sign in here
                  </Button>
                </p>
              </div>
            </div>{" "}
            {/* Companion message */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 shadow-lg">
              <div className="text-center">
                <p className="text-amber-700 text-sm leading-relaxed">
                  "I can't wait to be your focus buddy! Together we'll build
                  amazing habits and celebrate every milestone. Let's make
                  productivity feel like play! 🎯"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
