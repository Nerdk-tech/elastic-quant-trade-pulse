import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Layers, BarChart2, X } from 'lucide-react';
import { getImpersonatedUser } from '@/lib/impersonation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import TradeChartModal from '@/components/trade/TradeChartModal';
import { useLivePrices } from '@/hooks/useLivePrices';

const COLORS = ['hsl(174, 72%, 46%)', 'hsl(142, 71%, 45%)', 'hsl(262, 83%, 58%)', 'hsl(43, 74%, 66%)', 'hsl(200, 80%, 50%)', 'hsl(0, 84%, 60%)'];

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [chartInvestment, setChartInvestment] = useState(null);
  const impersonated = getImpersonatedUser();
  const qc = useQueryClient();
  const { assets } = useLivePrices(60000);

  useEffect(() => { base44.auth.me().then(setUser); }, []);
  const activeUserId = impersonated?.id || user?.id;

  const { data: investments = [] } = useQuery({
    queryKey: ['investments', activeUserId],
    queryFn: () => base44.entities.Investment.filter({ user_id: activeUserId }, '-created_date'),
    enabled: !!activeUserId,
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets', activeUserId],
    queryFn: () => base44.entities.Wallet.filter({ user_id: activeUserId }),
    enabled: !!activeUserId,
  });
  const wallet = wallets[0];

  const closeTradeMutation = useMutation({
    mutationFn: async (inv) => {
      const pnl = inv.profit_loss || 0;
      const returnAmount = (inv.amount_invested || 0) + pnl;
      await base44.entities.Investment.update(inv.id, { status: 'closed' });
      if (wallet) {
        await base44.entities.Wallet.update(wallet.id, {
          balance: (wallet.balance || 0) + returnAmount,
          total_invested: Math.max(0, (wallet.total_invested || 0) - (inv.amount_invested || 0)),
          total_earnings: (wallet.total_earnings || 0) + Math.max(0, pnl),
          total_withdrawn: (wallet.total_withdrawn || 0) + (pnl < 0 ? Math.abs(pnl) : 0),
        });
      }
      await base44.entities.Transaction.create({
        user_id: activeUserId,
        type: pnl >= 0 ? 'earning' : 'withdrawal',
        amount: Math.abs(returnAmount),
        status: 'completed',
        description: `Closed ${inv.position_type?.toUpperCase()} ${inv.asset_symbol} — ${pnl >= 0 ? 'Profit' : 'Loss'}: $${pnl.toFixed(2)}`,
        asset: inv.asset_symbol,
      });
    },
    onSuccess: () => {
      toast.success('Trade closed. Returns added to balance.');
      qc.invalidateQueries({ queryKey: ['investments', activeUserId] });
      qc.invalidateQueries({ queryKey: ['wallets', activeUserId] });
      setChartInvestment(null);
    },
    onError: err => toast.error(err.message),
  });

  const active = investments.filter(i => i.status === 'active');
  const closed = investments.filter(i => i.status === 'closed');
  const totalValue = active.reduce((s, i) => s + (i.current_value || i.amount_invested || 0), 0);
  const totalPL = active.reduce((s, i) => s + (i.profit_loss || 0), 0);
  const pieData = active.map(i => ({ name: i.asset_symbol, value: i.current_value || i.amount_invested || 0 }));

  // Find live asset data for chart
  const getLiveAsset = (inv) => {
    const live = assets.find(a => a.symbol === inv.asset_symbol);
    if (live) return live;
    return {
      id: inv.asset_symbol?.toLowerCase(),
      name: inv.asset_name,
      symbol: inv.asset_symbol,
      price: inv.entry_price || 0,
      change: 0,
      type: inv.asset_type || 'crypto',
      image: null,
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your active and closed positions</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-card border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Value</span>
          </div>
          <p className="font-display text-2xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-5 bg-card border-border/50">
          <div className="flex items-center gap-2 mb-2">
            {totalPL >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
            <span className="text-xs text-muted-foreground">Total P&L</span>
          </div>
          <p className={`font-display text-2xl font-bold ${totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-5 bg-card border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-muted-foreground">Active Positions</span>
          </div>
          <p className="font-display text-2xl font-bold">{active.length}</p>
        </Card>
      </div>

      {active.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-5 bg-card border-border/50">
            <h3 className="font-display font-semibold mb-4">Allocation</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">${d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display font-semibold">Active Positions</h3>
            {active.map((inv, i) => {
              const pnl = inv.profit_loss || 0;
              const pct = inv.amount_invested ? (pnl / inv.amount_invested * 100).toFixed(1) : '0.0';
              const isUp = pnl >= 0;
              const liveAsset = assets.find(a => a.symbol === inv.asset_symbol);
              return (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 bg-card border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {liveAsset?.image
                          ? <img src={liveAsset.image} alt={inv.asset_symbol} className="w-10 h-10 rounded-full object-contain bg-white border border-gray-100 p-0.5 flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-sm text-primary flex-shrink-0">{inv.asset_symbol?.slice(0, 2)}</div>
                        }
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{inv.asset_name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${inv.position_type === 'long' ? 'border-emerald-300 text-emerald-600' : 'border-red-300 text-red-600'}`}>{inv.position_type}</Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{inv.leverage}</Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{inv.asset_type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold">${(inv.current_value || inv.amount_invested || 0).toLocaleString()}</p>
                        <p className={`text-xs font-medium ${isUp ? 'text-emerald-500' : 'text-red-400'}`}>
                          {isUp ? '+' : ''}${pnl.toLocaleString()} ({isUp ? '+' : ''}{pct}%)
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <Button size="sm" variant="outline" className="h-7 px-2 gap-1 text-xs font-display"
                          onClick={() => setChartInvestment(inv)}>
                          <BarChart2 className="w-3 h-3" /> Chart
                        </Button>
                        <Button size="sm" className={`h-7 px-2 gap-1 text-xs font-display text-white ${isUp ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'}`}
                          onClick={() => closeTradeMutation.mutate(inv)}
                          disabled={closeTradeMutation.isPending}>
                          <X className="w-3 h-3" /> Close
                        </Button>
                      </div>
                    </div>
                    {/* Entry & Target */}
                    {(inv.entry_price || inv.target_price) && (
                      <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-4 text-xs">
                        {inv.entry_price && (
                          <div>
                            <p className="text-muted-foreground">Entry</p>
                            <p className="font-mono font-semibold">${inv.entry_price.toLocaleString('en-US', { maximumFractionDigits: 4 })}</p>
                          </div>
                        )}
                        {inv.target_price && (
                          <div>
                            <p className="text-muted-foreground text-emerald-500">Target</p>
                            <p className="font-mono font-semibold text-emerald-500">${inv.target_price.toLocaleString('en-US', { maximumFractionDigits: 4 })}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {active.length === 0 && (
        <Card className="p-12 bg-card border-border/50 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-display font-semibold text-lg mb-2">No active investments</h3>
          <p className="text-sm text-muted-foreground">Start trading to build your portfolio</p>
        </Card>
      )}

      {closed.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-semibold">Closed Positions</h3>
          {closed.map(inv => (
            <Card key={inv.id} className="p-4 bg-card/40 border-border/30 opacity-70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-display text-xs font-bold text-muted-foreground">
                    {inv.asset_symbol?.slice(0, 2)}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{inv.asset_name} · {inv.position_type} · {inv.leverage}</p>
                </div>
                <p className={`text-sm font-medium ${(inv.profit_loss || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(inv.profit_loss || 0) >= 0 ? '+' : ''}${(inv.profit_loss || 0).toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Chart Modal for active investment */}
      {chartInvestment && (
        <TradeChartModal
          asset={getLiveAsset(chartInvestment)}
          investment={chartInvestment}
          onClose={() => setChartInvestment(null)}
          onCloseTrade={(inv) => closeTradeMutation.mutate(inv)}
        />
      )}
    </div>
  );
}