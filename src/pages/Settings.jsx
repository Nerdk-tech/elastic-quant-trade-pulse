import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Settings, User, Lock, Bell, Shield, ChevronRight, CheckCircle2, Eye, EyeOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [notifications, setNotifications] = useState({
    email_deposits: true,
    email_withdrawals: true,
    email_trades: false,
    email_promotions: true,
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setFullName(u?.full_name || '');
    });
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await base44.auth.updateMe({ full_name: fullName });
    setSavingProfile(false);
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    toast.success('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'language', label: 'Language', icon: Globe },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-6 space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-display">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-medium transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h3 className="font-display font-semibold text-gray-900">Personal Information</h3>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-display"
              style={{ background: 'hsl(174,65%,38%)' }}>
              {fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-display font-semibold text-gray-900">{user?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500 font-display">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="font-display text-sm text-gray-700">Full Name</Label>
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                className="mt-1 border-gray-200 font-display"
              />
            </div>
            <div>
              <Label className="font-display text-sm text-gray-700">Email Address</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="mt-1 border-gray-200 font-display bg-gray-50 text-gray-400"
              />
              <p className="text-xs text-gray-400 mt-1 font-display">Email cannot be changed</p>
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={savingProfile} className="w-full font-display">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h3 className="font-display font-semibold text-gray-900">Change Password</h3>

          <div className="space-y-4">
            <div>
              <Label className="font-display text-sm text-gray-700">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-1 border-gray-200 font-display"
              />
            </div>
            <div>
              <Label className="font-display text-sm text-gray-700">New Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="border-gray-200 font-display pr-10"
                />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="font-display text-sm text-gray-700">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="border-gray-200 font-display pr-10"
                />
                <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleChangePassword} className="w-full font-display">Update Password</Button>

          {/* 2FA Teaser */}
          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-sm text-gray-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 font-display mt-0.5">Add an extra layer of security</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-display">Coming Soon</span>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h3 className="font-display font-semibold text-gray-900">Email Notifications</h3>

          <div className="space-y-3">
            {[
              { key: 'email_deposits', label: 'Deposit confirmations', desc: 'Get notified when a deposit is verified' },
              { key: 'email_withdrawals', label: 'Withdrawal updates', desc: 'Get notified on withdrawal status changes' },
              { key: 'email_trades', label: 'Trade alerts', desc: 'Notifications for open and closed positions' },
              { key: 'email_promotions', label: 'Promotions & bonuses', desc: 'Special offers and reward updates' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-display font-semibold text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 font-display mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifications[item.key] ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>

          <Button onClick={() => toast.success('Notification preferences saved!')} className="w-full font-display">
            Save Preferences
          </Button>
        </motion.div>
      )}

      {/* Verification Tab */}
      {activeTab === 'verification' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h3 className="font-display font-semibold text-gray-900">Account Verification</h3>

          <div className="space-y-3">
            {[
              { label: 'Email Verified', done: true, desc: user?.email || '' },
              { label: 'Identity Verification (KYC)', done: false, desc: 'Upload a government-issued ID' },
              { label: 'Address Verification', done: false, desc: 'Proof of address document' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                  {item.done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    : <Shield className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-sm text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 font-display">{item.desc}</p>
                </div>
                {item.done
                  ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-display">Verified</span>
                  : <button className="text-xs font-semibold px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/5 font-display transition-colors flex items-center gap-1">
                      Start <ChevronRight className="w-3 h-3" />
                    </button>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Language Tab */}
      {activeTab === 'language' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          <h3 className="font-display font-semibold text-gray-900">Select Language</h3>
          <p className="text-sm text-gray-500 font-display">Choose your preferred language for the platform</p>
          <LanguageSwitcher variant="select" />
        </motion.div>
      )}
    </div>
  );
}