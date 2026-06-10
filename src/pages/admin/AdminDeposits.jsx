import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Clock, Search, RefreshCw, ExternalLink, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminDeposits() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data: deposits = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: () => base44.entities.Deposit.list('-created_date', 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const updateDeposit = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Deposit.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-deposits'] }); toast.success('Status updated'); },
  });

  const approveDeposit = async (deposit) => {
    // Credit user wallet
    const wallets = await base44.entities.Wallet.filter({ user_id: deposit.user_id });
    if (wallets.length > 0) {
      const w = wallets[0];
      await base44.entities.Wallet.update(w.id, { balance: (w.balance || 0) + deposit.amount });
    } else {
      await base44.entities.Wallet.create({ user_id: deposit.user_id, balance: deposit.amount, total_invested: 0, total_earnings: 0, total_withdrawn: 0 });
    }
    // Log transaction
    await base44.entities.Transaction.create({
      user_id: deposit.user_id, type: 'deposit', amount: deposit.amount, currency: 'USD', status: 'completed',
      description: `Deposit via ${deposit.coin} — approved`, asset: deposit.coin,
    });
    updateDeposit.mutate({ id: deposit.id, status: 'confirmed' });
  };

  const filtered = deposits.filter(d => {
    const u = userMap[d.user_id];
    if (!search) return true;
    return u?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u?.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.coin?.toLowerCase().includes(search.toLowerCase());
  });

  const statusBadge = (s) => ({
    pending: <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>,
    confirmed: <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" />Confirmed</Badge>,
    rejected: <Badge className="bg-red-50 text-red-600 border border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>,
  }[s] || <Badge>{s}</Badge>);

  const pending = deposits.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <ArrowDownToLine className="w-6 h-6 text-primary" />
            Deposit Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve user deposit submissions</p>
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
          <Input placeholder="Search by user or coin..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ArrowDownToLine className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-display">No deposit requests yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const u = userMap[d.user_id];
            return (
              <Card key={d.id} className="p-4">
                <div className="flex flex-wrap items-start gap-4">
                  {/* User */}
                  <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                      {(u?.full_name || u?.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{u?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground truncate">{u?.email}</p>
                    </div>
                  </div>

                  {/* Amount & coin */}
                  <div className="flex-1 min-w-[120px]">
                    <p className="font-display text-xl font-bold text-gray-900">${d.amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground font-mono">{d.coin}</p>
                  </div>

                  {/* Date */}
                  <div className="flex-1 min-w-[100px]">
                    <p className="text-xs text-muted-foreground">{d.created_date ? format(new Date(d.created_date), 'MMM d, yyyy') : '—'}</p>
                    {d.tx_hash && <p className="font-mono text-xs text-gray-500 truncate max-w-[140px]" title={d.tx_hash}>{d.tx_hash}</p>}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {statusBadge(d.status)}
                    {d.screenshot_url && (
                      <a href={d.screenshot_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-xs"><ExternalLink className="w-3 h-3 mr-1" />Proof</Button>
                      </a>
                    )}
                    {d.status === 'pending' && (
                      <>
                        <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          onClick={() => approveDeposit(d)}>
                          <CheckCircle2 className="w-3 h-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                          onClick={() => updateDeposit.mutate({ id: d.id, status: 'rejected' })}>
                          <XCircle className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}