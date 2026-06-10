import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StakingTracker({ balance = 0 }) {
  const stakedAmount = balance * 0.4; // mock: 40% staked
  const [earned, setEarned] = useState(stakedAmount * 0.15 * 0.3);

  useEffect(() => {
    if (stakedAmount <= 0) return;
    const dailyRate = (stakedAmount * 0.15) / (24 * 60 * 60);
    const t = setInterval(() => {
      setEarned(prev => prev + dailyRate * 2);
    }, 2000);
    return () => clearInterval(t);
  }, [stakedAmount]);

  return (
    <Card className="p-5 bg-white border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-4 h-4" style={{color:'hsl(174,65%,38%)'}} />
        <h3 className="font-display font-semibold text-gray-900">Staking Earnings</h3>
        <span className="ml-auto font-display text-xs px-2 py-0.5 rounded-full border font-medium" style={{background:'hsl(174,65%,96%)',color:'hsl(174,65%,38%)',borderColor:'hsl(174,65%,75%)'}}>15% / 24h</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <p className="font-display text-xs text-gray-500">Staked Amount</p>
          <p className="font-display text-2xl font-bold mt-1 text-gray-900">${stakedAmount > 0 ? stakedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="font-display text-xs text-gray-500">Earned today</p>
          <motion.p
            key={Math.floor(earned * 100)}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="font-display text-2xl font-bold mt-1 text-emerald-600"
          >
            +${earned.toFixed(4)}
          </motion.p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-display text-xs text-gray-600">Daily projected earnings</span>
          </div>
          <span className="font-display text-xs font-bold text-emerald-600">
            +${stakedAmount > 0 ? (stakedAmount * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="font-display text-xs text-gray-400">
          15% daily yield · <span className="font-medium" style={{color:'hsl(174,65%,38%)'}}>Highest verified rate on the market</span>
        </p>
      </div>
    </Card>
  );
}