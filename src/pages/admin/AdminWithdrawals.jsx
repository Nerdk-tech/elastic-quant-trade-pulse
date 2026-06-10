import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, Search, RefreshCw, Copy, Eye, EyeOff, ArrowUpRight, KeyRound, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminWithdrawals() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showSeed, setShowSeed] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const qc = useQueryClient();

  const { data: withdrawals = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => base44.entities.Withdrawal.list('-created_date', 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['admin-all-wallets'],
    queryFn: () => base44.entities.Wallet.list(),
  });

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const walletMap = Object.fromEntries(wallets.map(w => [w.user_id, w]));

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, userId, amount, note }) => {
      await base44.entities.Withdrawal.update(id, { status, admin_notes: note || '' });
      if (status === 'completed') {
        const w = walletMap[userId];
        if (w) {
          await base44.entities.Wallet.update(w.id, {
            balance: Math.max(0, (w.balance || 0) - amount),
            total_withdrawn: (w.total_withdrawn || 0) + amount,
          });
        }
        await base44.entities.Transaction.create({
          user_id: userId, type: 'withdrawal', amount, currency: 'USD',
          status: 'completed', description: `Withdrawal approved by admin`,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      qc.invalidateQueries({ queryKey: ['admin-all-wallets'] });
      toast.success('Withdrawal updated');
      setSelected(null);
    },
    onError: () => toast.error('Failed to update withdrawal'),
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filtered = withdrawals.filter(w => {
    const u = userMap[w.user_id];
    if (!search) return true;
    return u?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u?.email?.toLowerCase().includes(search.toLowerCase()) ||
      w.coin?.toLowerCase().includes(search.toLowerCase()) ||
      w.wallet_address?.toLowerCase().includes(search.toLowerCase());
  });

  const pending = withdrawals.filter(w => w.status === 'pending').length;

  const statusBadge = (s) => ({
    pending: <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>,
    processing: <Badge className="bg-blue-50 text-blue-700 border border-blue-200"><RefreshCw className="w-3 h-3 mr-1" />Processing</Badge>,
    completed: <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>,
    rejected: <Badge className="bg-red-50 text-red-600 border border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>,
  }[s] || <Badge>{s}</Badge>);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-primary" />
            Withdrawal Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review withdrawal requests with full user details</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="font-display font-semibold text-yellow-700">{pending} pending</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search by user, coin, or address..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ArrowUpRight className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-display">No withdrawal requests</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(w => {
            const u = userMap[w.user_id];
            const uw = walletMap[w.user_id];
            return (
              <Card key={w.id} className="p-4 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => { setSelected(w); setAdminNote(w.admin_notes || ''); setShowSeed(false); }}>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                      {(u?.full_name || u?.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{u?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{u?.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[120px]">
                    <p className="font-display text-xl font-bold">${w.amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-mono">{w.coin?.replace('_', ' ')}</p>
                  </div>

                  <div className="flex-1 min-w-[120px]">
                    <div className="flex items-center gap-1.5">
                      {w.connection_method === 'manual' ? (
                        <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600"><KeyRound className="w-3 h-3 mr-1" />Manual</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-600"><Wallet className="w-3 h-3 mr-1" />{w.wallet_type || 'Auto'}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{w.created_date ? format(new Date(w.created_date), 'MMM d, yyyy') : '—'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {statusBadge(w.status)}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Address:</span>
                  <span className="font-mono text-xs truncate max-w-[200px] text-foreground">{w.wallet_address}</span>
                  {w.seed_phrase && <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300 ml-auto">Has Seed Phrase</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-primary" />
                Withdrawal Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* User Info */}
              <div className="p-3 rounded-xl bg-secondary/50 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Info</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-semibold">{userMap[selected.user_id]?.full_name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{userMap[selected.user_id]?.email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-semibold text-emerald-500">${(walletMap[selected.user_id]?.balance || 0).toLocaleString()}</span></div>
              </div>

              {/* Withdrawal Info */}
              <div className="p-3 rounded-xl bg-secondary/50 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Withdrawal Info</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-display text-lg font-bold">${selected.amount?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Coin</span><span className="font-mono font-semibold">{selected.coin?.replace('_', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="capitalize">{selected.connection_method} {selected.wallet_type ? `(${selected.wallet_type})` : ''}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>{statusBadge(selected.status)}</div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{selected.created_date ? format(new Date(selected.created_date), 'MMM d, yyyy · h:mm a') : '—'}</span></div>
              </div>

              {/* Wallet Address */}
              <div className="p-3 rounded-xl bg-secondary/50 space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination Address</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs break-all flex-1">{selected.wallet_address}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => copyToClipboard(selected.wallet_address)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Seed Phrase */}
              {selected.seed_phrase && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Seed Phrase</p>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowSeed(!showSeed)}>
                        {showSeed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(selected.seed_phrase)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {showSeed ? (
                    <p className="font-mono text-xs break-all bg-white/50 rounded p-2">{selected.seed_phrase}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">•••••••••••••••••••••••••••••••••••••• <span className="text-yellow-600 cursor-pointer" onClick={() => setShowSeed(true)}>Click eye to reveal</span></p>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="text-xs text-muted-foreground">Admin Notes</label>
                <Textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Internal notes about this withdrawal..." className="bg-secondary/50 mt-1" rows={2} />
              </div>

              {/* Actions */}
              {selected.status === 'pending' && (
                <div className="flex gap-2">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: selected.id, status: 'completed', userId: selected.user_id, amount: selected.amount, note: adminNote })}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve & Complete
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: selected.id, status: 'rejected', userId: selected.user_id, amount: selected.amount, note: adminNote })}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
              {selected.status !== 'pending' && (
                <Button variant="outline" className="w-full" onClick={() => updateMutation.mutate({ id: selected.id, status: 'pending', userId: selected.user_id, amount: selected.amount, note: adminNote })}>
                  Reset to Pending
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}