import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, signInGuest, googleProvider } from "@/lib/firebase/config";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await signInGuest();
      navigate("/");
      console.log("Logged in as guest:", user.uid);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.1),transparent_50%)]" />
      </div>

      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block group">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <img
                alt="Chess Arena"
                src="logo.png"
                className="relative mx-auto h-16 w-auto transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </a>
          <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to continue your chess journey
          </p>
        </div>

        {/* Main card */}
        <div className="relative backdrop-blur-xl bg-gray-900/50 rounded-2xl shadow-2xl shadow-teal-500/10 border border-teal-500/20 p-8">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />

          <form onSubmit={handleSubmit} className="relative space-y-6">
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
                  placeholder="you@example.com"
                />
                <div className="absolute inset-0 rounded-xl bg-teal-500/0 group-hover:bg-teal-500/5 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 rounded-xl bg-teal-500/0 group-hover:bg-teal-500/5 pointer-events-none transition-colors" />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Guest login */}
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-2 rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18.182a8.182 8.182 0 1 1 8.182-8.182A8.192 8.192 0 0 1 10 18.182z" />
              </svg>
              <span>Guest</span>
            </button>

            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-2 rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 18 19">
                <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
            Create one now
          </a>
        </p>
      </div>
    </div>
  );
}