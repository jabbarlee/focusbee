"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/actions/auth";
import { Button } from "@/components/ui";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Star } from "lucide-react";

export default function SigninPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setIsLoading(true);

    try {
      const result = await signInWithEmail(formData.email, formData.password);

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
      console.error("Signin error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFocus = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-bee-soft relative overflow-hidden">
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
            variant="outline"
            className="absolute left-6 flex items-center gap-2 px-6 py-3 h-12"
          >
            <ArrowLeft size={20} />
            Home
          </Button>
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
              <h2 className="text-4xl font-bold text-amber-900 mb-2">
                Welcome Back!
              </h2>

              <p className="text-amber-700 leading-relaxed">
                Ready to continue your focus journey?
              </p>
            </div>

            {/* Signin form */}
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
                {/* Email field */}
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Your email
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 hover:border-amber-300 focus:border-amber-500 focus:outline-none transition-colors duration-200 bg-white/80 rounded-xl"
                      placeholder="your@buzz.com"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-2">
                    Your password
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
                      className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 hover:border-amber-300 focus:border-amber-500 focus:outline-none transition-colors duration-200 bg-white/80 rounded-xl"
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
                <div className="text-left">
                  <p className="text-sm text-amber-700">
                    Forgot your buzz?{" "}
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-amber-600 hover:text-amber-800 hover:underline transition-colors duration-200"
                    >
                      Reset it here
                    </Link>
                  </p>
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
                      Buzzing you in...
                    </>
                  ) : (
                    <>
                      <Star
                        size={20}
                        className="transition-transform duration-300 group-hover:rotate-180"
                      />
                      Let's Focus!
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-amber-700">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-amber-600 hover:text-amber-800 hover:underline transition-colors duration-200"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
