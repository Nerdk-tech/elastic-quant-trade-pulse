import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownToLine, Copy, CheckCircle2, Upload, X, AlertCircle, ChevronDown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { haptic } from '@/lib/haptics';

const COINS = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin Network',
    address: 'bc1qe3npemu3s93esr8jzam3w8wrxdqyn3dsj2qsgt',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=bc1qe3npemu3s93esr8jzam3w8wrxdqyn3dsj2qsgt',
    color: '#F7931A',
    icon: '₿',
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'ERC-20 Network',
    address: '0x0C5F50682EA0B972Ab4FcD6167548ab73174FBda',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x0C5F50682EA0B972Ab4FcD6167548ab73174FBda',
    color: '#627EEA',
    icon: 'Ξ',
  },
  {
    id: 'SOL',
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana Network',
    address: 'DA6NgQJUC7Py9R69r2yKZfcmx2m6NN4ejemPFfRxPYYT',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=DA6NgQJUC7Py9R69r2yKZfcmx2m6NN4ejemPFfRxPYYT',
    color: '#9945FF',
    icon: '◎',
  },
  {
    id: 'USDT_ERC20',
    name: 'USDT (ERC-20)',
    symbol: 'USDT',
    network: 'Ethereum Network',
    address: '0x0C5F50682EA0B972Ab4FcD6167548ab73174FBda',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x0C5F50682EA0B972Ab4FcD6167548ab73174FBda',
    color: '#26A17B',
    icon: '₮',
  },
  {
    id: 'USDT_TRC20',
    name: 'USDT (TRC-20)',
    symbol: 'USDT',
    network: 'TRON Network',
    address: 'TEpCNz8FR75WAfwfkgQ4uugqngjvPCapEf',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TEpCNz8FR75WAfwfkgQ4uugqngjvPCapEf',
    color: '#26A17B',
    icon: '₮',
  },
  {
    id: 'TRX',
    name: 'TRON',
    symbol: 'TRX',
    network: 'TRON Network',
    address: 'TEpCNz8FR75WAfwfkgQ4uugqngjvPCapEf',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TEpCNz8FR75WAfwfkgQ4uugqngjvPCapEf',
    color: '#EB0029',
    icon: '◈',
  },
  {
    id: 'BNB',
    name: 'BNB',
    symbol: 'BNB',
    network: 'BEP-20 Network',
    address: '0x0C5F50682EA0B972Ab4FcD6167548ab73174FBda',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=0x0C5F50682EA0B972Ab4FcD6167548ab73174FBda',
    color: '#F3BA2F',
    icon: '◆',
  },
];

export default function Deposit() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: deposits = [] } = useQuery({
    queryKey: ['deposits', user?.id],
    queryFn: () => base44.entities.Deposit.filter({ user_id: user.id }, '-created_date', 10),
    enabled: !!user,
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedCoin.address);
    setCopied(true);
    haptic.success();
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    setUploadingFile(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setScreenshotUrl(file_url);
    setUploadingFile(false);
    toast.success('Screenshot uploaded!');
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) { haptic.error(); return toast.error('Enter a valid amount'); }
    if (!txHash && !screenshotUrl) { haptic.error(); return toast.error('Please provide a transaction hash or screenshot'); }
    if (!user) return;

    setSubmitting(true);
    await base44.entities.Deposit.create({
      user_id: user.id,
      amount: parseFloat(amount),
      coin: selectedCoin.id,
      status: 'pending',
      tx_hash: txHash,
      screenshot_url: screenshotUrl,
    });
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Deposit submitted! We will verify within 24h.');
  };

  const statusColor = (s) => s === 'confirmed' ? 'text-emerald-600 bg-emerald-50' : s === 'rejected' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50';

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Deposit Submitted!</h2>
          <p className="text-gray-500 font-display mb-6">Your deposit of <span className="font-bold text-gray-900">${parseFloat(amount).toLocaleString()}</span> via {selectedCoin.name} is under review. We'll verify and credit within 24 hours.</p>
          <Button onClick={() => { setSubmitted(false); setAmount(''); setTxHash(''); setScreenshot(null); setScreenshotUrl(''); }} variant="outline" className="font-display">Make Another Deposit</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowDownToLine className="w-6 h-6 text-primary" />
          {t('deposit.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-display">{t('deposit.subtitle')}</p>
      </div>

      {/* 15% Bonus Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 flex items-start gap-4 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(174,72%,20%) 0%, hsl(185,65%,35%) 100%)' }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="relative flex-1">
          <p className="font-display font-bold text-white text-sm">{t('deposit.bonusTitle')}</p>
          <p className="text-white/75 text-xs mt-0.5 leading-relaxed">{t('deposit.bonusText')}</p>
        </div>
        <div className="flex-shrink-0 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold self-center">
          +15%
        </div>
      </motion.div>

      {/* Step 1 — Select Coin */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="font-display font-semibold text-gray-900 mb-4">Step 1: Select Cryptocurrency</p>
        
        {/* Dropdown */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: selectedCoin.color }}>
              {selectedCoin.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="font-display font-semibold text-gray-900">{selectedCoin.name}</p>
              <p className="font-display text-xs text-gray-500">{selectedCoin.network}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 right-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                {COINS.map(coin => (
                  <button key={coin.id} onClick={() => { setSelectedCoin(coin); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCoin.id === coin.id ? 'bg-primary/5' : ''}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: coin.color }}>
                      {coin.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-display font-semibold text-sm text-gray-900">{coin.name}</p>
                      <p className="font-display text-xs text-gray-400">{coin.network}</p>
                    </div>
                    {selectedCoin.id === coin.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step 2 — Deposit address */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="font-display font-semibold text-gray-900 mb-4">Step 2: Send to This Address</p>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="p-2 rounded-xl border border-gray-200 bg-gray-50">
              <img src={selectedCoin.qr} alt="QR Code" className="w-[140px] h-[140px] rounded-lg" />
            </div>
            <p className="text-center text-xs text-gray-400 mt-1.5 font-display">Scan QR Code</p>
          </div>
          
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <p className="font-mono text-xs text-gray-700 break-all flex-1 leading-relaxed select-all">{selectedCoin.address}</p>
              <button onClick={copyAddress} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="font-display text-xs text-amber-700">
                Only send <strong>{selectedCoin.name}</strong> to this address via <strong>{selectedCoin.network}</strong>. Sending other coins may result in permanent loss.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 — Amount + Proof */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="font-display font-semibold text-gray-900 mb-4">Step 3: Enter Amount & Submit Proof</p>
        
        <div className="space-y-4">
          <div>
            <Label className="font-display text-sm text-gray-700">Amount (USD)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                className="pl-7 font-mono text-lg h-12 border-gray-200 focus:border-primary" />
            </div>
          </div>

          <div>
            <Label className="font-display text-sm text-gray-700">Transaction Hash / ID <span className="text-gray-400">(optional)</span></Label>
            <Input placeholder="0x123abc..." value={txHash} onChange={e => setTxHash(e.target.value)}
              className="font-mono mt-1 border-gray-200" />
          </div>

          <div>
            <Label className="font-display text-sm text-gray-700">Screenshot of Payment <span className="text-gray-400">(optional)</span></Label>
            <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {screenshot ? (
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="font-display text-sm text-emerald-700 font-medium">{screenshot.name}</p>
                  {uploadingFile && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-display text-sm text-gray-500">Click to upload screenshot</p>
                  <p className="font-display text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP</p>
                </div>
              )}
            </label>
          </div>

          <Button onClick={handleSubmit} disabled={submitting || uploadingFile} className="w-full h-12 font-display font-semibold text-base">
            {submitting ? 'Submitting...' : 'Submit Deposit for Verification'}
          </Button>
        </div>
      </div>

      {/* Deposit history */}
      {deposits.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-display font-semibold text-gray-900 mb-3">Deposit History</h3>
          <div className="space-y-2">
            {deposits.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="font-display font-semibold text-sm text-gray-900">${d.amount?.toLocaleString()} via {d.coin}</p>
                  <p className="font-display text-xs text-gray-400">{d.created_date ? new Date(d.created_date).toLocaleDateString() : '—'}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full font-display ${statusColor(d.status)}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}