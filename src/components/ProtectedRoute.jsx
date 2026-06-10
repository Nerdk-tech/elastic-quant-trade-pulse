import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Loader2 } from "lucide-react";

// Works as a layout route (<Route element={<ProtectedRoute />}>) for React Router v6
export default function ProtectedRoute({ unauthenticatedElement }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(174,65%,38%)]" />
      </div>
    );
  }

  if (!authenticated) {
    return unauthenticatedElement ?? <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
