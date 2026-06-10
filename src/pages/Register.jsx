import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, createUserWithEmailAndPassword } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-gray-100'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-600' : score === 3 ? 'text-blue-500' : 'text-emerald-600'}`}>
        {labels[score]} Password
      </p>
    </div>
  );
}

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeUpdates, setAgreeUpdates] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!agreeTerms) { 
      setError("Please agree to the Terms of Service and Privacy Policy"); 
      return; 
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      let msg = err.message.replace("Firebase: ", "");
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered.";
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

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Create an account</h1>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="First Name*"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                disabled={loading}
                className="w-full h-10 border-b-2 border-gray-200 focus:border-[hsl(174,65%,38%)] text-base outline-none bg-transparent text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name*"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                disabled={loading}
                className="w-full h-10 border-b-2 border-gray-200 focus:border-[hsl(174,65%,38%)] text-base outline-none bg-transparent text-gray-900 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

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
              <div className="absolute right-0 top-2 flex items-center gap-2">
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div onClick={() => !loading && setAgreeUpdates(!agreeUpdates)}
                className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${agreeUpdates ? 'border-[hsl(174,65%,38%)] bg-[hsl(174,65%,38%)]' : 'border-gray-300 hover:border-[hsl(174,65%,38%)]/50'}`}>
                {agreeUpdates && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-600 leading-snug">I want to be sent emails about my account and service updates.</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <div onClick={() => !loading && setAgreeTerms(!agreeTerms)}
                className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${agreeTerms ? 'border-[hsl(174,65%,38%)] bg-[hsl(174,65%,38%)]' : 'border-gray-300 hover:border-[hsl(174,65%,38%)]/50'}`}>
                {agreeTerms && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-600 leading-snug">
                I have read and agree to the{' '}
                <Link to="/" className="font-semibold hover:underline" style={{ color: 'hsl(174,65%,38%)' }}>Terms of Service</Link>
                {' '}as well as the{' '}
                <Link to="/" className="font-semibold hover:underline" style={{ color: 'hsl(174,65%,38%)' }}>Privacy Policy</Link>.
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading || !agreeTerms}
            className="w-full h-12 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ background: agreeTerms ? 'hsl(174,65%,38%)' : 'hsl(174,65%,70%)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />Creating account...
              </span>
            ) : 'Create account'}
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
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'hsl(174,65%,38%)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
