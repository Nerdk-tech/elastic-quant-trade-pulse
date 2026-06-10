import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Search, RefreshCw, Send, CheckCircle2, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminSupport() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const qc = useQueryClient();

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-support'],
    queryFn: () => base44.entities.SupportMessage.list('-created_date', 100),
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }) => {
      await base44.entities.SupportMessage.update(id, { reply, status: 'replied' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-support'] });
      toast.success('Reply sent');
      setSelected(null);
      setReply('');
    },
    onError: () => toast.error('Failed to send reply'),
  });

  const closeMutation = useMutation({
    mutationFn: (id) => base44.entities.SupportMessage.update(id, { status: 'closed' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-support'] }); toast.success('Ticket closed'); },
  });

  const filtered = messages.filter(m => {
    if (!search) return true;
    return m.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase());
  });

  const openCount = messages.filter(m => m.status === 'open').length;

  const statusBadge = (s) => ({
    open: <Badge className="bg-red-50 text-red-700 border border-red-200"><Clock className="w-3 h-3 mr-1" />Open</Badge>,
    replied: <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" />Replied</Badge>,
    closed: <Badge className="bg-gray-100 text-gray-600 border border-gray-200"><X className="w-3 h-3 mr-1" />Closed</Badge>,
  }[s] || <Badge>{s}</Badge>);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Support Messages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Respond to user support requests</p>
        </div>
        {openCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="font-display font-semibold text-red-700">{openCount} open</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-display">No support messages</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(msg => (
            <Card key={msg.id} className="p-4 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => { setSelected(msg); setReply(msg.reply || ''); }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                    {(msg.user_name || msg.user_email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{msg.user_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground truncate">{msg.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusBadge(msg.status)}
                  <span className="text-xs text-muted-foreground">{msg.created_date ? format(new Date(msg.created_date), 'MMM d') : ''}</span>
                </div>
              </div>
              {msg.subject && <p className="text-sm font-semibold mt-2">{msg.subject}</p>}
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.message}</p>
              {msg.reply && <p className="text-xs text-primary mt-2 line-clamp-1">Reply: {msg.reply}</p>}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Support Ticket
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-secondary/50 space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">From</span><span className="font-semibold">{selected.user_name || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selected.user_email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span>{statusBadge(selected.status)}</div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{selected.created_date ? format(new Date(selected.created_date), 'MMM d, yyyy · h:mm a') : '—'}</span></div>
              </div>

              {selected.subject && <div><p className="text-xs text-muted-foreground">Subject</p><p className="font-semibold">{selected.subject}</p></div>}

              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <div className="p-3 rounded-xl bg-secondary/50 text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Your Reply</label>
                <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." className="bg-secondary/50 mt-1" rows={3} />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => replyMutation.mutate({ id: selected.id, reply })} disabled={!reply.trim() || replyMutation.isPending}>
                  <Send className="w-4 h-4 mr-1" /> Send Reply
                </Button>
                <Button variant="outline" onClick={() => closeMutation.mutate(selected.id)} disabled={closeMutation.isPending}>
                  Close Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}