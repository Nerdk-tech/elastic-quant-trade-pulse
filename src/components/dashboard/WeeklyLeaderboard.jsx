import React from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const entries = [
  { rank: 1, wallet: '0xA1B…C9D', staked: '$284,200', reward: '+$4,200', color: 'from-yellow-400 to-amber-500', textColor: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  { rank: 2, wallet: '0x7E2…F11', staked: '$198,400', reward: '+$3,300', color: 'from-slate-400 to-slate-500',  textColor: 'text-slate-500',  bg: 'bg-slate-50',  border: 'border-slate-100' },
  { rank: 3, wallet: '0xB9C…44A', staked: '$142,800', reward: '+$2,500', color: 'from-amber-600 to-orange-500', textColor: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-100' },
];

const medals = ['🥇', '🥈', '🥉'];

export default function WeeklyLeaderboard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center border border-yellow-100">
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm leading-none">Weekly Leaderboard</h3>
              <p className="text-[10px] text-gray-400 font-display mt-0.5">Top stakers this week</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-display font-bold text-primary">$10,000</p>
            <p className="text-[10px] text-gray-400 font-display">USDT pool</p>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="p-3 space-y-2">
        {entries.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
            className={`flex items-center gap-3 p-3 rounded-xl border ${e.bg} ${e.border}`}
          >
            {/* Rank badge */}
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${e.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-sm">{medals[i]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xs font-bold text-gray-900">{e.wallet}</p>
              <p className="font-display text-[10px] text-gray-400">Staked: {e.staked}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`font-display text-sm font-bold ${e.textColor}`}>{e.reward}</p>
              <p className="font-display text-[10px] text-gray-400">reward</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer countdown */}
      <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
        <p className="font-display text-[10px] text-gray-400">Resets Monday 00:00 UTC</p>
        <span className="font-display text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded-full">3d 14h 22m</span>
      </div>
    </div>
  );
}