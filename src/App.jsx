import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { LanguageProvider } from '@/lib/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthLayout from '@/components/AuthLayout';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import Trade from '@/pages/Trade';
import Portfolio from '@/pages/Portfolio';
import TradeHistory from '@/pages/TradeHistory';
import Transactions from '@/pages/Transactions';
import Deposit from '@/pages/Deposit';
import Settings from '@/pages/Settings';
import Staking from '@/pages/Staking';
import Airdrop from '@/pages/Airdrop';
import Referrals from '@/pages/Referrals';
import Notifications from '@/pages/Notifications';
import Support from '@/pages/Support';
import Withdraw from '@/pages/Withdraw';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminBalances from '@/pages/admin/AdminBalances';
import AdminInvestments from '@/pages/admin/AdminInvestments';
import AdminPortfolios from '@/pages/admin/AdminPortfolios';
import AdminImpersonate from '@/pages/admin/AdminImpersonate';
import AdminDeposits from '@/pages/admin/AdminDeposits';
import AdminWithdrawals from '@/pages/admin/AdminWithdrawals';
import AdminSupport from '@/pages/admin/AdminSupport';

export function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Landing />} />

            {/* Auth pages — redirect to /dashboard if already logged in */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="trade" element={<Trade />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="trade-history" element={<TradeHistory />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="deposit" element={<Deposit />} />
                <Route path="settings" element={<Settings />} />
                <Route path="withdraw" element={<Withdraw />} />
                <Route path="staking" element={<Staking />} />
                <Route path="airdrop" element={<Airdrop />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="support" element={<Support />} />
              </Route>
            </Route>

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="balances" element={<AdminBalances />} />
                <Route path="investments" element={<AdminInvestments />} />
                <Route path="portfolios" element={<AdminPortfolios />} />
                <Route path="impersonate" element={<AdminImpersonate />} />
                <Route path="deposits" element={<AdminDeposits />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="support" element={<AdminSupport />} />
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
