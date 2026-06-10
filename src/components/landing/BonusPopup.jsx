import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Gift, Zap } from 'lucide-react';

export default function BonusPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed top-20 left-4 right-4 sm:left-auto sm:right-4 z-50 w-auto sm:w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden border border-white/20"
          style={{ background: 'linear-gradient(135deg,hsl(174,65%,28%) 0%,hsl(185,68%,40%) 100%)' }}
        >
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />

          <button onClick={() => setVisible(false)}
            className="absolute top-3 right-3 text-white/60 hover:text-white z-10">
            <X className="w-4 h-4" />
          </button>

          <div className="p-5 relative">
            {/* Pulsing badge */}
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0"
              >
                <Gift className="w-4 h-4 text-yellow-900" />
              </motion.div>
              <span className="text-xs font-display font-bold text-yellow-300 uppercase tracking-widest">Limited Offer</span>
            </div>

            <h3 className="font-display font-bold text-white text-xl leading-tight mb-1">
              Claim Your <span className="text-yellow-300">$100</span> Bonus
            </h3>
            <p className="text-white/70 font-display text-xs mb-4 leading-relaxed">
              Free welcome bonus — no deposit needed. Plus 1-week fee-free trading.
            </p>

            <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-white/10">
              <Zap className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
              <span className="text-xs text-white/80 font-display">15% daily staking · $300 referral bonus</span>
            </div>

            <Link to="/register" onClick={() => setVisible(false)}>
              <button className="w-full py-2.5 rounded-full bg-red-500 hover:bg-red-400 text-white font-display font-bold text-sm transition-colors shadow-lg">
                🎉 Claim $100 Bonus →
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}