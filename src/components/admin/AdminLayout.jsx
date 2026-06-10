import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, TrendingUp, LogOut, Menu, X,
  Shield, PieChart, ArrowDownToLine, ArrowUpRight, MessageCircle, ChevronRight
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const navItems = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Users & Balances', path: '/admin/balances', icon: Users },
  { label: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpRight },
  { label: 'Deposits', path: '/admin/deposits', icon: ArrowDownToLine },
  { label: 'Investments', path: '/admin/investments', icon: TrendingUp },
  { label: 'Support', path: '/admin/support', icon: MessageCircle },
  { label: 'Security Codes', path: '/admin/impersonate', icon: Shield },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col shadow-sm`}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100 bg-gradient-to-r from-red-600 to-orange-500">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-base font-bold text-white tracking-wide">ADMIN</span>
          </Link>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto pt-4">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 w-full">
            <TrendingUp className="w-4 h-4" /> User Dashboard
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 w-full">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-14 border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 bg-white sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-red-600 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">ADMIN PANEL</span>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
              {(user.full_name || user.email || 'A')[0].toUpperCase()}
            </div>
            <span className="hidden sm:block text-xs font-medium">{user.full_name || user.email}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
