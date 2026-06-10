import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, ChevronRight, ArrowLeft, Wallet, TrendingUp, TrendingDown, Edit, Plus, Minus, X } from 'lucide-react';

function PortfolioUserList({ users, wallets, onSelect, search, setSearch }) {
  const getWallet = (uid) => wallets.find(w => w.user_id === uid);
  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Portfolio Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a user to review and edit their full portfolio</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." className="pl-9 bg-card" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="space-y-2">
        {filtered.map(user => {
          const wallet = getWallet(user.id);
          const pl = wallet ? (wallet.total_earnings || 0) - (wallet.total_invested || 0) : 0;
          return (
            <Card key={user.id} className="p-4 bg-card border-border/50 hover:border-primary/30 cursor-pointer transition-all" onClick={() => onSelect(user)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-sm text-primary flex-shrink-0">
                  {(user.full_name || user.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.full_name || 'No Name'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-right mr-2">
                  <div>
                    <p className="font-display font-bold text-sm">${(wallet?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[11px] text-muted-foreground">Balance</p>
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pl >= 0 ? '+' : ''}${pl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Net P&L</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-10 bg-card border-border/50 text-center">
            <p className="text-sm text-muted-foreground">No users found</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function WalletEditDialog({ wallet, user, open, onClose, onSave }) {
  const [balance, setBalance] = useState('');
  const [totalInvested, setTotalInvested] = useState('');
  const [totalEarnings, setTotalEarnings] = useState('');
  const [totalWithdrawn, setTotalWithdrawn] = useState('');
  const [note, setNote] = useState('');

  React.useEffect(() => {
    if (open && wallet) {
      setBalance(String(wallet.balance || 0));
      setTotalInvested(String(wallet.total_invested || 0));
      setTotalEarnings(String(wallet.total_earnings || 0));
      setTotalWithdrawn(String(wallet.total_withdrawn || 0));
      setNote('');
    }
  }, [open, wallet]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Wallet — {user?.full_name || user?.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {[
            ['Balance (USD)', balance, setBalance],
            ['Total Invested', totalInvested, setTotalInvested],
            ['Total Earnings', totalEarnings, setTotalEarnings],
            ['Total Withdrawn', totalWithdrawn, setTotalWithdrawn],
          ].map(([label, val, setter]) => (
            <div key={label}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input type="number" value={val} onChange={e => setter(e.target.value)} className="bg-secondary mt-1" />
            </div>
          ))}
          <div>
            <Label className="text-xs text-muted-foreground">Admin Note (optional)</Label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} className="bg-secondary mt-1" rows={2} placeholder="Reason for update..." />
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={() => onSave({ balance: parseFloat(balance), total_invested: parseFloat(totalInvested), total_earnings: parseFloat(totalEarnings), total_withdrawn: parseFloat(totalWithdrawn) }, note)}>
            Save Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InvestmentEditDialog({ inv, open, onClose, onSave }) {
  const [profitLoss, setProfitLoss] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [status, setStatus] = useState('active');

  React.useEffect(() => {
    if (open && inv) {
      setProfitLoss(String(inv.profit_loss || 0));
      setCurrentValue(String(inv.current_value || inv.amount_invested || 0));
      setStatus(inv.status || 'active');
    }
  }, [open, inv]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Investment — {inv?.asset_symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-secondary/50 rounded-xl text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Asset</span><span className="font-medium">{inv?.asset_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount Invested</span><span className="font-medium">${(inv?.amount_invested || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Leverage</span><span className="font-medium">{inv?.leverage} {inv?.position_type}</span></div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Profit / Loss ($)</Label>
            <Input type="number" value={profitLoss} onChange={e => setProfitLoss(e.target.value)} className="bg-secondary mt-1" placeholder="e.g. 500 or -200" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Current Value ($)</Label>
            <Input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="bg-secondary mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Status</Label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={() => onSave({ profit_loss: parseFloat(profitLoss), current_value: parseFloat(currentValue), status })}>
            Save Investment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserPortfolioDetail({ user, wallets, investments, onBack, queryClient }) {
  const wallet = wallets.find(w => w.user_id === user.id);
  const userInvestments = investments.filter(i => i.user_id === user.id);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState(null);
  const [quickAction, setQuickAction] = useState(null); // {type:'credit'|'debit'}
  const [quickAmount, setQuickAmount] = useState('');
  const [quickNote, setQuickNote] = useState('');

  const activeInvs = userInvestments.filter(i => i.status === 'active');
  const totalInvested = activeInvs.reduce((s, i) => s + (i.amount_invested || 0), 0);
  const totalPL = activeInvs.reduce((s, i) => s + (i.profit_loss || 0), 0);
  const totalValue = activeInvs.reduce((s, i) => s + (i.current_value || i.amount_invested || 0), 0);

  const walletMutation = useMutation({
    mutationFn: async (data) => {
      if (wallet) {
        await base44.entities.Wallet.update(wallet.id, data.fields);
      } else {
        await base44.entities.Wallet.create({ user_id: user.id, ...data.fields });
      }
      if (data.note) {
        await base44.entities.Transaction.create({ user_id: user.id, type: 'admin_credit', amount: 0, status: 'completed', description: data.note || 'Credit' });
      }
    },
    onSuccess: () => { toast.success('Wallet updated'); queryClient.invalidateQueries({ queryKey: ['admin-wallets'] }); setWalletDialogOpen(false); },
    onError: err => toast.error(err.message),
  });

  const quickMutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(quickAmount);
      if (isNaN(amt) || amt <= 0) throw new Error('Invalid amount');
      let w = wallet;
      if (!w) {
        w = await base44.entities.Wallet.create({ user_id: user.id, balance: 0, total_invested: 0, total_earnings: 0, total_withdrawn: 0 });
      }
      const newBal = quickAction === 'credit' ? (w.balance || 0) + amt : Math.max(0, (w.balance || 0) - amt);
      const extra = quickAction === 'credit' ? { total_earnings: (w.total_earnings || 0) + amt } : {};
      await base44.entities.Wallet.update(w.id, { balance: newBal, ...extra });
      await base44.entities.Transaction.create({ user_id: user.id, type: quickAction === 'credit' ? 'admin_credit' : 'admin_debit', amount: amt, status: 'completed', description: quickNote || (quickAction === 'credit' ? 'Credit' : 'Debit') });
    },
    onSuccess: () => { toast.success('Balance updated'); queryClient.invalidateQueries({ queryKey: ['admin-wallets'] }); setQuickAction(null); setQuickAmount(''); setQuickNote(''); },
    onError: err => toast.error(err.message),
  });

  const invMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Investment.update(data.id, data.fields);
    },
    onSuccess: () => { toast.success('Investment updated'); queryClient.invalidateQueries({ queryKey: ['admin-investments'] }); setSelectedInv(null); },
    onError: err => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
            {(user.full_name || user.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">{user.full_name || 'No Name'}</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Balance', `$${(wallet?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'text-foreground'],
          ['Active Invested', `$${totalInvested.toLocaleString()}`, 'text-blue-400'],
          ['Total P&L', `${totalPL >= 0 ? '+' : ''}$${totalPL.toLocaleString()}`, totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'],
          ['Portfolio Value', `$${totalValue.toLocaleString()}`, 'text-foreground'],
        ].map(([label, val, cls]) => (
          <Card key={label} className="p-4 bg-card border-border/50">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-display text-lg font-bold mt-0.5 ${cls}`}>{val}</p>
          </Card>
        ))}
      </div>

      {/* Wallet section */}
      <Card className="p-5 bg-card border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold">Wallet</h2>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => setQuickAction('credit')}>
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
            <Button size="sm" variant="destructive" className="gap-1" onClick={() => setQuickAction('debit')}>
              <Minus className="w-3.5 h-3.5" /> Remove
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setWalletDialogOpen(true)}>
              <Edit className="w-3.5 h-3.5" /> Edit All
            </Button>
          </div>
        </div>

        {/* Quick action inline */}
        {quickAction && (
          <div className="mb-4 p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{quickAction === 'credit' ? 'Add Funds' : 'Remove Funds'}</span>
              <button onClick={() => setQuickAction(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Amount (USD)</Label>
                <Input type="number" value={quickAmount} onChange={e => setQuickAmount(e.target.value)} className="bg-card mt-1" placeholder="0.00" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Note</Label>
                <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} className="bg-card mt-1" placeholder="Optional..." />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New balance: <span className="font-bold text-foreground">
                ${(quickAction === 'credit'
                  ? (wallet?.balance || 0) + (parseFloat(quickAmount) || 0)
                  : Math.max(0, (wallet?.balance || 0) - (parseFloat(quickAmount) || 0))
                ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span></span>
              <Button size="sm" className={quickAction === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                onClick={() => quickMutation.mutate()} disabled={quickMutation.isPending}>
                {quickMutation.isPending ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['Balance', wallet?.balance || 0, 'text-foreground'],
            ['Total Invested', wallet?.total_invested || 0, 'text-blue-400'],
            ['Total Earnings', wallet?.total_earnings || 0, 'text-emerald-400'],
            ['Total Withdrawn', wallet?.total_withdrawn || 0, 'text-amber-400'],
          ].map(([l, v, cls]) => (
            <div key={l}>
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className={`font-semibold text-sm mt-0.5 ${cls}`}>${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Investments section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold">Investments ({userInvestments.length})</h2>
        </div>
        {userInvestments.length === 0 ? (
          <Card className="p-8 bg-card border-border/50 text-center">
            <p className="text-sm text-muted-foreground">No investments for this user</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {userInvestments.map(inv => {
              const pl = inv.profit_loss || 0;
              const roi = inv.amount_invested ? ((pl / inv.amount_invested) * 100).toFixed(1) : '0.0';
              return (
                <Card key={inv.id} className="p-4 bg-card border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-xs text-primary flex-shrink-0">
                      {inv.asset_symbol?.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-sm">{inv.asset_name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{inv.position_type}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{inv.leverage}</Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${inv.status === 'active' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-muted text-muted-foreground'}`}>
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span>Invested: <span className="text-foreground font-medium">${(inv.amount_invested || 0).toLocaleString()}</span></span>
                        <span>Current: <span className="text-foreground font-medium">${(inv.current_value || inv.amount_invested || 0).toLocaleString()}</span></span>
                        <span>ROI: <span className={pl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{pl >= 0 ? '+' : ''}{roi}%</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pl >= 0 ? '+' : ''}${pl.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">P&L</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setSelectedInv(inv)}>
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <WalletEditDialog
        wallet={wallet} user={user} open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        onSave={(fields, note) => walletMutation.mutate({ fields, note })}
      />
      <InvestmentEditDialog
        inv={selectedInv} open={!!selectedInv}
        onClose={() => setSelectedInv(null)}
        onSave={(fields) => invMutation.mutate({ id: selectedInv.id, fields })}
      />
    </div>
  );
}

export default function AdminPortfolios() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => base44.entities.User.list() });
  const { data: wallets = [] } = useQuery({ queryKey: ['admin-wallets'], queryFn: () => base44.entities.Wallet.list() });
  const { data: investments = [] } = useQuery({ queryKey: ['admin-investments'], queryFn: () => base44.entities.Investment.list('-created_date') });

  if (selectedUser) {
    return (
      <UserPortfolioDetail
        user={selectedUser}
        wallets={wallets}
        investments={investments}
        onBack={() => setSelectedUser(null)}
        queryClient={queryClient}
      />
    );
  }

  return (
    <PortfolioUserList
      users={users}
      wallets={wallets}
      onSelect={setSelectedUser}
      search={search}
      setSearch={setSearch}
    />
  );
}