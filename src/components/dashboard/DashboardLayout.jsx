import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Wallet, History, LogOut, Menu, X, ChevronRight, Gift, Settings, HelpCircle, Bell, ArrowDownToLine, ShieldAlert, ArrowUpRight, Zap, Coins } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useLanguage } from '@/lib/LanguageContext';
import { haptic } from '@/lib/haptics';
import ConnectWalletButton from '@/components/shared/ConnectWalletButton';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import BottomNav from '@/components/dashboard/BottomNav';
import SupportWidget from '@/components/dashboard/SupportWidget';
import BonusBulletin from '@/components/dashboard/BonusBulletin';
import ImpersonationBanner from '@/components/dashboard/ImpersonationBanner';
import { getImpersonatedUser } from '@/lib/impersonation';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const impersonated = getImpersonatedUser();
  const { t } = useLanguage();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navItems = [
    { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
    { key: 'deposit', path: '/dashboard/deposit', icon: ArrowDownToLine },
    { key: 'withdraw', path: '/dashboard/withdraw', icon: ArrowUpRight },
    { key: 'trade', path: '/dashboard/trade', icon: TrendingUp },
    { key: 'portfolio', path: '/dashboard/portfolio', icon: Wallet },
    { key: 'tradeHistory', path: '/dashboard/trade-history', icon: History },
    { key: 'staking', path: '/dashboard/staking', icon: Zap },
    { key: 'airdrop', path: '/dashboard/airdrop', icon: Coins },
  ];

  const secondaryItems = [
    { key: 'referrals', path: '/dashboard/referrals', icon: Gift },
    { key: 'notifications', path: '/dashboard/notifications', icon: Bell },
    { key: 'settings', path: '/dashboard/settings', icon: Settings },
    { key: 'support', path: '/dashboard/support', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    haptic.medium();
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => { setSidebarOpen(false); haptic.tap(); }} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100 flex-shrink-0" style={{ background: 'hsl(174,65%,38%)' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="white" opacity="0.2" />
              <circle cx="10" cy="16" r="5" fill="white" />
              <circle cx="22" cy="16" r="5" fill="white" opacity="0.5" />
            </svg>
            <span className="font-display text-base font-semibold tracking-widest text-white uppercase">cortex.</span>
          </Link>
          <button className="lg:hidden ml-auto text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 pt-4 overflow-y-auto">
          <p className="text-xs font-display font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">{t('nav.main')}</p>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => { setSidebarOpen(false); haptic.tap(); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all ${
                  isActive ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                style={isActive ? { background: 'hsl(174,65%,38%)' } : {}}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t(`nav.${item.key}`)}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
              </Link>
            );
          })}

          <div className="mt-4 mb-2">
            <p className="text-xs font-display font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">{t('nav.account')}</p>
            {secondaryItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => { setSidebarOpen(false); haptic.tap(); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  style={isActive ? { background: 'hsl(174,65%,38%)' } : {}}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{t(`nav.${item.key}`)}</span>
                  {item.key === 'referrals' && (
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">$300</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom nav — logout prominent */}
        <div className="p-3 border-t border-gray-100 space-y-1 flex-shrink-0">
          {user?.role === 'admin' && (
            <Link to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium text-red-500 hover:text-red-600 hover:bg-red-50 w-full transition-all">
              <ShieldAlert className="w-4 h-4" />
              {t('nav.adminPanel')}
            </Link>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-semibold text-white w-full transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}>
            <LogOut className="w-4 h-4" />
            {t('buttons.logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <ImpersonationBanner />
        {/* Topbar */}
        <header className="h-14 border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 bg-white sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden text-gray-600 active:scale-90 transition-transform" onClick={() => { setSidebarOpen(true); haptic.tap(); }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          {impersonated && (
            <div className="flex items-center gap-2 mr-3">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                {(impersonated.full_name || impersonated.email || '?')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-orange-600 hidden sm:block">{impersonated.full_name || impersonated.email}</span>
            </div>
          )}
          <LanguageSwitcher variant="dropdown" />
          <ConnectWalletButton size="sm" />
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <BottomNav />
      <SupportWidget />
      <BonusBulletin />
    </div>
  );
}