import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Wallet, ArrowUpRight, ArrowDownToLine } from 'lucide-react';

const items = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Deposit', path: '/dashboard/deposit', icon: ArrowDownToLine },
  { label: 'Trade', path: '/dashboard/trade', icon: TrendingUp, center: true },
  { label: 'Portfolio', path: '/dashboard/portfolio', icon: Wallet },
  { label: 'Withdraw', path: '/dashboard/withdraw', icon: ArrowUpRight },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-end h-16 px-2">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          if (item.center) {
            return (
              <Link key={item.path} to={item.path}
                className="flex-1 flex flex-col items-center justify-center -mt-5 relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all ${isActive ? 'scale-110' : ''}`}
                  style={{ background: 'linear-gradient(135deg, hsl(174,65%,32%) 0%, hsl(185,68%,42%) 100%)' }}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[9px] font-display font-medium text-gray-500 mt-0.5">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link key={item.path} to={item.path}
              className="flex-1 flex flex-col items-center justify-center h-full gap-1 transition-all">
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-display font-medium transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}>{item.label}</span>
              {isActive && <div className="absolute bottom-0 w-5 h-0.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}