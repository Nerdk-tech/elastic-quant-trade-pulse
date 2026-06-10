import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Users, Gift, Link } from 'lucide-react';

export default function ReferralPanel({ userId }) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://cortex.trade/ref/${(userId || 'demo').slice(0, 8)}`;

  const copy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Empty for new users — will be populated when they actually refer someone
  const referrals = [];

  return (
    <Card className="p-5 bg-card border-white/8">
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-mono font-semibold">Referral Program</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Users, label: 'Referrals', value: referrals.length },
          { icon: Gift, label: 'Earned', value: referrals.length > 0 ? `$${referrals.length * 300}` : '$0' },
          { icon: Link, label: 'Per referral', value: '$300' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-white/5 text-center">
            <p className="font-mono text-lg font-bold">{s.value}</p>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <p className="font-mono text-xs text-muted-foreground mb-2">Your referral link</p>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-white/5">
          <span className="font-mono text-xs text-primary flex-1 truncate">{referralLink}</span>
          <Button size="sm" variant="ghost" onClick={copy} className="flex-shrink-0 h-7 px-2">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-xs text-muted-foreground mb-2">Recent referrals</p>
        {referrals.length === 0 ? (
          <div className="text-center py-6 rounded-lg bg-secondary/20">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="font-mono text-xs text-muted-foreground">No referrals yet</p>
            <p className="font-mono text-xs text-muted-foreground/60 mt-0.5">Share your link to earn $300/ref</p>
          </div>
        ) : (
          referrals.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
              <span className="font-mono text-xs">{r.wallet}</span>
              <span className="font-mono text-xs text-muted-foreground">{r.date}</span>
              <span className="font-mono text-xs font-bold text-emerald-400">{r.bonus}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}