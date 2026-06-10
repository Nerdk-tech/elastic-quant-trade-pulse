import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, X, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const SUBJECTS = [
  'Withdrawal Issue',
  'Deposit Not Credited',
  'Account Access',
  'Investment Question',
  'Verification Help',
  'Other',
];

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const submit = async () => {
    if (!form.message.trim()) return toast.error('Please enter a message');
    if (!form.subject) return toast.error('Please select a subject');
    setLoading(true);
    await base44.entities.SupportMessage.create({
      user_id: user?.id || 'guest',
      user_name: user?.full_name || 'User',
      user_email: user?.email || '',
      subject: form.subject,
      message: form.message,
      status: 'open',
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <>
      {/* Floating buttons — support + telegram */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 flex flex-col items-center gap-2">
        <a
          href="https://t.me/Cortextradehq"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          style={{ background: '#229ED9' }}
          title="Telegram Support">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
        <button
          onClick={() => { setOpen(!open); setSent(false); }}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
          {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 right-4 z-50 w-80 md:bottom-24 shadow-2xl rounded-2xl overflow-hidden border border-border bg-card">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#229ED9' }}>
              <div className="flex items-center gap-2 text-white">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="font-semibold text-sm">Telegram Support</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {sent ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold">Message Sent!</p>
                  <p className="text-xs text-muted-foreground mt-1">We'll respond to your message as soon as possible.</p>
                  <Button size="sm" className="mt-4" onClick={() => { setSent(false); setForm({ subject: '', message: '' }); }}>Send Another</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <a href="https://t.me/Cortextradehq" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors mb-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#229ED9' }}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-800">Chat on Telegram</p>
                      <p className="text-[10px] text-blue-600">@Cortextradehq · Instant reply</p>
                    </div>
                  </a>
                  <p className="text-xs text-muted-foreground">Hi {user?.full_name?.split(' ')[0] || 'there'}! Or send a message below:</p>

                  <div>
                    <Label className="text-xs text-muted-foreground">Subject</Label>
                    <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                      <SelectTrigger className="bg-secondary/50 mt-1 text-sm h-9">
                        <SelectValue placeholder="Select topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Message</Label>
                    <Textarea
                      placeholder="Describe your issue..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="bg-secondary/50 mt-1 text-sm min-h-[80px]"
                      rows={3}
                    />
                  </div>

                  <Button onClick={submit} disabled={loading} className="w-full h-9 text-sm">
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}