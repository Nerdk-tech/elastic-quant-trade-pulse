import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Users, Gift, Link2, Share2, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const referralCode = (user?.id || 'demo').slice(0, 8).toUpperCase();
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join Cortex Trading', text: 'Start trading and earn $300 bonus!', url: referralLink });
    } else {
      copy();
    }
  };

  const tiers = [
    { label: 'Bronze', min: 0, max: 4, reward: '$300', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Silver', min: 5, max: 9, reward: '$400', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
    { label: 'Gold', min: 10, max: 24, reward: '$500', color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
    { label: 'Platinum', min: 25, max: 99, reward: '$700', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" /> Referral Program
        </h1>
        <p className="text-sm text-gray-500 mt-1">Invite friends and earn $300 for every successful referral</p>
      </div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(174,72%,24%) 0%, hsl(185,70%,38%) 60%, hsl(160,60%,35%) 100%)' }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-sm" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-sm font-display font-semibold text-white/80">Your Referral Reward</span>
          </div>
          <p className="font-display text-5xl font-bold tracking-tight mb-1">$300</p>
          <p className="text-white/60 text-sm font-display">per successful referral · paid instantly</p>
          <div className="mt-5 flex gap-3">
            <Button onClick={copy} className="bg-white/20 hover:bg-white/30 border border-white/20 text-white gap-2 font-display backdrop-blur-sm">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button onClick={share} variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 font-display">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Referrals', value: '0', icon: Users },
          { label: 'Total Earned', value: '$0', icon: Gift },
          { label: 'Reward / Ref', value: '$300', icon: Link2 },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="p-4 text-center bg-white border-gray-100">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 font-display mt-0.5">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Your link */}
      <Card className="p-5 bg-white border-gray-100">
        <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-widest mb-3">Your Referral Link</p>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-mono text-xs text-gray-700 flex-1 truncate">{referralLink}</span>
          <Button size="sm" variant="ghost" onClick={copy} className="flex-shrink-0 h-7 px-2 text-primary">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <p className="text-xs text-gray-400 font-display mt-2">Share this link with friends. When they register and make their first deposit, you earn $300.</p>
      </Card>

      {/* Reward tiers */}
      <Card className="p-5 bg-white border-gray-100">
        <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-widest mb-4">Reward Tiers</p>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${tier.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${tier.color} bg-white border`}>
                  {tier.label[0]}
                </div>
                <div>
                  <p className={`font-display font-semibold text-sm ${tier.color}`}>{tier.label}</p>
                  <p className="text-xs text-gray-400 font-display">{tier.min}–{tier.max} referrals</p>
                </div>
              </div>
              <span className={`font-display font-bold text-sm ${tier.color}`}>{tier.reward} / ref</span>
            </div>
          ))}
        </div>
      </Card>

      {/* History */}
      <Card className="p-5 bg-white border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-widest">Referral History</p>
        </div>
        <div className="text-center py-10">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-display font-semibold text-gray-500">No referrals yet</p>
          <p className="text-xs text-gray-400 font-display mt-1">Share your link to start earning $300 per referral</p>
          <Button onClick={copy} className="mt-4 gap-2 font-display" size="sm">
            <Copy className="w-3.5 h-3.5" /> Copy Referral Link
          </Button>
        </div>
      </Card>
    </div>
  );
}