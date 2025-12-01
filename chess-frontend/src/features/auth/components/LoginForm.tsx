import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, signInGuest, googleProvider } from '@/lib/firebase/config';
import {
  AuthContainer,
  AuthHeader,
  AuthCard,
  AuthInput,
  AuthButton,
  AuthAlert,
  AuthDivider,
  SocialButton,
} from './shared';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
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
      navigate('/');
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
      navigate('/');
      console.log('Logged in as guest:', user.uid);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to continue your chess journey"
      />

      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-200">
                Password
              </span>
              <a
                href="#"
                className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="block w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
              />
              <div className="absolute inset-0 rounded-xl bg-teal-500/0 group-hover:bg-teal-500/5 pointer-events-none transition-colors" />
            </div>
          </div>

          {error && <AuthAlert type="error" message={error} />}

          <AuthButton isLoading={isLoading} loadingText="Signing in...">
            Sign In
          </AuthButton>
        </form>{' '}
        <AuthDivider />
        <div className="grid grid-cols-2 gap-3">
          <SocialButton
            onClick={handleGuestLogin}
            disabled={isLoading}
            label="Guest"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18.182a8.182 8.182 0 1 1 8.182-8.182A8.192 8.192 0 0 1 10 18.182z" />
              </svg>
            }
          />

          <SocialButton
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            label="Google"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 18 19">
                <path
                  fillRule="evenodd"
                  d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
        </div>
      </AuthCard>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <a
          href="/register"
          className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          Create one now
        </a>
      </p>
    </AuthContainer>
  );
}
