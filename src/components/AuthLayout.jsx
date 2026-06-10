import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Loader2 } from "lucide-react";

// Wraps /login and /register: if already logged in, redirect to /dashboard
export default function AuthLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(174,65%,38%)]" />
      </div>
    );
  }

  return <Outlet />;
}
