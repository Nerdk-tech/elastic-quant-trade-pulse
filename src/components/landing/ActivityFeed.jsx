import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Gift, Users, Zap, ArrowDownCircle, Star } from 'lucide-react';

const FEED_ITEMS = [
  { msg: 'User 0x8A3…F92 just claimed the $10,000 weekly USDT prize 🏆', type: 'reward', amount: '+$10,000' },
  { msg: 'User 0x71B…D33 joined and received $500 welcome bonus 🎉', type: 'welcome', amount: '+$500' },
  { msg: 'User 0xF44…B82 opened BTC/USD long 10x — profit +$8,240', type: 'trade', amount: '+$8,240' },
  { msg: 'User 0xC2E…A19 referred a friend — bonus earned instantly', type: 'referral', amount: '+$300' },
  { msg: 'User 0x3D1…77C staked $50,000 USDT at 15% daily', type: 'stake', amount: '15%/day' },
  { msg: 'User 0x9A6…E34 withdrew $24,800 — processed in 2 hours', type: 'withdrawal', amount: '$24,800' },
  { msg: 'User 0xB5F…901 opened ETH short 25x — AI signal hit target', type: 'trade', amount: '+$4,120' },
  { msg: 'User 0xD82…C41 AI bot auto-closed PEPE 50x +$31,800 profit 🚀', type: 'trade', amount: '+$31,800' },
  { msg: 'User 0x55A…B77 staking rewards auto-compounded +$1,200', type: 'stake', amount: '+$1,200' },
  { msg: 'User 0xAA1…F03 opened NVDA long 5x — +$6,540 unrealized P&L', type: 'trade', amount: '+$6,540' },
];

const typeConfig = {
  reward: { color: 'from-yellow-500 to-amber-500', dot: 'bg-yellow-400', icon: Star, label: 'REWARD' },
  welcome: { color: 'from-emerald-500 to-teal-500', dot: 'bg-emerald-400', icon: Gift, label: 'BONUS' },
  trade: { color: 'from-blue-500 to-indigo-500', dot: 'bg-blue-400', icon: TrendingUp, label: 'TRADE' },
  referral: { color: 'from-purple-500 to-pink-500', dot: 'bg-purple-400', icon: Users, label: 'REFERRAL' },
  stake: { color: 'from-teal-500 to-cyan-500', dot: 'bg-teal-400', icon: Zap, label: 'STAKING' },
  withdrawal: { color: 'from-orange-500 to-red-400', dot: 'bg-orange-400', icon: ArrowDownCircle, label: 'WITHDRAW' },
};

export default function ActivityFeed() {
  const [items, setItems] = useState(FEED_ITEMS.slice(0, 5).map((x, i) => ({ ...x, key: i })));
  const [idx, setIdx] = useState(5);
  const [totalPayout, setTotalPayout] = useState(2847340);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = { ...FEED_ITEMS[idx % FEED_ITEMS.length], key: Date.now() };
      setItems(prev => [next, ...prev.slice(0, 5)]);
      setIdx(i => i + 1);
      setTotalPayout(p => p + Math.floor(Math.random() * 5000 + 1000));
    }, 3000);
    return () => clearInterval(interval);
  }, [idx]);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="font-display font-bold text-xs uppercase tracking-widest mb-3" style={{ color: 'hsl(174,65%,38%)' }}>
              Platform Activity
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Real-time<br /><span style={{ color: 'hsl(174,65%,38%)' }}>activity feed</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8 font-display">
              Watch traders win big in real-time. Every trade, reward, referral and staking event — broadcast live.
            </p>

            {/* Live total payout counter */}
            <div className="mb-6 p-4 rounded-2xl border-2 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg,hsl(174,65%,30%),hsl(185,68%,42%))' }}>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <p className="text-xs font-display font-bold uppercase tracking-widest text-white/70 mb-1">Total Paid Out to Users</p>
              <motion.p key={totalPayout} className="font-display text-3xl font-bold text-white">
                ${totalPayout.toLocaleString()}
              </motion.p>
              <p className="text-xs text-white/60 font-display mt-1">↑ Updates in real-time</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Welcome bonus', value: '$500', desc: 'On first registration — no deposit', icon: Gift },
                { label: 'Referral bonus', value: '$300', desc: 'Per successful referral', icon: Users },
                { label: 'Daily staking rate', value: '15%', desc: 'Compounded every 24 hours', icon: Zap },
                { label: 'Weekly pool', value: '$10,000', desc: 'Top 3 stakers win every Monday', icon: Star },
              ].map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(174,65%,95%)' }}>
                      <Icon className="w-4 h-4" style={{ color: 'hsl(174,65%,38%)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-semibold text-gray-900 text-sm">{b.label}</p>
                      <p className="text-xs text-gray-500 font-display">{b.desc}</p>
                    </div>
                    <span className="font-display text-xl font-bold" style={{ color: 'hsl(174,65%,38%)' }}>{b.value}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Live Feed Panel */}
          <div className="bg-[#0d1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2" style={{ background: 'hsl(174,65%,25%)' }}>
              <motion.div className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="font-display font-bold text-sm text-white">Live Activity</span>
              <span className="ml-auto text-xs text-white/50 font-display">● LIVE</span>
            </div>
            <div className="p-4 space-y-2 min-h-[400px]">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const cfg = typeConfig[item.type] || typeConfig.trade;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: -20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/85 leading-relaxed font-display">{item.msg}</p>
                      </div>
                      <span className={`text-xs font-bold font-display px-2 py-0.5 rounded-full whitespace-nowrap bg-gradient-to-r ${cfg.color} text-white`}>
                        {item.amount}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="px-4 py-3 border-t border-white/10 text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <p className="text-xs text-white/40 font-display">Refreshes every 3s · All transactions are live</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}