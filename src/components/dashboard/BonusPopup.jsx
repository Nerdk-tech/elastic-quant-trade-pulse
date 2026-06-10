import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function BonusPopup({ userName, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      // Fire confetti
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#0d9488', '#f59e0b', '#fff', '#6366f1'],
        });
      }, 400);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="relative z-10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(145deg, hsl(174,65%,28%) 0%, hsl(185,68%,40%) 100%)' }}
          >
            <button onClick={close} className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Decorative orbs */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full bg-white/5" />

            <div className="relative p-8 text-center">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 shadow-xl"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>

              {/* Sparkles */}
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </motion.div>
                ))}
              </div>

              <h2 className="font-display text-3xl font-bold text-white mb-1">
                🎉 Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}!
              </h2>
              <p className="font-display text-white/80 text-sm mb-6">
                We've credited a special bonus to your account
              </p>

              {/* Big amount */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 mb-6"
              >
                <p className="font-display text-6xl font-bold text-white">$100</p>
                <p className="font-display text-white/70 text-sm mt-1">Welcome Bonus</p>
              </motion.div>

              <p className="font-display text-xs text-white/60 mb-6">
                Funds are ready to invest. Earn up to 15% daily APY on active trades.
              </p>

              <Button onClick={close}
                className="w-full h-12 bg-white text-primary hover:bg-white/90 font-display font-semibold text-base rounded-xl shadow-lg">
                Start Trading →
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}