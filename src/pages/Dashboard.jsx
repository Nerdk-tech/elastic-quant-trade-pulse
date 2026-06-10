import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, BarChart3, Zap, ArrowUpRight,
  ArrowDownRight, ArrowRight, Activity, Bell, ChevronUp, ChevronDown, Flame,
  Shield, Clock, Star, Layers, Eye
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import BonusPopup from '@/components/dashboard/BonusPopup';
import WeeklyLeaderboard from '@/components/dashboard/WeeklyLeaderboard';
import LiveActivityWidget from '@/components/dashboard/LiveActivityWidget';
import TradeChartModal from '@/components/trade/TradeChartModal';
import { useLivePrices } from '@/hooks/useLivePrices';
import { getImpersonatedUser } from '@/lib/impersonation';
import { format } from 'date-fns';

const typeIcons = {
  deposit: ArrowDownRight, earning: TrendingUp, investment: BarChart3,
  withdrawal: ArrowUpRight, bonus: Zap, admin_credit: DollarSign, admin_debit: DollarSign,
};

// Animated live ticker
function LiveTicker({ assets }) {
  if (!assets.length) return null;
  const items = [...assets.slice(0, 12), ...assets.slice(0, 12)];
  return (
    <div className="bg-gray-950 border-b border-gray-800/60 overflow-hidden py-2">
      <motion.div
        className="flex items-center gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ width: 'max-content' }}>
        {items.map((a, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs font-mono flex-shrink-0">
            {a.image
              ? <img src={a.image} alt={a.symbol} className="w-4 h-4 rounded-full" />
              : <div className="w-4 h-4 rounded-full bg-primary/30 text-[8px] flex items-center justify-center text-primary font-bold">{a.symbol[0]}</div>
            }
            <span className="text-gray-300 font-semibold tracking-wide">{a.symbol}</span>
            <span className="text-white font-bold">${a.price < 1 ? a.price.toFixed(4) : a.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
            <span className={`flex items-center gap-0.5 font-semibold ${a.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {a.change >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {Math.abs(a.change)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Premium stat card
function StatCard({ label, value, icon: Icon, change, accent, delay = 0, sub, badge, link }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: 'spring', stiffness: 200 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 group h-full
        ${accent
          ? 'text-white border-0 active:scale-[0.98]'
          : 'bg-white border border-gray-100 hover:border-primary/25 hover:shadow-md active:scale-[0.98] shadow-sm'
        }`}
      style={accent ? {
        background: 'linear-gradient(140deg, hsl(174,72%,15%) 0%, hsl(185,65%,28%) 50%, hsl(160,60%,22%) 100%)',
        boxShadow: '0 8px 32px rgba(0,160,130,0.3), inset 0 1px 0 rgba(255,255,255,0.12)'
      } : {}}>
      {accent && (
        <>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 -left-4 w-24 h-24 rounded-full bg-teal-300/10 pointer-events-none" />
        </>
      )}
      <div className="relative p-4 sm:p-5 flex flex-col h-full">
        {/* Top row: icon + badge/change */}
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${accent ? 'bg-white/20 border border-white/25' : 'bg-primary/10 border border-primary/15'}`}>
            <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-primary'}`} />
          </div>
          <div className="flex flex-col items-end gap-1">
            {badge && (
              <span className={`text-[9px] font-display font-bold px-2 py-0.5 rounded-full tracking-widest ${accent ? 'bg-white/20 text-white/90' : 'bg-primary/10 text-primary'}`}>
                {badge}
              </span>
            )}
            {change !== undefined && (
              <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-display
                ${change >= 0
                  ? accent ? 'text-emerald-200 bg-emerald-400/20' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                  : accent ? 'text-red-200 bg-red-400/20' : 'text-red-600 bg-red-50 border border-red-100'
                }`}>
                {change >= 0 ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                {change >= 0 ? '+' : ''}{change}%
              </div>
            )}
          </div>
        </div>
        {/* Label */}
        <p className={`text-[10px] uppercase tracking-[0.12em] font-display font-bold mb-1 ${accent ? 'text-white/50' : 'text-gray-400'}`}>{label}</p>
        {/* Value */}
        <p className={`font-display font-bold tracking-tight leading-none ${accent ? 'text-white' : 'text-gray-900'} text-xl sm:text-2xl`}>{value}</p>
        {/* Sub */}
        {sub && <p className={`text-[10px] mt-1.5 font-display ${accent ? 'text-white/40' : 'text-gray-400'} truncate`}>{sub}</p>}
      </div>
    </motion.div>
  );
  return link ? <Link to={link} className="block h-full">{inner}</Link> : inner;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const { assets } = useLivePrices(30000);
  const impersonated = getImpersonatedUser();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      if (u && !impersonated) {
        const bonusKey = `bonus_shown_${u.id}`;
        const alreadyShown = localStorage.getItem(bonusKey);
        const res = await base44.functions.invoke('autoBonus', { userId: u.id });
        if (!alreadyShown && res?.data?.bonusAmount) {
          setShowBonusPopup(true);
          localStorage.setItem(bonusKey, '1');
        }
      }
    });
  }, []);

  const activeUserId = impersonated?.id || user?.id;
  const displayUser = impersonated || user;

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets', activeUserId],
    queryFn: () => base44.entities.Wallet.filter({ user_id: activeUserId }),
    enabled: !!activeUserId,
  });
  const { data: stakingPools = [] } = useQuery({
    queryKey: ['staking-pools', activeUserId],
    queryFn: () => base44.entities.StakingPool.filter({ user_id: activeUserId, status: 'active' }),
    enabled: !!activeUserId,
  });
  const { data: investments = [] } = useQuery({
    queryKey: ['investments', activeUserId],
    queryFn: () => base44.entities.Investment.filter({ user_id: activeUserId }),
    enabled: !!activeUserId,
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ['recent-transactions', activeUserId],
    queryFn: () => base44.entities.Transaction.filter({ user_id: activeUserId }, '-created_date', 8),
    enabled: !!activeUserId,
  });

  const wallet = wallets[0];
  const balance = wallet?.balance || 0;
  const totalInvested = wallet?.total_invested || 0;
  const totalEarnings = wallet?.total_earnings || 0;
  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalPortfolio = balance + totalInvested;
  const totalStaked = stakingPools.reduce((s, p) => s + (p.amount_staked || 0), 0);
  const totalStakingEarned = stakingPools.reduce((s, p) => s + (p.earned || 0), 0);

  const trialDaysLeft = displayUser?.created_date
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(displayUser.created_date).getTime()) / (24 * 60 * 60 * 1000)))
    : 7;

  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const base = balance + totalInvested;
    if (base === 0) return days.map(d => ({ day: d, value: 0 }));
    return days.map((d, i) => ({
      day: d,
      value: Math.max(0, base * (0.86 + i * 0.022 + Math.sin(i * 1.2) * 0.025))
    }));
  }, [balance, totalInvested]);

  const firstName = displayUser?.full_name?.split(' ')[0] || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="-m-4 lg:-m-6 bg-gray-50 min-h-screen">
      {/* Live ticker */}
      <LiveTicker assets={assets} />

      <div className="p-4 lg:p-6 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-display font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{greeting}</p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-gray-900">
              {firstName ? `${firstName}'s Dashboard` : 'My Dashboard'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 font-display flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Markets live
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {trialDaysLeft > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold border"
                style={{ borderColor: 'hsl(174,65%,38%)', color: 'hsl(174,65%,38%)', background: 'hsl(174,65%,97%)' }}>
                <Flame className="w-3 h-3" />
                {trialDaysLeft}d trial
              </div>
            )}
            <Link to="/dashboard/notifications"
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center shadow-sm hover:border-primary/30 transition-colors">
              <Bell className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </motion.div>

        {showBonusPopup && <BonusPopup userName={user?.full_name} onClose={() => setShowBonusPopup(false)} />}

        {/* Stats grid — 2x2 on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Available Balance card — custom to fit Deposit/Withdraw buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, type: 'spring', stiffness: 200 }}
            className="relative rounded-2xl overflow-hidden text-white h-full"
            style={{ background: 'linear-gradient(140deg, hsl(174,72%,15%) 0%, hsl(185,65%,28%) 50%, hsl(160,60%,22%) 100%)', boxShadow: '0 8px 32px rgba(0,160,130,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute bottom-0 -left-4 w-24 h-24 rounded-full bg-teal-300/10 pointer-events-none" />
            <div className="relative p-4 sm:p-5 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20 border border-white/25">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-display font-bold px-2 py-0.5 rounded-full tracking-widest bg-white/20 text-white/90">LIVE</span>
                  {balance > 0 && (
                    <div className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-display text-emerald-200 bg-emerald-400/20">
                      <ChevronUp className="w-2.5 h-2.5" />+2.4%
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.12em] font-display font-bold mb-1 text-white/50">Available Balance</p>
              <p className="font-display font-bold tracking-tight leading-none text-white text-xl sm:text-2xl">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <p className="text-[10px] mt-1.5 font-display text-white/40 truncate">Withdrawable funds</p>
              {/* Deposit / Withdraw buttons */}
              <div className="flex gap-1.5 mt-3">
                <Link to="/dashboard/deposit" className="flex-1 text-center text-[10px] font-display font-bold py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all">
                  Deposit
                </Link>
                <Link to="/dashboard/withdraw" className="flex-1 text-center text-[10px] font-display font-bold py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all">
                  Withdraw
                </Link>
              </div>
            </div>
          </motion.div>
          <StatCard label="Total Invested"
            value={`$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={BarChart3} delay={0.05} sub="Across all positions"
            badge={totalInvested > 0 ? `${activeInvestments.length} active` : undefined} link="/dashboard/portfolio" />
          <StatCard label="Total Earnings"
            value={`$${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp} change={totalEarnings > 0 ? 8.1 : undefined} delay={0.1} sub="All-time profits" />
          <StatCard label="Active Trades"
            value={activeInvestments.length.toString()} icon={Zap} delay={0.15}
            sub={activeInvestments.length > 0 ? 'Running positions' : 'No open positions'}
            badge={activeInvestments.length > 0 ? '● OPEN' : undefined} link="/dashboard/trade" />
        </div>

        {/* Staking Pool Card — shows live summary if active, promo if not */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: 'linear-gradient(135deg, hsl(174,72%,25%) 0%, hsl(185,68%,35%) 100%)' }}>
            <div className="relative p-5">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/8 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 left-1/2 w-32 h-32 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />
              {stakingPools.length > 0 ? (
                /* Live staking summary */
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                      <p className="text-[10px] uppercase tracking-widest font-display font-bold text-white/50">Active Staking</p>
                    </div>
                    <Link to="/dashboard/staking" className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-display font-semibold transition-all flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                      <p className="text-[9px] uppercase tracking-widest font-display font-bold text-white/40 mb-1">Staked</p>
                      <p className="text-sm font-display font-bold text-white">${totalStaked.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                      <p className="text-[9px] uppercase tracking-widest font-display font-bold text-white/40 mb-1">Earned</p>
                      <p className="text-sm font-display font-bold text-emerald-300">${totalStakingEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                      <p className="text-[9px] uppercase tracking-widest font-display font-bold text-white/40 mb-1">Pools</p>
                      <p className="text-sm font-display font-bold text-white">{stakingPools.length}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Promo — no active stakes */
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    <p className="text-[10px] uppercase tracking-widest font-display font-bold text-white/50">Earn Rewards</p>
                  </div>
                  <h3 className="font-display font-bold text-white text-lg leading-tight mb-4">Create a Staking Pool</h3>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-white/70" />
                      <p className="text-xs font-display text-white/60">Earn up to 142% APY</p>
                    </div>
                    <Link to="/dashboard/staking" className="px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-display font-semibold transition-all">
                      Stake
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Chart + Market */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Performance chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden shadow-sm"
            style={{ background: 'linear-gradient(160deg, hsl(220,28%,10%) 0%, hsl(220,22%,14%) 100%)' }}>
            {/* Top section */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-display font-bold text-white/30 mb-1">Portfolio Value</p>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    ${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-xs font-display font-bold text-emerald-400 bg-emerald-400/15 px-2 py-0.5 rounded-full">
                      <ChevronUp className="w-3 h-3" /> +8.4% this week
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/8 rounded-xl p-1 border border-white/10 flex-shrink-0">
                  {['1D', '1W', '1M', '3M'].map((t, i) => (
                    <button key={i} className={`px-2.5 py-1 text-xs rounded-lg font-display font-semibold transition-all ${i === 1 ? 'text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                      style={i === 1 ? { background: 'hsl(174,65%,38%)' } : {}}>{t}</button>
                  ))}
                </div>
              </div>
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Invested', value: `$${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 0 })}` },
                  { label: 'Earnings', value: `$${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 0 })}` },
                  { label: 'Balance', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}` },
                ].map(s => (
                  <div key={s.label} className="bg-white/6 rounded-xl px-3 py-2.5 border border-white/8">
                    <p className="text-[9px] uppercase tracking-widest font-display font-bold text-white/30">{s.label}</p>
                    <p className="text-sm font-display font-bold text-white mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Chart */}
            <div className="h-44 px-1 pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(174,65%,50%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(174,65%,38%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'Raleway' }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,20,30,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', fontSize: '12px', fontFamily: 'Raleway', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: '8px 14px' }}
                    formatter={v => [`$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Value']}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(174,65%,48%)" strokeWidth={2} fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 4, fill: 'hsl(174,65%,55%)', stroke: 'white', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Live markets */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-gray-900 text-sm">Live Markets</h3>
              </div>
              <Link to="/dashboard/trade" className="text-xs font-display font-semibold text-primary flex items-center gap-1 hover:underline">
                Trade <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {assets.slice(0, 7).map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  {a.image
                    ? <img src={a.image} alt={a.symbol} className="w-8 h-8 rounded-full flex-shrink-0" />
                    : <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{a.symbol.slice(0, 2)}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-semibold text-xs text-gray-900">{a.symbol}</span>
                      <span className="font-mono text-xs font-bold text-gray-900">
                        ${a.price < 1 ? a.price.toFixed(4) : a.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[10px] text-gray-400 font-display truncate max-w-[70px]">{a.name}</span>
                      <span className={`text-xs font-semibold font-display flex items-center gap-0.5 ${a.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {a.change >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {Math.abs(a.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Active Positions */}
        {activeInvestments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-display font-bold text-gray-900 text-sm">Active Positions</h3>
                <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {activeInvestments.length} open
                </span>
              </div>
              <Link to="/dashboard/portfolio" className="text-xs font-display font-semibold text-primary flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {/* Mobile: cards | Desktop: table */}
            <div className="block sm:hidden divide-y divide-gray-50">
              {activeInvestments.slice(0, 4).map(inv => {
                const pnl = inv.profit_loss || 0;
                const pct = inv.amount_invested ? (pnl / inv.amount_invested * 100).toFixed(1) : '0.0';
                const up = pnl >= 0;
                const liveAsset = assets.find(a => a.symbol === inv.asset_symbol);
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group transition-colors">
                     {liveAsset?.image
                       ? <img src={liveAsset.image} alt={inv.asset_symbol} className="w-8 h-8 rounded-full flex-shrink-0" />
                       : <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(174,65%,38%)' }}>{inv.asset_symbol?.slice(0, 2)}</div>
                     }
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-gray-900 font-display">{inv.asset_symbol}</p>
                       <div className="flex items-center gap-1.5 mt-0.5">
                         <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-display font-bold ${inv.position_type === 'long' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>{inv.position_type?.toUpperCase()}</span>
                         <span className="text-[10px] text-gray-400 font-mono">{inv.leverage || '1x'}</span>
                       </div>
                     </div>
                     <div className="text-right flex-shrink-0">
                       <p className={`text-sm font-bold font-display ${up ? 'text-emerald-600' : 'text-red-500'}`}>{up ? '+' : ''}${pnl.toLocaleString()}</p>
                       <p className={`text-[10px] font-semibold font-display ${up ? 'text-emerald-500' : 'text-red-400'}`}>{up ? '+' : ''}{pct}%</p>
                     </div>
                     <button onClick={() => { setSelectedInvestment({ ...inv, liveAsset }); setShowChartModal(true); }} className="ml-2 p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                       <Eye className="w-4 h-4" />
                     </button>
                   </div>
                );
              })}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    {['Asset', 'Type', 'Leverage', 'Invested', 'P&L', 'Return'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeInvestments.slice(0, 6).map(inv => {
                    const pnl = inv.profit_loss || 0;
                    const pct = inv.amount_invested ? (pnl / inv.amount_invested * 100).toFixed(1) : '0.0';
                    const up = pnl >= 0;
                    const liveAsset = assets.find(a => a.symbol === inv.asset_symbol);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors group">
                         <td className="px-4 py-3">
                           <div className="flex items-center gap-2.5">
                             {liveAsset?.image
                               ? <img src={liveAsset.image} alt={inv.asset_symbol} className="w-8 h-8 rounded-full" />
                               : <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'hsl(174,65%,38%)' }}>{inv.asset_symbol?.slice(0, 2)}</div>
                             }
                             <div>
                               <p className="text-sm font-bold text-gray-900 font-display">{inv.asset_symbol}</p>
                               <p className="text-[10px] text-gray-400 font-display">{liveAsset ? `$${liveAsset.price < 1 ? liveAsset.price.toFixed(4) : liveAsset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : inv.asset_name}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-4 py-3">
                           <span className={`text-xs px-2.5 py-1 rounded-full font-display font-semibold ${inv.position_type === 'long' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>
                             {inv.position_type?.toUpperCase()}
                           </span>
                         </td>
                         <td className="px-4 py-3 text-sm text-gray-700 font-mono font-bold">{inv.leverage || '1x'}</td>
                         <td className="px-4 py-3 text-sm text-gray-700 font-display font-semibold">${inv.amount_invested?.toLocaleString()}</td>
                         <td className="px-4 py-3"><span className={`text-sm font-bold font-display ${up ? 'text-emerald-600' : 'text-red-500'}`}>{up ? '+' : ''}${pnl.toLocaleString()}</span></td>
                         <td className="px-4 py-3 text-right">
                           <div className="flex items-center justify-between">
                             <span className={`text-xs font-bold font-display px-2.5 py-1 rounded-full ${up ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>{up ? '+' : ''}{pct}%</span>
                             <button onClick={() => { setSelectedInvestment({ ...inv, liveAsset }); setShowChartModal(true); }} className="ml-2 p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                               <Eye className="w-4 h-4" />
                             </button>
                           </div>
                         </td>
                       </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Recent Activity + Leaderboard + Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-sm">Recent Activity</h3>
              </div>
              <Link to="/dashboard/transactions" className="text-xs font-display font-semibold text-primary flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 space-y-1.5">
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <DollarSign className="w-10 h-10 mx-auto text-gray-100 mb-3" />
                  <p className="text-sm text-gray-400 font-display font-medium">No transactions yet</p>
                  <Link to="/dashboard/deposit" className="text-xs text-primary font-display font-semibold mt-2 inline-block">Make your first deposit →</Link>
                </div>
              ) : transactions.map((tx, i) => {
                const Icon = typeIcons[tx.type] || DollarSign;
                const isPos = ['deposit', 'earning', 'bonus', 'admin_credit'].includes(tx.type);
                const label = tx.description || tx.type.replace(/_/g, ' ');
                return (
                  <motion.div key={tx.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${isPos ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                      <Icon className={`w-4 h-4 ${isPos ? 'text-emerald-600' : 'text-red-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display font-semibold text-gray-800 truncate capitalize">{label}</p>
                      <p className="text-[10px] text-gray-400 font-display mt-0.5">{tx.asset || 'USD'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-display font-bold ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isPos ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-[10px] font-display px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {tx.status || 'completed'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <WeeklyLeaderboard />
          <LiveActivityWidget />
        </div>

        {/* Security & Promo Banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl overflow-hidden relative p-5 text-white"
          style={{ background: 'linear-gradient(135deg, hsl(220,60%,18%) 0%, hsl(240,50%,25%) 100%)' }}>
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 right-24 w-24 h-24 rounded-full bg-white/4 pointer-events-none" />
          <div className="relative flex flex-wrap items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display font-bold text-white">Invite Friends & Earn $300</p>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-sm text-white/60 font-display">Share your referral link and earn $300 for every friend who joins and deposits.</p>
            </div>
            <Link to="/dashboard/referrals"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-display font-semibold text-white transition-all">
              Invite Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Chart Modal */}
      {showChartModal && selectedInvestment && (
        <TradeChartModal
          asset={{
            symbol: selectedInvestment.asset_symbol,
            name: selectedInvestment.asset_name,
            price: selectedInvestment.liveAsset?.price || selectedInvestment.entry_price,
            change: selectedInvestment.liveAsset?.change || 0,
            image: selectedInvestment.liveAsset?.image,
          }}
          investment={selectedInvestment}
          onClose={() => setShowChartModal(false)}
        />
      )}
    </div>
  );
}