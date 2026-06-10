import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Gift, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { haptic } from '@/lib/haptics';

export default function BonusBulletin() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show once per day
    const lastShown = localStorage.getItem('bonus_bulletin_date');
    const today = new Date().toDateString();
    if (lastShown !== today) {
      const timer = setTimeout(() => {
        setVisible(true);
        haptic.medium();
        localStorage.setItem('bonus_bulletin_date', today);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    haptic.tap();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(174,72%,20%) 0%, hsl(185,65%,32%) 100%)', border: '1px solid rgba(255,255,255,0.15)' }}>
            {/* Decorative sparkle */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="relative p-4">
              <button onClick={dismiss}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
              <div className="flex items-start gap-3 pr-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-bold text-white text-sm leading-tight">
                    {t('bonus.headline')}
                  </p>
                  <p className="text-white/70 text-xs mt-1 leading-relaxed">
                    {t('bonus.body')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Link to="/dashboard/deposit" onClick={() => { haptic.medium(); dismiss(); }}
                  className="flex-1 text-center py-2 rounded-xl bg-white text-xs font-display font-bold transition-all hover:bg-white/90 active:scale-95"
                  style={{ color: 'hsl(174,72%,25%)' }}>
                  {t('bonus.cta')}
                </Link>
                <button onClick={dismiss}
                  className="px-3 py-2 rounded-xl bg-white/15 text-white text-xs font-display hover:bg-white/25 transition-all border border-white/20">
                  {t('bonus.dismiss')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}