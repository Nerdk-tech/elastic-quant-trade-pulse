import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Search, Plus, Minus, RefreshCw, Users, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminBalances() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('balances'); // 'balances' | 'trades'
  const [expandedUser, setExpandedUser] = useState(null);
  const [tradeAction, setTradeAction] = useState(null); // { invId, type: 'profit'|'loss' }
  const [tradeAmount, setTradeAmount] = useState('');
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => base44.entities.User.list() });
  const { data: wallets = [] } = useQuery({ queryKey: ['admin-wallets'], queryFn: () => base44.entities.Wallet.list() });
  const { data: investments = [] } = useQuery({ queryKey: ['admin-investments-all'], queryFn: () => base44.entities.Investment.list() });

  const walletMap = Object.fromEntries(wallets.map(w => [w.user_id, w]));
  const invByUser = investments.reduce((acc, inv) => {
    if (!acc[inv.user_id]) acc[inv.user_id] = [];
    acc[inv.user_id].push(inv);
    return acc;
  }, {});

  const balanceMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) throw new Error('Invalid amount');
      let w = walletMap[action.userId];
      if (!w) {
        w = await base44.entities.Wallet.create({ user_id: action.userId, balance: 0, total_invested: 0, total_earnings: 0, total_withdrawn: 0 });
      }
      const newBal = action.type === 'credit' ? (w.balance || 0) + amt : Math.max(0, (w.balance || 0) - amt);
      const extra = action.type === 'credit' ? { total_earnings: (w.total_earnings || 0) + amt } : {};
      await base44.entities.Wallet.update(w.id, { balance: newBal, ...extra });
      await base44.entities.Transaction.create({
        user_id: action.userId,
        type: action.type === 'credit' ? 'admin_credit' : 'admin_debit',
        amount: amt, status: 'completed',
        description: note || (action.type === 'credit' ? 'Credit' : 'Debit'),
      });
    },
    onSuccess: () => {
      toast.success('Balance updated');
      qc.invalidateQueries({ queryKey: ['admin-wallets'] });
      setAction(null); setAmount(''); setNote('');
    },
    onError: err => toast.error(err.message),
  });

  const tradePnlMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(tradeAmount);
      if (isNaN(amt) || amt <= 0) throw new Error('Invalid amount');
      const inv = investments.find(i => i.id === tradeAction.invId);
      if (!inv) throw new Error('Investment not found');
      const currentPnl = inv.profit_loss || 0;
      const newPnl = tradeAction.type === 'profit' ? currentPnl + amt : currentPnl - amt;
      const newValue = (inv.amount_invested || 0) + newPnl;
      await base44.entities.Investment.update(inv.id, {
        profit_loss: parseFloat(newPnl.toFixed(2)),
        current_value: parseFloat(newValue.toFixed(2)),
      });
    },
    onSuccess: () => {
      toast.success('Trade P&L updated');
      qc.invalidateQueries({ queryKey: ['admin-investments-all'] });
      setTradeAction(null); setTradeAmount('');
    },
    onError: err => toast.error(err.message),
  });

  const filtered = users.filter(u => u.role !== 'admin' && (
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Users & Balances
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user balances and trade P&L</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="balances">💰 Balances</TabsTrigger>
          <TabsTrigger value="trades">📊 Trade P&L</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-primary" /></div>
      ) : tab === 'balances' ? (
        <div className="space-y-3">
          {filtered.map(user => {
            const w = walletMap[user.id];
            const isOpen = action?.userId === user.id;
            return (
              <Card key={user.id} className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                    {(user.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-semibold text-sm">{user.full_name || 'No Name'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-display font-bold text-lg">${(w?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-sm text-blue-500">${(w?.total_invested || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Invested</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-sm text-emerald-500">${(w?.total_earnings || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Earnings</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-8"
                      onClick={() => { setAction({ userId: user.id, type: 'credit' }); setAmount(''); setNote(''); }}>
                      <Plus className="w-3.5 h-3.5" /> Credit
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1 h-8"
                      onClick={() => { setAction({ userId: user.id, type: 'debit' }); setAmount(''); setNote(''); }}>
                      <Minus className="w-3.5 h-3.5" /> Debit
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <p className="text-sm font-semibold">{action.type === 'credit' ? '➕ Add Funds' : '➖ Remove Funds'}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Amount (USD)</Label>
                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1" placeholder="0.00" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Note (optional)</Label>
                        <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1" placeholder="Reason..." />
                      </div>
                    </div>
                    {amount && (
                      <p className="text-xs text-muted-foreground">New balance: <span className="font-bold">${(action.type === 'credit' ? (w?.balance || 0) + (parseFloat(amount) || 0) : Math.max(0, (w?.balance || 0) - (parseFloat(amount) || 0))).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className={action.type === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                        onClick={() => balanceMutation.mutate()} disabled={balanceMutation.isPending || !amount}>
                        {balanceMutation.isPending ? 'Saving...' : 'Confirm'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAction(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        // Trade P&L tab
        <div className="space-y-4">
          {filtered.map(user => {
            const userInvs = (invByUser[user.id] || []).filter(i => i.status === 'active');
            if (userInvs.length === 0) return null;
            const isExpanded = expandedUser === user.id;
            return (
              <Card key={user.id} className="overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                      {(user.full_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{user.full_name || 'No Name'}</p>
                      <p className="text-xs text-muted-foreground">{userInvs.length} active trade{userInvs.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border/30 divide-y divide-border/20">
                    {userInvs.map(inv => {
                      const pnl = inv.profit_loss || 0;
                      const isOpenAction = tradeAction?.invId === inv.id;
                      return (
                        <div key={inv.id} className="p-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                              {inv.asset_symbol?.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-[120px]">
                              <p className="font-semibold text-sm">{inv.asset_symbol}</p>
                              <div className="flex gap-1 mt-0.5">
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${inv.position_type === 'long' ? 'border-emerald-300 text-emerald-600' : 'border-red-300 text-red-600'}`}>{inv.position_type}</Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{inv.leverage}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">${(inv.amount_invested || 0).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Invested</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">P&L</p>
                            </div>
                            <div className="flex gap-2 ml-auto">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-7 text-xs"
                                onClick={() => { setTradeAction({ invId: inv.id, type: 'profit' }); setTradeAmount(''); }}>
                                <TrendingUp className="w-3 h-3" /> +Profit
                              </Button>
                              <Button size="sm" variant="destructive" className="gap-1 h-7 text-xs"
                                onClick={() => { setTradeAction({ invId: inv.id, type: 'loss' }); setTradeAmount(''); }}>
                                <TrendingDown className="w-3 h-3" /> +Loss
                              </Button>
                            </div>
                          </div>
                          {isOpenAction && (
                            <div className="mt-3 pt-3 border-t border-border/30 flex items-end gap-3">
                              <div className="flex-1">
                                <Label className="text-xs text-muted-foreground">
                                  {tradeAction.type === 'profit' ? '📈 Add Profit Amount' : '📉 Add Loss Amount'}
                                </Label>
                                <Input type="number" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} className="mt-1" placeholder="0.00" />
                              </div>
                              <Button size="sm" className={tradeAction.type === 'profit' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                                onClick={() => tradePnlMutation.mutate()} disabled={tradePnlMutation.isPending || !tradeAmount}>
                                {tradePnlMutation.isPending ? 'Saving...' : 'Apply'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setTradeAction(null)}>Cancel</Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
          {filtered.every(u => (invByUser[u.id] || []).filter(i => i.status === 'active').length === 0) && (
            <Card className="p-10 text-center">
              <p className="text-muted-foreground text-sm">No active trades found</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}