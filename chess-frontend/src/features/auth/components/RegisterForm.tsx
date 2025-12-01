import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import {
  AuthContainer,
  AuthHeader,
  AuthCard,
  AuthInput,
  AuthButton,
  AuthAlert,
  PasswordStrength,
  PasswordRequirements,
  PasswordMatchIndicator,
} from './shared';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader
        title="Join Chess Arena"
        subtitle="Create your account and start playing"
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
            <AuthInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          <div>
            <AuthInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordMatchIndicator
              password={password}
              confirmPassword={confirmPassword}
            />
          </div>

          {error && <AuthAlert type="error" message={error} />}

          {success && (
            <AuthAlert
              type="success"
              message="Registration successful!"
              details="You can now sign in with your account."
            />
          )}

          <AuthButton isLoading={isLoading} loadingText="Creating account...">
            Create Account
          </AuthButton>
        </form>

        <PasswordRequirements password={password} />

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            Sign in instead
          </a>
        </p>
      </AuthCard>
    </AuthContainer>
  );
}
