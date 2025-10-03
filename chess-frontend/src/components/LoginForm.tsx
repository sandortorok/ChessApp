import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, signInGuest, googleProvider } from "../firebase/config";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGuestLogin = async () => {
    const user = await signInGuest();
    navigate("/");
    console.log("Logged in as guest:", user.uid);
  };
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <a href="/">
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=teal&shade=500"
            className="mx-auto h-10 w-auto"
          />
        </a>
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-100">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-teal-400 hover:text-teal-300">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-teal-500 sm:text-sm/6"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-teal-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              Log In
            </button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Guest Sign In */}
          <button
            type="button"
            onClick={handleGuestLogin} // ide jön a firebase signInAnonymously hívás
            className="w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm0 18.182a8.182 8.182 0 1 1 8.182-8.182A8.192 8.192 0 0 1 10 18.182z" />
            </svg>
            Continue as Guest
          </button>
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center text-white bg-green-700 hover:bg-green-700/90 focus:ring-4 focus:outline-none focus:ring-green-700/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-green-700/55"
          >
            <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
              <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd" />
            </svg>
            Sign in with Google
          </button>


        </div>


        <p className="mt-10 text-center text-sm/6 text-gray-400">
          Don&apos;t have an account?{' '}
          <a href="/register" className="font-semibold text-teal-400 hover:text-teal-300">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
