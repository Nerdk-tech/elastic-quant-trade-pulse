import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Bell, Gift, ArrowDownRight, ArrowUpRight, MessageCircle, TrendingUp, Zap, CheckCircle2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getImpersonatedUser } from '@/lib/impersonation';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';

const typeConfig = {
  deposit: { icon: ArrowDownRight, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Deposit' },
  withdrawal: { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-50', label: 'Withdrawal' },
  investment: { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Investment' },
  earning: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Earning' },
  bonus: { icon: Gift, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Bonus' },
  admin_credit: { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Credit' },
  admin_debit: { icon: DollarSign, color: 'text-red-500', bg: 'bg-red-50', label: 'Debit' },
};

const supportStatusColor = {
  open: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  replied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-50 text-gray-500 border-gray-200',
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const impersonated = getImpersonatedUser();
  const { t } = useLanguage();

  useEffect(() => { base44.auth.me().then(setUser); }, []);
  const activeUserId = impersonated?.id || user?.id;

  const { data: transactions = [] } = useQuery({
    queryKey: ['notif-txns', activeUserId],
    queryFn: () => base44.entities.Transaction.filter({ user_id: activeUserId }, '-created_date', 30),
    enabled: !!activeUserId,
  });

  const { data: supportMessages = [] } = useQuery({
    queryKey: ['notif-support', activeUserId],
    queryFn: () => base44.entities.SupportMessage.filter({ user_id: activeUserId }, '-created_date'),
    enabled: !!activeUserId,
  });

  // Build notification items from transactions + support replies
  const txNotifications = transactions.map(tx => ({
    id: `tx-${tx.id}`,
    type: tx.type,
    title: tx.description || typeConfig[tx.type]?.label || 'Transaction',
    subtitle: `${['deposit', 'earning', 'bonus', 'admin_credit'].includes(tx.type) ? '+' : '-'}$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`,
    date: tx.created_date,
    category: 'transaction',
    positive: ['deposit', 'earning', 'bonus', 'admin_credit'].includes(tx.type),
    config: typeConfig[tx.type] || typeConfig.deposit,
  }));

  const supportNotifications = supportMessages
    .filter(m => m.reply)
    .map(msg => ({
      id: `sup-${msg.id}`,
      type: 'support',
      title: 'Support Reply',
      subtitle: msg.reply?.slice(0, 80) + (msg.reply?.length > 80 ? '…' : ''),
      date: msg.updated_date || msg.created_date,
      category: 'support',
      config: { icon: MessageCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Support' },
      status: msg.status,
    }));

  const allNotifications = [...txNotifications, ...supportNotifications]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = filter === 'all' ? allNotifications
    : filter === 'bonuses' ? allNotifications.filter(n => ['bonus', 'admin_credit', 'earning'].includes(n.type))
    : filter === 'support' ? allNotifications.filter(n => n.category === 'support')
    : allNotifications.filter(n => n.category === 'transaction');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'bonuses', label: 'Bonuses' },
    { id: 'support', label: 'Support' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 lg:pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> {t('notifications.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('notifications.subtitle')}</p>
      </div>

      {/* Pinned 15% bonus notification */}
      <Link to="/dashboard/deposit">
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl text-white cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, hsl(174,72%,20%) 0%, hsl(185,65%,35%) 100%)' }}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-display font-semibold text-white flex-1 leading-tight">
            {t('notifications.bonusPinned')}
          </p>
          <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 flex-shrink-0">+15%</span>
        </motion.div>
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all whitespace-nowrap flex-1 justify-center ${filter === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count badge */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 font-display">{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</p>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-12 bg-white border-gray-100 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-display font-semibold text-gray-500">{t('notifications.empty')}</p>
            <p className="text-xs text-gray-400 font-display mt-1">{t('notifications.emptySubtitle')}</p>
          </Card>
        ) : (
          filtered.map((n, i) => {
            const Icon = n.config.icon;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="p-4 bg-white border-gray-100 hover:border-primary/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.config.bg}`}>
                      <Icon className={`w-5 h-5 ${n.config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display font-semibold text-sm text-gray-900">{n.title}</p>
                        {n.date && (
                          <span className="text-[10px] text-gray-400 font-display whitespace-nowrap flex-shrink-0">
                            {formatDistanceToNow(new Date(n.date), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-0.5 font-display ${n.positive ? 'text-emerald-600 font-semibold' : n.category === 'support' ? 'text-gray-600' : 'text-red-500 font-semibold'}`}>
                        {n.subtitle}
                      </p>
                      {n.status && (
                        <span className={`mt-1.5 inline-block text-[10px] font-display font-semibold px-2 py-0.5 rounded-full border ${supportStatusColor[n.status]}`}>
                          {n.status}
                        </span>
                      )}
                    </div>
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