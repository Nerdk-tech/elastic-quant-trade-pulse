import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Users, Mail, Calendar } from 'lucide-react';

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: () => base44.entities.Wallet.list(),
  });

  const getWallet = (userId) => wallets.find(w => w.user_id === userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} registered users</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map(user => {
          const wallet = getWallet(user.id);
          return (
            <Card key={user.id} className="p-4 bg-card border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display font-bold text-sm text-primary flex-shrink-0">
                    {(user.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.full_name || 'No Name'}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className={user.role === 'admin' ? 'border-red-500/20 text-red-400 bg-red-500/10' : 'border-primary/20 text-primary bg-primary/10'}>
                    {user.role || 'user'}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold">${(wallet?.balance || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">balance</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}