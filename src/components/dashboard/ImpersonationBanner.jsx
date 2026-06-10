import React from 'react';
import { ShieldAlert, X, ArrowLeft } from 'lucide-react';
import { stopImpersonation, getImpersonatedUser } from '@/lib/impersonation';

export default function ImpersonationBanner() {
  const impersonated = getImpersonatedUser();
  if (!impersonated) return null;

  const handleExit = () => {
    stopImpersonation();
    window.location.href = '/admin/impersonate';
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 z-50 relative flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>
        <div className="text-sm">
          <span className="font-bold">Admin Mode:</span>{' '}
          <span>Viewing as <span className="font-bold">{impersonated.full_name || impersonated.email}</span></span>
          <span className="text-white/70 text-xs ml-2">({impersonated.email})</span>
        </div>
      </div>
      <button
        onClick={handleExit}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Exit Impersonation
      </button>
    </div>
  );
}