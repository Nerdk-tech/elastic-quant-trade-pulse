import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, Edit, Search } from 'lucide-react';

export default function AdminInvestments() {
  const [selectedInv, setSelectedInv] = useState(null);
  const [profitLoss, setProfitLoss] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: investments = [] } = useQuery({
    queryKey: ['admin-investments'],
    queryFn: () => base44.entities.Investment.list('-created_date'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const getUser = (id) => users.find(u => u.id === id);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInv) return;
      const pl = parseFloat(profitLoss);
      const cv = parseFloat(currentValue);

      const updateData = {};
      if (!isNaN(pl)) updateData.profit_loss = pl;
      if (!isNaN(cv)) updateData.current_value = cv;

      await base44.entities.Investment.update(selectedInv.id, updateData);

      if (!isNaN(pl) && pl > 0) {
        const wallets = await base44.entities.Wallet.filter({ user_id: selectedInv.user_id });
        if (wallets.length > 0) {
          const oldPL = selectedInv.profit_loss || 0;
          const diff = pl - oldPL;
          if (diff > 0) {
            await base44.entities.Wallet.update(wallets[0].id, {
              total_earnings: (wallets[0].total_earnings || 0) + diff,
            });
          }
        }
      }
    },
    onSuccess: () => {
      toast.success('Investment updated');
      queryClient.invalidateQueries({ queryKey: ['admin-investments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      setSelectedInv(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const closeMutation = useMutation({
    mutationFn: async (inv) => {
      await base44.entities.Investment.update(inv.id, { status: 'closed' });

      const wallets = await base44.entities.Wallet.filter({ user_id: inv.user_id });
      if (wallets.length > 0) {
        const returnAmount = (inv.amount_invested || 0) + (inv.profit_loss || 0);
        await base44.entities.Wallet.update(wallets[0].id, {
          balance: (wallets[0].balance || 0) + returnAmount,
        });
        await base44.entities.Transaction.create({
          user_id: inv.user_id,
          type: 'earning',
          amount: returnAmount,
          status: 'completed',
          description: `Closed ${inv.asset_symbol} position - returned $${returnAmount.toLocaleString()}`,
          asset: inv.asset_symbol,
        });
      }
    },
    onSuccess: () => {
      toast.success('Position closed and funds returned');
      queryClient.invalidateQueries({ queryKey: ['admin-investments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = investments.filter(i => {
    const user = getUser(i.user_id);
    return (
      (i.asset_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.asset_symbol || '').toLowerCase().includes(search.toLowerCase()) ||
      (user?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user?.email || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Investments</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all user investments, update P&L, and close positions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by asset or user..." className="pl-9 bg-card" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 bg-card border-border/50 text-center">
            <p className="text-sm text-muted-foreground">No investments found</p>
          </Card>
        ) : (
          filtered.map(inv => {
            const user = getUser(inv.user_id);
            const pl = inv.profit_loss || 0;
            return (
              <Card key={inv.id} className="p-4 bg-card border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-sm text-primary flex-shrink-0">
                      {inv.asset_symbol?.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{inv.asset_name}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{inv.position_type}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{inv.leverage}</Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${inv.status === 'active' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' : 'border-muted text-muted-foreground'}`}>
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user?.full_name || user?.email || inv.user_id} · Invested: ${(inv.amount_invested || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-semibold ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pl >= 0 ? '+' : ''}${pl.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">P&L</p>
                    </div>
                    {inv.status === 'active' && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                          setSelectedInv(inv);
                          setProfitLoss(String(inv.profit_loss || 0));
                          setCurrentValue(String(inv.current_value || inv.amount_invested || 0));
                        }}>
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/20 hover:bg-amber-500/10" onClick={() => closeMutation.mutate(inv)}>
                          Close
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!selectedInv} onOpenChange={() => setSelectedInv(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Investment — {selectedInv?.asset_symbol}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Profit / Loss ($)</Label>
              <Input type="number" value={profitLoss} onChange={e => setProfitLoss(e.target.value)} className="bg-secondary mt-1" placeholder="e.g. 500 or -200" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Current Value ($)</Label>
              <Input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="bg-secondary mt-1" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}