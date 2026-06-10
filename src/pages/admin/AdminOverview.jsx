import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, Wallet, TrendingUp, ArrowUpRight, Clock, MessageCircle, ArrowDownToLine, LayoutDashboard } from 'lucide-react';

export default function AdminOverview() {
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: () => base44.entities.User.list() });
  const { data: wallets = [] } = useQuery({ queryKey: ['admin-wallets'], queryFn: () => base44.entities.Wallet.list() });
  const { data: investments = [] } = useQuery({ queryKey: ['admin-investments'], queryFn: () => base44.entities.Investment.list() });
  const { data: withdrawals = [] } = useQuery({ queryKey: ['admin-withdrawals'], queryFn: () => base44.entities.Withdrawal.list() });
  const { data: deposits = [] } = useQuery({ queryKey: ['admin-deposits'], queryFn: () => base44.entities.Deposit.list() });
  const { data: support = [] } = useQuery({ queryKey: ['admin-support'], queryFn: () => base44.entities.SupportMessage.list() });

  const regularUsers = users.filter(u => u.role !== 'admin');
  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);
  const totalInvested = wallets.reduce((s, w) => s + (w.total_invested || 0), 0);
  const totalWithdrawn = wallets.reduce((s, w) => s + (w.total_withdrawn || 0), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const openTickets = support.filter(s => s.status === 'open').length;
  const activeInvestments = investments.filter(i => i.status === 'active').length;

  const stats = [
    { label: 'Total Users', value: regularUsers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Balance', value: `$${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Invested', value: `$${totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Withdrawn', value: `$${totalWithdrawn.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const alerts = [
    pendingWithdrawals > 0 && { label: `${pendingWithdrawals} pending withdrawal${pendingWithdrawals > 1 ? 's' : ''}`, path: '/admin/withdrawals', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
    pendingDeposits > 0 && { label: `${pendingDeposits} pending deposit${pendingDeposits > 1 ? 's' : ''}`, path: '/admin/deposits', color: 'bg-blue-50 border-blue-200 text-blue-800' },
    openTickets > 0 && { label: `${openTickets} open support ticket${openTickets > 1 ? 's' : ''}`, path: '/admin/support', color: 'bg-red-50 border-red-200 text-red-800' },
  ].filter(Boolean);

  const quickLinks = [
    { label: 'Users & Balances', path: '/admin/balances', icon: Users, desc: 'Manage user balances' },
    { label: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpRight, desc: `${pendingWithdrawals} pending` },
    { label: 'Deposits', path: '/admin/deposits', icon: ArrowDownToLine, desc: `${pendingDeposits} pending` },
    { label: 'Support', path: '/admin/support', icon: MessageCircle, desc: `${openTickets} open` },
    { label: 'Investments', path: '/admin/investments', icon: TrendingUp, desc: `${activeInvestments} active` },
    { label: 'Security Codes', path: '/admin/impersonate', icon: LayoutDashboard, desc: 'Login as user' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">System-wide summary and quick actions</p>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <Link key={i} to={a.path} className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${a.color} hover:opacity-80 transition-opacity`}>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{a.label}</div>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl font-bold mt-0.5">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map(l => (
          <Link key={l.path} to={l.path}>
            <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <l.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}