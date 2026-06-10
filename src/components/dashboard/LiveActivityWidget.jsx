import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, Gift, Users, Layers, ArrowUpRight, Award } from 'lucide-react';

const FEED = [
  { msg: 'User 0x8A3…F92 claimed $10,000 USDT pool bonus', amount: '+$10,000', type: 'reward' },
  { msg: 'User 0x71B…D33 joined — welcome bonus credited', amount: '+$500', type: 'welcome' },
  { msg: 'User 0xC2E…A19 referred a friend', amount: '+$300', type: 'referral' },
  { msg: 'User 0xF44…B82 opened BTC/USD long 10x', amount: '+$8,240', type: 'trade' },
  { msg: 'User 0x3D1…77C staked $50,000 USDT at 142% APY', amount: '$50k', type: 'stake' },
  { msg: 'User 0x9A6…E34 withdrew $24,800 — processed', amount: '$24,800', type: 'withdrawal' },
  { msg: 'Top 3 weekly staking positions updated', amount: '$10k pool', type: 'leaderboard' },
  { msg: 'User 0xB5F…901 opened ETH short 25x', amount: '+$4,120', type: 'trade' },
];

const typeConfig = {
  reward:      { icon: Gift,        bg: 'bg-yellow-50',  iconColor: 'text-yellow-500',  dot: 'bg-yellow-400' },
  welcome:     { icon: Users,       bg: 'bg-emerald-50', iconColor: 'text-emerald-600', dot: 'bg-emerald-400' },
  referral:    { icon: Users,       bg: 'bg-purple-50',  iconColor: 'text-purple-600',  dot: 'bg-purple-400' },
  trade:       { icon: TrendingUp,  bg: 'bg-blue-50',    iconColor: 'text-blue-600',    dot: 'bg-blue-400' },
  stake:       { icon: Layers,      bg: 'bg-teal-50',    iconColor: 'text-teal-600',    dot: 'bg-teal-400' },
  withdrawal:  { icon: ArrowUpRight,bg: 'bg-orange-50',  iconColor: 'text-orange-500',  dot: 'bg-orange-400' },
  leaderboard: { icon: Award,       bg: 'bg-yellow-50',  iconColor: 'text-yellow-600',  dot: 'bg-yellow-400' },
};

export default function LiveActivityWidget() {
  const [items, setItems] = useState(() => FEED.slice(0, 4).map((f, i) => ({ ...f, key: i })));
  const [idx, setIdx] = useState(4);

  useEffect(() => {
    const t = setInterval(() => {
      const next = FEED[idx % FEED.length];
      setItems(prev => [{ ...next, key: Date.now() }, ...prev.slice(0, 3)]);
      setIdx(i => i + 1);
    }, 4000);
    return () => clearInterval(t);
  }, [idx]);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="font-display font-bold text-gray-900 text-sm">Live Activity</h3>
        </div>
        <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 tracking-wide">
          LIVE
        </span>
      </div>

      {/* Feed */}
      <div className="p-3 space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const cfg = typeConfig[item.type] || typeConfig.trade;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 28 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/60 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs font-semibold text-gray-800 leading-snug truncate">{item.msg}</p>
                </div>
                <span className="text-xs font-display font-bold text-emerald-600 flex-shrink-0">{item.amount}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}