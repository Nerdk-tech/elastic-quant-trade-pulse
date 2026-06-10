import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp,
  BarChart3, Zap, Gift
} from 'lucide-react';
import { format } from 'date-fns';
import { getImpersonatedUser } from '@/lib/impersonation';

const typeConfig = {
  deposit: { icon: ArrowDownRight, label: 'Deposit', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  withdrawal: { icon: ArrowUpRight, label: 'Withdrawal', color: 'text-red-400', bg: 'bg-red-500/10' },
  investment: { icon: BarChart3, label: 'Investment', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  earning: { icon: TrendingUp, label: 'Earning', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  bonus: { icon: Gift, label: 'Bonus', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  admin_credit: { icon: DollarSign, label: 'Credit', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  admin_debit: { icon: DollarSign, label: 'Debit', color: 'text-red-400', bg: 'bg-red-500/10' },
};

const statusColors = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

export default function Transactions() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const impersonated = getImpersonatedUser();
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const activeUserId = impersonated?.id || user?.id;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', activeUserId],
    queryFn: () => base44.entities.Transaction.filter({ user_id: activeUserId }, '-created_date'),
    enabled: !!activeUserId,
  });

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">Your complete transaction history</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="deposit" className="text-xs">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawal" className="text-xs">Withdrawals</TabsTrigger>
          <TabsTrigger value="investment" className="text-xs">Investments</TabsTrigger>
          <TabsTrigger value="earning" className="text-xs">Earnings</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="p-4 bg-card border-border/50 animate-pulse">
              <div className="h-12" />
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-12 bg-card border-border/50 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-display font-semibold text-lg mb-2">No transactions yet</h3>
            <p className="text-sm text-muted-foreground">Your transactions will appear here</p>
          </Card>
        ) : (
          filtered.map((tx, i) => {
            const config = typeConfig[tx.type] || typeConfig.deposit;
            const isPositive = ['deposit', 'earning', 'bonus', 'admin_credit'].includes(tx.type);
            return (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="p-4 bg-card border-border/50 hover:border-border transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{tx.description || config.label}</p>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[tx.status]}`}>{tx.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tx.asset && <span className="text-xs text-muted-foreground">{tx.asset}</span>}
                        <span className="text-xs text-muted-foreground">
                          {tx.created_date ? format(new Date(tx.created_date), 'MMM d, yyyy · h:mm a') : ''}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}