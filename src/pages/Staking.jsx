import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, TrendingUp, Gift, Clock, Star, Plus, CheckCircle2, ArrowDownRight, Loader2, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLivePrices } from '@/hooks/useLivePrices';
import { getImpersonatedUser } from '@/lib/impersonation';
import { differenceInHours, differenceInDays } from 'date-fns';

const STAKING_ASSETS = [
  // Stablecoins
  { symbol: 'USDT_ERC20', name: 'Tether (ERC20)', apy: 25.0, min: 500, lockDays: 0, coingeckoId: 'tether', isStable: true },
  { symbol: 'USDT_TRC20', name: 'Tether (TRC20)', apy: 28.0, min: 500, lockDays: 0, coingeckoId: 'tether', isStable: true },
  { symbol: 'USDT_BEP20', name: 'Tether (BEP20)', apy: 26.5, min: 500, lockDays: 0, coingeckoId: 'tether', isStable: true },
  // Crypto
  { symbol: 'BTC', name: 'Bitcoin', apy: 8.5, min: 100, lockDays: 30, coingeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', apy: 12.0, min: 50, lockDays: 14, coingeckoId: 'ethereum' },
  { symbol: 'SOL', name: 'Solana', apy: 18.5, min: 50, lockDays: 7, coingeckoId: 'solana' },
  { symbol: 'BNB', name: 'BNB', apy: 15.0, min: 50, lockDays: 14, coingeckoId: 'bnb' },
  { symbol: 'ADA', name: 'Cardano', apy: 10.5, min: 30, lockDays: 7, coingeckoId: 'cardano' },
  { symbol: 'DOT', name: 'Polkadot', apy: 14.0, min: 30, lockDays: 14, coingeckoId: 'polkadot' },
  { symbol: 'LINK', name: 'Chainlink', apy: 11.0, min: 50, lockDays: 7, coingeckoId: 'chainlink' },
  { symbol: 'AVAX', name: 'Avalanche', apy: 16.5, min: 50, lockDays: 14, coingeckoId: 'avalanche-2' },
];

function calcDailyEarning(amountStaked, apy) {
  return (amountStaked * (apy / 100)) / 365;
}

function calcAccruedEarning(pool) {
  if (!pool.created_date || pool.status !== 'active') return pool.earned || 0;
  const hoursElapsed = differenceInHours(new Date(), new Date(pool.created_date));
  const dailyRate = calcDailyEarning(pool.amount_staked, pool.apy);
  const lastClaim = pool.last_claim_date ? new Date(pool.last_claim_date) : new Date(pool.created_date);
  const hoursSinceClaim = differenceInHours(new Date(), lastClaim);
  return (dailyRate / 24) * hoursSinceClaim;
}

export default function Staking() {
  const [user, setUser] = useState(null);
  const [stakeModal, setStakeModal] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [tick, setTick] = useState(0);
  const impersonated = getImpersonatedUser();
  const qc = useQueryClient();
  const { assets } = useLivePrices(60000);

  useEffect(() => { base44.auth.me().then(setUser); }, []);
  // Re-render every 10s to update live earnings
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 10000); return () => clearInterval(t); }, []);

  const activeUserId = impersonated?.id || user?.id;

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets', activeUserId],
    queryFn: () => base44.entities.Wallet.filter({ user_id: activeUserId }),
    enabled: !!activeUserId,
  });
  const wallet = wallets[0];

  const { data: pools = [] } = useQuery({
    queryKey: ['staking-pools', activeUserId],
    queryFn: () => base44.entities.StakingPool.filter({ user_id: activeUserId }, '-created_date'),
    enabled: !!activeUserId,
  });

  const activePools = pools.filter(p => p.status === 'active');
  const totalStaked = activePools.reduce((s, p) => s + (p.amount_staked || 0), 0);
  const totalEarned = pools.reduce((s, p) => s + (p.earned || 0), 0);

  const startStakeMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(stakeAmount);
      if (isNaN(amt) || amt < (stakeModal.min || 30)) throw new Error(`Minimum stake is $${stakeModal.min}`);
      if (amt > (wallet?.balance || 0)) throw new Error('Insufficient balance');
      const liveAsset = assets.find(a => a.symbol === stakeModal.symbol);
      await base44.entities.StakingPool.create({
        user_id: activeUserId,
        asset_symbol: stakeModal.symbol,
        asset_name: stakeModal.name,
        asset_image: liveAsset?.image || null,
        amount_staked: amt,
        apy: stakeModal.apy,
        earned: 0,
        status: 'active',
      });
      await base44.entities.Wallet.update(wallet.id, {
        balance: (wallet.balance || 0) - amt,
        total_invested: (wallet.total_invested || 0) + amt,
      });
      await base44.entities.Transaction.create({
        user_id: activeUserId, type: 'investment', amount: amt, status: 'completed',
        description: `Staking — ${stakeModal.symbol} @ ${stakeModal.apy}% APY`,
        asset: stakeModal.symbol,
      });
    },
    onSuccess: () => {
      toast.success(`${stakeModal.symbol} staking started!`);
      qc.invalidateQueries({ queryKey: ['staking-pools', activeUserId] });
      qc.invalidateQueries({ queryKey: ['wallets', activeUserId] });
      setStakeModal(null);
      setStakeAmount('');
    },
    onError: e => toast.error(e.message),
  });

  const claimMutation = useMutation({
    mutationFn: async (pool) => {
      const accrued = calcAccruedEarning(pool);
      if (accrued < 0.01) throw new Error('Nothing to claim yet. Earnings update every hour.');
      const roundedAccrued = parseFloat(accrued.toFixed(4));
      await base44.entities.StakingPool.update(pool.id, {
        earned: (pool.earned || 0) + roundedAccrued,
        last_claim_date: new Date().toISOString(),
      });
      if (wallet) {
        await base44.entities.Wallet.update(wallet.id, {
          balance: (wallet.balance || 0) + roundedAccrued,
          total_earnings: (wallet.total_earnings || 0) + roundedAccrued,
        });
      }
      await base44.entities.Transaction.create({
        user_id: activeUserId, type: 'earning', amount: roundedAccrued, status: 'completed',
        description: `Staking reward — ${pool.asset_symbol}`,
        asset: pool.asset_symbol,
      });
    },
    onSuccess: () => {
      toast.success('Earnings claimed to main balance!');
      qc.invalidateQueries({ queryKey: ['staking-pools', activeUserId] });
      qc.invalidateQueries({ queryKey: ['wallets', activeUserId] });
    },
    onError: e => toast.error(e.message),
  });

  const unstakeMutation = useMutation({
    mutationFn: async (pool) => {
      const accrued = calcAccruedEarning(pool);
      const total = (pool.amount_staked || 0) + accrued;
      await base44.entities.StakingPool.update(pool.id, {
        status: 'unstaked',
        earned: (pool.earned || 0) + accrued,
        last_claim_date: new Date().toISOString(),
      });
      if (wallet) {
        await base44.entities.Wallet.update(wallet.id, {
          balance: (wallet.balance || 0) + total,
          total_invested: Math.max(0, (wallet.total_invested || 0) - (pool.amount_staked || 0)),
          total_earnings: (wallet.total_earnings || 0) + accrued,
        });
      }
      await base44.entities.Transaction.create({
        user_id: activeUserId, type: 'earning', amount: total, status: 'completed',
        description: `Unstaked ${pool.asset_symbol} — Principal + Rewards returned`,
        asset: pool.asset_symbol,
      });
    },
    onSuccess: () => {
      toast.success('Unstaked! Principal and rewards returned to balance.');
      qc.invalidateQueries({ queryKey: ['staking-pools', activeUserId] });
      qc.invalidateQueries({ queryKey: ['wallets', activeUserId] });
    },
    onError: e => toast.error(e.message),
  });

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden relative p-6 text-white"
        style={{ background: 'linear-gradient(135deg, hsl(262,70%,25%) 0%, hsl(280,65%,35%) 55%, hsl(240,60%,30%) 100%)' }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-32 h-32 rounded-full bg-white/4 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            <span className="font-display font-bold text-white/70 text-sm uppercase tracking-widest">Staking</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Stake & Earn Daily</h1>
          <p className="text-white/60 font-display text-sm mb-5">Stake your crypto and watch your balance grow automatically every hour.</p>
          <div className="flex flex-wrap gap-5">
            <div>
              <p className="font-display text-2xl font-bold text-white">${totalStaked.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-white/50 text-xs font-display">Total Staked</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-yellow-300">${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 4 })}</p>
              <p className="text-white/50 text-xs font-display">Total Earned</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-white">{activePools.length}</p>
              <p className="text-white/50 text-xs font-display">Active Pools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active pools */}
      {activePools.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Your Active Stakes
          </h2>
          <div className="space-y-3">
            {activePools.map((pool, i) => {
              const accrued = calcAccruedEarning(pool);
              const daily = calcDailyEarning(pool.amount_staked, pool.apy);
              const daysActive = differenceInDays(new Date(), new Date(pool.created_date));
              const liveAsset = assets.find(a => a.symbol === pool.asset_symbol);
              return (
                <motion.div key={pool.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 bg-white border-gray-100 shadow-sm hover:border-primary/25 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      {(pool.asset_image || liveAsset?.image)
                        ? <img src={pool.asset_image || liveAsset?.image} alt={pool.asset_symbol} className="w-10 h-10 rounded-full object-contain bg-gray-50 border border-gray-100 p-0.5" />
                        : <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-sm text-purple-700">{pool.asset_symbol.slice(0,2)}</div>
                      }
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-bold text-gray-900">{pool.asset_name}</p>
                          <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-display">{pool.apy}% APY</Badge>
                        </div>
                        <p className="text-xs text-gray-400 font-display mt-0.5">Started {daysActive} day{daysActive !== 1 ? 's' : ''} ago · ${daily.toFixed(4)}/day</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-gray-900">${pool.amount_staked.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Staked</p>
                      </div>
                    </div>

                    {/* Live earnings ticker */}
                    <div className="rounded-xl bg-gradient-to-r from-purple-50 to-emerald-50 border border-purple-100 p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-display">Claimable Earnings</p>
                          <p className="font-mono font-bold text-emerald-600 text-lg">+${accrued.toFixed(6)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-display">All-time Earned</p>
                          <p className="font-mono font-semibold text-purple-600">${((pool.earned || 0) + accrued).toFixed(4)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display h-9"
                        onClick={() => claimMutation.mutate(pool)}
                        disabled={claimMutation.isPending || accrued < 0.01}>
                        <Gift className="w-3.5 h-3.5" /> Claim to Balance
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 font-display h-9 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => unstakeMutation.mutate(pool)}
                        disabled={unstakeMutation.isPending}>
                        <ArrowDownRight className="w-3.5 h-3.5" /> Unstake
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available staking pools */}
      <div>
        <h2 className="font-display font-bold text-gray-900 mb-1">Available Staking Pools</h2>
        <p className="text-sm text-gray-400 font-display mb-4">Choose an asset and start earning daily rewards</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {STAKING_ASSETS.map((asset, i) => {
            const liveAsset = assets.find(a => a.symbol === asset.symbol);
            const price = liveAsset?.price;
            const isAlreadyStaking = activePools.some(p => p.asset_symbol === asset.symbol);
            return (
              <motion.div key={asset.symbol} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4 bg-white border-gray-100 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    {liveAsset?.image
                      ? <img src={liveAsset.image} alt={asset.symbol} className="w-10 h-10 rounded-full object-contain bg-gray-50 border border-gray-100 p-0.5" />
                      : <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-sm text-purple-700">{asset.symbol.slice(0,2)}</div>
                    }
                    <div>
                      <p className="font-display font-bold text-gray-900 text-sm">{asset.name}</p>
                      <p className="font-mono text-xs text-gray-400">{asset.symbol}</p>
                    </div>
                  </div>
                  {price && (
                    <p className="font-mono font-semibold text-gray-700 text-sm mb-2">
                      ${price < 1 ? price.toFixed(4) : price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </p>
                  )}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-display">
                      <span className="text-gray-400">APY</span>
                      <span className="font-bold text-emerald-600">{asset.apy}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-display">
                      <span className="text-gray-400">Min. Stake</span>
                      <span className="font-semibold text-gray-700">${asset.min}</span>
                    </div>
                    {asset.lockDays > 0 && (
                      <div className="flex justify-between text-xs font-display">
                        <span className="text-gray-400">Lock Period</span>
                        <span className="font-semibold text-gray-700">{asset.lockDays} days</span>
                      </div>
                    )}
                    {asset.isStable && (
                      <div className="flex justify-between text-xs font-display">
                        <span className="text-gray-400">Type</span>
                        <span className="font-semibold text-emerald-600">No Lock Period</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-display">
                      <span className="text-gray-400">Daily Rate</span>
                      <span className="font-semibold text-purple-600">{(asset.apy / 365).toFixed(3)}%/day</span>
                    </div>
                  </div>
                  {isAlreadyStaking ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 text-xs font-display font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Already Staking
                    </div>
                  ) : (
                    <Button size="sm" className="w-full gap-1.5 font-display h-9 text-xs"
                      style={{ background: 'linear-gradient(135deg, hsl(262,70%,50%), hsl(262,65%,40%))' }}
                      onClick={() => { setStakeModal(asset); setStakeAmount(''); }}>
                      <Plus className="w-3.5 h-3.5" /> Stake {asset.symbol}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Past stakes */}
      {pools.filter(p => p.status === 'unstaked').length > 0 && (
        <div>
          <h2 className="font-display font-bold text-gray-900 mb-3">Past Stakes</h2>
          <div className="space-y-2">
            {pools.filter(p => p.status === 'unstaked').map(pool => (
              <Card key={pool.id} className="p-3 bg-gray-50 border-gray-100 opacity-60">
                <div className="flex items-center justify-between text-sm font-display">
                  <span className="font-semibold text-gray-600">{pool.asset_symbol} — Unstaked</span>
                  <span className="text-emerald-600 font-bold">+${(pool.earned || 0).toFixed(4)} earned</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stake Modal */}
      <Dialog open={!!stakeModal} onOpenChange={() => setStakeModal(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Stake {stakeModal?.symbol}
            </DialogTitle>
          </DialogHeader>
          {stakeModal && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 space-y-1.5 text-sm font-display">
                <div className="flex justify-between"><span className="text-gray-500">APY</span><span className="font-bold text-emerald-600">{stakeModal.apy}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Daily earnings on $1000</span><span className="font-semibold">${calcDailyEarning(1000, stakeModal.apy).toFixed(4)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Lock period</span><span className="font-semibold">{stakeModal.lockDays} days</span></div>
              </div>
              <div>
                <Label className="text-xs font-display text-gray-500">Amount to Stake (USD)</Label>
                <div className="relative mt-1">
                  <Input type="number" placeholder={`Min $${stakeModal.min}`} value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} className="bg-gray-50 border-gray-200 pr-16" />
                  {wallet && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-semibold px-1.5 py-0.5 rounded bg-primary/10"
                      onClick={() => setStakeAmount(String(wallet.balance || 0))}>MAX</button>
                  )}
                </div>
                {wallet && <p className="text-xs text-gray-400 mt-1">Balance: ${(wallet.balance || 0).toLocaleString()}</p>}
              </div>
              {stakeAmount && parseFloat(stakeAmount) >= stakeModal.min && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-display space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Daily Earnings</span><span className="font-bold text-emerald-600">+${calcDailyEarning(parseFloat(stakeAmount), stakeModal.apy).toFixed(4)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Monthly Earnings</span><span className="font-bold text-emerald-600">+${(calcDailyEarning(parseFloat(stakeAmount), stakeModal.apy) * 30).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Yearly Earnings</span><span className="font-bold text-emerald-600">+${(parseFloat(stakeAmount) * stakeModal.apy / 100).toFixed(2)}</span></div>
                </div>
              )}
              <Button className="w-full h-11 font-display font-semibold gap-2"
                style={{ background: 'linear-gradient(135deg, hsl(262,70%,50%), hsl(262,65%,40%))' }}
                onClick={() => startStakeMutation.mutate()}
                disabled={startStakeMutation.isPending || !stakeAmount || parseFloat(stakeAmount) < stakeModal.min}>
                {startStakeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {startStakeMutation.isPending ? 'Starting...' : `Stake ${stakeModal.symbol}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}