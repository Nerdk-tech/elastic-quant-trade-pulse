import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Copy, Search, UserCheck, RefreshCw, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { startImpersonation } from '@/lib/impersonation';

export default function AdminImpersonate() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('adminImpersonate', { action: 'listUsersWithCodes' });
    setUsers(res.data.users || []);
    setLoading(false);
  };

  const toggleReveal = (userId) => {
    setRevealedCodes(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Security code copied!');
  };

  const verifyCode = async () => {
    if (!searchCode.trim()) return;
    setVerifying(true);
    setVerifiedUser(null);
    const res = await base44.functions.invoke('adminImpersonate', { action: 'verifyCode', securityCode: searchCode.trim().toUpperCase() });
    setVerifying(false);
    if (res.data.success) {
      setVerifiedUser(res.data.user);
      toast.success(`Code verified — User: ${res.data.user.full_name || res.data.user.email}`);
    } else {
      toast.error('Invalid security code');
    }
  };

  const loginAsUser = (user) => {
    startImpersonation(user);
    window.location.href = '/dashboard';
  };

  const filtered = users.filter(u => u.role !== 'admin' &&
    (!searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Security Codes & Account Access
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Each user has a unique security code. Use a code to verify & access a user's account.</p>
      </div>

      {/* Code Verifier */}
      <Card className="p-5 border-primary/20 bg-primary/5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" />
          Verify & Access User Account
        </h3>
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Enter user security code (e.g. AB12CD34)"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value.toUpperCase())}
            className="flex-1 font-mono tracking-widest text-center text-lg h-12 border-primary/30"
            maxLength={8}
            onKeyDown={e => e.key === 'Enter' && verifyCode()}
          />
          <Button onClick={verifyCode} disabled={verifying || !searchCode.trim()} className="h-12 px-6">
            {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {verifying ? 'Verifying...' : 'Verify Code'}
          </Button>
        </div>

        {verifiedUser && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-600">
                  {(verifiedUser.full_name || verifiedUser.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-emerald-800">{verifiedUser.full_name || 'No Name'}</p>
                  <p className="text-xs text-emerald-600">{verifiedUser.email}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => window.location.href = `/admin/balances`}>
                  Manage Balance
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => loginAsUser(verifiedUser)}>
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Login as User
                </Button>
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-3 font-mono">
              User ID: {verifiedUser.id}
            </p>
          </motion.div>
        )}
      </Card>

      {/* User list with codes */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h3 className="font-display font-semibold">All User Security Codes ({filtered.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm w-48" />
            </div>
            <Button size="sm" variant="outline" onClick={loadUsers}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((user, i) => (
              <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="p-4 border-border/50 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                      {(user.full_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{user.full_name || 'No Name'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
                      <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className={`font-mono font-bold tracking-widest text-sm ${revealedCodes[user.id] ? 'text-foreground' : 'text-muted-foreground blur-sm select-none'}`}>
                        {user.security_code || '--------'}
                      </span>
                      <button onClick={() => toggleReveal(user.id)} className="text-muted-foreground hover:text-foreground ml-1">
                        {revealedCodes[user.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => copyCode(user.security_code)} className="text-muted-foreground hover:text-primary ml-0.5">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white h-8 px-3"
                      onClick={() => loginAsUser(user)}>
                      <LogIn className="w-3.5 h-3.5 mr-1" />
                      Login
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}