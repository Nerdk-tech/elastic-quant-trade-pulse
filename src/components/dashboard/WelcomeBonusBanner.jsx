import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';

export default function WelcomeBonusBanner({ userName }) {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="relative rounded-2xl overflow-hidden p-4 pr-10 text-white"
          style={{background:'linear-gradient(135deg,hsl(174,65%,30%) 0%,hsl(185,68%,42%) 100%)'}}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,hsl(174_72%_46%/0.05),transparent)]" />
          <div className="flex items-center gap-4 relative">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-base text-white">
                🎉 Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}! Your $100 welcome bonus is ready.
              </p>
              <p className="font-display text-xs text-white/75 mt-0.5">
                Bonus credited to your wallet. Also earn $300 for every friend you refer.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-display text-3xl font-bold text-white">$100</p>
              <p className="font-display text-xs text-white/70">welcome bonus</p>
            </div>
          </div>
          <button onClick={() => setVisible(false)} className="absolute top-3 right-3 text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}