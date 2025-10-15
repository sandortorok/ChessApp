// src/components/RegisterForm.tsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor = 
    passwordStrength >= 75 ? "bg-green-500" :
    passwordStrength >= 50 ? "bg-yellow-500" :
    passwordStrength >= 25 ? "bg-orange-500" : "bg-red-500";

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
            Join Chess Arena
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Create your account and start playing
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 rounded-xl bg-teal-500/0 group-hover:bg-teal-500/5 pointer-events-none transition-colors" />
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {passwordStrength >= 75 ? "Strong password" :
                     passwordStrength >= 50 ? "Good password" :
                     passwordStrength >= 25 ? "Weak password" : "Very weak password"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 rounded-xl bg-teal-500/0 group-hover:bg-teal-500/5 pointer-events-none transition-colors" />
              </div>
              {/* Match indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {password === confirmPassword ? (
                    <>
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-green-400">Passwords match</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-red-400">Passwords don't match</p>
                    </>
                  )}
                </div>
              )}
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

            {/* Success message */}
            {success && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-400">Registration successful!</p>
                  <p className="text-xs text-green-400/70 mt-1">You can now sign in with your account.</p>
                </div>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </span>
            </button>
          </form>

          {/* Password requirements */}
          <div className="mt-4 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <p className="text-xs font-medium text-gray-300 mb-2">Password requirements:</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <span className={password.length >= 6 ? "text-green-400" : "text-gray-500"}>•</span>
                At least 6 characters
              </li>
              <li className="flex items-center gap-2">
                <span className={/[A-Z]/.test(password) ? "text-green-400" : "text-gray-500"}>•</span>
                One uppercase letter (recommended)
              </li>
              <li className="flex items-center gap-2">
                <span className={/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) ? "text-green-400" : "text-gray-500"}>•</span>
                One number or special character (recommended)
              </li>
            </ul>
          </div>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
            Sign in instead
          </a>
        </p>
      </div>
    </div>
  );
}