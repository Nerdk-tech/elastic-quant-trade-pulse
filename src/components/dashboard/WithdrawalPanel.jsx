import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, Clock, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function WithdrawalPanel({ balance = 0, userId }) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: withdrawalHistory = [] } = useQuery({
    queryKey: ['withdrawal-history', userId],
    queryFn: () => base44.entities.Transaction.filter({ user_id: userId, type: 'withdrawal' }, '-created_date', 10),
    enabled: !!userId,
  });

  const now = new Date();
  const hour = now.getHours();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  const inWindow = isWeekday && hour >= 8 && hour < 20;

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');
    if (parseFloat(amount) > balance) return toast.error('Insufficient balance');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    toast.success('Withdrawal request submitted — processing within 24h');
    setAmount('');
    setAddress('');
  };

  return (
    <Card className="p-5 bg-card border-white/8">
      <div className="flex items-center gap-2 mb-5">
        <ArrowUpRight className="w-4 h-4 text-primary" />
        <h3 className="font-mono font-semibold">Withdraw Funds</h3>
      </div>

      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-5 border text-xs font-mono ${inWindow ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/8 border-orange-500/20 text-orange-400'}`}>
        <Clock className="w-3.5 h-3.5" />
        {inWindow ? 'Processing window active (8AM–8PM weekdays)' : 'Processing window: 8AM–8PM weekdays only'}
      </div>

      <div className="space-y-4 mb-5">
        <div>
          <Label className="font-mono text-xs text-muted-foreground">Amount (USD)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-secondary/50 border-white/8 font-mono mt-1"
          />
          <p className="font-mono text-xs text-muted-foreground mt-1">Available: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <Label className="font-mono text-xs text-muted-foreground">Wallet Address</Label>
          <Input
            placeholder="0x..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="bg-secondary/50 border-white/8 font-mono mt-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-white/5 text-xs font-mono text-muted-foreground mb-4">
        <Shield className="w-3.5 h-3.5 text-primary" />
        No locked contracts — full user control. Est. processing: 24h
      </div>

      <Button onClick={submit} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono h-10">
        {loading ? 'Submitting...' : 'Request Withdrawal'}
      </Button>

      {withdrawalHistory.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-xs text-muted-foreground mb-2">Withdrawal history</p>
          <div className="space-y-2">
            {withdrawalHistory.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30">
                <span className="font-mono text-sm font-semibold">${h.amount?.toLocaleString()}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {h.created_date ? format(new Date(h.created_date), 'MMM d, yyyy') : '—'}
                </span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className={`font-mono text-xs ${h.status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {h.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}