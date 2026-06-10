import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Send, CheckCircle2, MessageCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const SUBJECTS = [
  'Withdrawal Issue', 'Deposit Not Credited', 'Account Access',
  'Investment Question', 'Verification Help', 'Bonus Question', 'Other',
];

const statusConfig = {
  open: { label: 'Open', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  replied: { label: 'Replied', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export default function Support() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: tickets = [] } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: () => base44.entities.SupportMessage.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.SupportMessage.create({
      user_id: user.id,
      user_name: user.full_name || 'User',
      user_email: user.email || '',
      subject: form.subject,
      message: form.message,
      status: 'open',
    }),
    onSuccess: () => {
      setSent(true);
      setForm({ subject: '', message: '' });
      qc.invalidateQueries({ queryKey: ['support-tickets', user?.id] });
      toast.success('Message sent! We\'ll reply soon.');
    },
  });

  const openCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" /> Support Center
        </h1>
        <p className="text-sm text-gray-500 mt-1">Send a message or track your support requests</p>
      </div>

      {/* Telegram Support Banner */}
      <a href="https://t.me/Cortextradehq" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 rounded-2xl text-white transition-all hover:opacity-90 shadow-md"
        style={{ background: 'linear-gradient(135deg, #1a8fc1 0%, #229ED9 60%, #2ab5f5 100%)' }}>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-white text-sm">Get Instant Support on Telegram</p>
          <p className="text-white/75 text-xs mt-0.5">Chat with us directly for faster responses · @Cortextradehq</p>
        </div>
        <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-white text-xs font-semibold">
          Open →
        </div>
      </a>

      {/* New ticket form */}
      <Card className="p-5 bg-white border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h2 className="font-display font-bold text-gray-900">New Support Request</h2>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-display font-bold text-gray-900">Message Sent!</p>
            <p className="text-sm text-gray-500 font-display mt-1">We'll respond within 24 hours.</p>
            <Button size="sm" className="mt-4" onClick={() => setSent(false)}>Send Another</Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-display font-semibold text-gray-500">Subject</Label>
              <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                <SelectTrigger className="mt-1 bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Select a topic..." />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-display font-semibold text-gray-500">Message</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="mt-1 bg-gray-50 border-gray-200 font-display min-h-[100px]"
                rows={4}
              />
            </div>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || !form.subject || !form.message.trim()}
              className="w-full gap-2 font-display">
              <Send className="w-4 h-4" />
              {submitMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        )}
      </Card>

      {/* Ticket history */}
      {tickets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-display font-semibold text-gray-500 uppercase tracking-widest">Your Tickets</p>
            {openCount > 0 && (
              <span className="text-xs font-display font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                {openCount} open
              </span>
            )}
          </div>
          <div className="space-y-2">
            {tickets.map((ticket, i) => {
              const isOpen = expanded === ticket.id;
              const cfg = statusConfig[ticket.status] || statusConfig.open;
              return (
                <motion.div key={ticket.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="bg-white border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setExpanded(isOpen ? null : ticket.id)}
                      className="w-full p-4 flex items-start gap-3 text-left hover:bg-gray-50/50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-sm text-gray-900">{ticket.subject || 'Support Request'}</p>
                          <Badge variant="outline" className={`text-[10px] font-display px-2 py-0.5 border ${cfg.className}`}>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 font-display mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ticket.created_date ? formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true }) : ''}
                        </p>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          className="overflow-hidden border-t border-gray-100">
                          <div className="p-4 space-y-3">
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <p className="text-xs font-display font-semibold text-gray-400 mb-1">Your Message</p>
                              <p className="text-sm text-gray-700 font-display leading-relaxed">{ticket.message}</p>
                            </div>
                            {ticket.reply && (
                              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                                <p className="text-xs font-display font-semibold text-primary mb-1 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Support Reply
                                </p>
                                <p className="text-sm text-gray-700 font-display leading-relaxed">{ticket.reply}</p>
                              </div>
                            )}
                            {!ticket.reply && (
                              <p className="text-xs text-gray-400 font-display text-center py-2">Awaiting reply from our team...</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}