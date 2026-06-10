import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, signInWithEmailAndPassword } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      let msg = err.message.replace("Firebase: ", "");
      if (err.code === "auth/invalid-credential") {
        msg = "Invalid email or password.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message.replace("Firebase: ", "") || "Google authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="13" cy="16" r="8" fill="hsl(174,65%,38%)" />
            <circle cx="22" cy="16" r="8" fill="hsl(174,65%,38%)" opacity="0.45" />
          </svg>
          <span className="font-display text-xl font-bold tracking-widest text-gray-900 uppercase">Cortex</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Welcome back</h1>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email Address*"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full h-10 border-b-2 border-gray-200 focus:border-[hsl(174,65%,38%)] text-base outline-none bg-transparent text-gray-900 placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password*"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full h-10 border-b-2 border-gray-200 focus:border-[hsl(174,65%,38%)] text-base outline-none bg-transparent text-gray-900 placeholder-gray-400 pr-10 transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: 'hsl(174,65%,38%)' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-12 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ background: 'hsl(174,65%,38%)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />Logging in...
              </span>
            ) : 'Log in'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">or</span></div>
        </div>

        <button onClick={handleGoogle} disabled={loading}
          className="w-full h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:border-[hsl(174,65%,38%)] hover:bg-gray-50 transition-all disabled:opacity-50">
          <GoogleIcon className="w-5 h-5" />
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: 'hsl(174,65%,38%)' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
