import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Search, RefreshCw, Loader2, Activity, BarChart2, ChevronUp, ChevronDown } from 'lucide-react';
import { useLivePrices } from '@/hooks/useLivePrices';
import { getImpersonatedUser } from '@/lib/impersonation';
import TradeChartModal from '@/components/trade/TradeChartModal';

function PriceTag({ price, change }) {
  const fmt = price < 0.001 ? price.toFixed(8) : price < 1 ? price.toFixed(4) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div>
      <p className="font-mono text-lg font-bold">${fmt}</p>
      <div className={`flex items-center gap-1 mt-0.5 ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {change >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span className="text-xs font-semibold">{change >= 0 ? '+' : ''}{change}%</span>
      </div>
    </div>
  );
}

export default function Trade() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [chartAsset, setChartAsset] = useState(null);
  const [defaultPosition, setDefaultPosition] = useState('long');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState('1x');
  const [position, setPosition] = useState('long');
  const queryClient = useQueryClient();
  const { assets, loading, searchAssets, refetch } = useLivePrices(30000);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const impersonated = getImpersonatedUser();
  useEffect(() => { base44.auth.me().then(setUser); }, []);
  const activeUserId = impersonated?.id || user?.id;

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets', activeUserId],
    queryFn: () => base44.entities.Wallet.filter({ user_id: activeUserId }),
    enabled: !!activeUserId,
  });
  const wallet = wallets[0];

  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const results = await searchAssets(search);
      setSearchResults(results);
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, searchAssets]);

  useEffect(() => {
    if (assets.length > 0) setLastUpdated(new Date());
  }, [assets]);

  const investMutation = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error('No wallet found. Please deposit funds first.');
      const investAmount = parseFloat(amount);
      if (isNaN(investAmount) || investAmount <= 0) throw new Error('Invalid amount');
      if (investAmount > (wallet.balance || 0)) throw new Error('Insufficient balance');

      await base44.entities.Investment.create({
        user_id: activeUserId,
        asset_name: selectedAsset.name,
        asset_symbol: selectedAsset.symbol,
        asset_type: selectedAsset.type,
        amount_invested: investAmount,
        current_value: investAmount,
        profit_loss: 0,
        apy: selectedAsset.apy,
        status: 'active',
        leverage,
        position_type: position,
        entry_price: selectedAsset.price,
        target_price: position === 'long' ? selectedAsset.price * 1.15 : selectedAsset.price * 0.85,
      });
      await base44.entities.Transaction.create({
        user_id: activeUserId, type: 'investment', amount: investAmount,
        currency: 'USD', status: 'completed',
        description: `${position.toUpperCase()} ${selectedAsset.symbol} @ ${leverage}`,
        asset: selectedAsset.symbol,
      });
      await base44.entities.Wallet.update(wallet.id, {
        balance: (wallet.balance || 0) - investAmount,
        total_invested: (wallet.total_invested || 0) + investAmount,
      });
    },
    onSuccess: () => {
      toast.success('Trade executed!');
      queryClient.invalidateQueries({ queryKey: ['wallets', activeUserId] });
      queryClient.invalidateQueries({ queryKey: ['investments', activeUserId] });
      setSelectedAsset(null);
      setChartAsset(null);
      setAmount('');
    },
    onError: (err) => toast.error(err.message),
  });

  const displayAssets = searchResults !== null ? searchResults : assets;
  const filtered = displayAssets.filter(a => {
    if (searchResults !== null) return true;
    return filter === 'all' || a.type === filter;
  });

  const typeColor = (type) => {
    if (type === 'crypto') return 'border-primary/20 text-primary bg-primary/5';
    if (type === 'stock') return 'border-blue-500/20 text-blue-500 bg-blue-500/5';
    return 'border-purple-500/20 text-purple-500 bg-purple-500/5';
  };

  const openChartForTrade = (asset, pos) => {
    setDefaultPosition(pos);
    setPosition(pos);
    setChartAsset(asset);
    setSelectedAsset(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Trade</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-display">Browse and invest in crypto, stocks & meme coins</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-display">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            Live · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <Button size="sm" variant="ghost" onClick={refetch} className="h-8 px-2">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Balance bar */}
      {wallet && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-display uppercase tracking-wide">Available Balance</p>
            <p className="font-display text-2xl font-bold text-gray-900">${(wallet.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready to trade
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
          <Input
            placeholder="Search any crypto, stock, memecoin..."
            className="pl-9 pr-9 bg-white border-gray-200 font-display"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={filter} onValueChange={v => { setFilter(v); setSearch(''); setSearchResults(null); }}>
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger value="all" className="font-display text-xs">All</TabsTrigger>
            <TabsTrigger value="crypto" className="font-display text-xs">Crypto</TabsTrigger>
            <TabsTrigger value="stock" className="font-display text-xs">Stocks</TabsTrigger>
            <TabsTrigger value="meme" className="font-display text-xs">Meme</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {searchResults !== null && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-display text-gray-500">Results for "<span className="font-semibold text-gray-800">{search}</span>" · {searchResults.length} found</p>
          <button className="text-xs text-primary font-display" onClick={() => { setSearch(''); setSearchResults(null); }}>Clear</button>
        </div>
      )}

      {/* Asset grid */}
      {loading && assets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 font-display text-gray-500">Fetching live prices...</span>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((asset, i) => (
              <motion.div key={asset.symbol + asset.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => setChartAsset(asset)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {asset.image ? (
                        <img src={asset.image} alt={asset.symbol} className="w-10 h-10 rounded-full object-contain bg-gray-50 border border-gray-100 p-0.5" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-primary/10 items-center justify-center font-display font-bold text-sm text-primary ${asset.image ? 'hidden' : 'flex'}`}>
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-sm text-gray-900">{asset.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{asset.symbol}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-display font-medium ${typeColor(asset.type)}`}>{asset.type}</span>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <PriceTag price={asset.price} change={asset.change} />
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-display">Est. APY</p>
                      <p className="font-display font-bold text-emerald-600">~{asset.apy}%</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 rounded-xl text-xs font-display font-semibold transition-all border flex items-center justify-center gap-1"
                      style={{ background: 'hsl(174,65%,96%)', color: 'hsl(174,65%,30%)', borderColor: 'hsl(174,65%,85%)' }}
                      onClick={e => { e.stopPropagation(); setChartAsset(asset); }}>
                      <BarChart2 className="w-3.5 h-3.5" /> Chart
                    </button>
                    <button
                      className="flex-1 py-2 rounded-xl text-xs font-display font-semibold transition-all border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1"
                      onClick={e => { e.stopPropagation(); setSelectedAsset(asset); setPosition('long'); }}>
                      <TrendingUp className="w-3.5 h-3.5" /> Trade
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && !searchLoading && (
            <div className="col-span-3 text-center py-16 text-gray-400 font-display">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No assets found for "{search}"</p>
            </div>
          )}
        </div>
      )}

      {/* Chart Modal */}
      {chartAsset && (
        <TradeChartModal
          asset={chartAsset}
          onClose={() => setChartAsset(null)}
          onOpenTrade={(pos) => {
            setSelectedAsset(chartAsset);
            setPosition(pos);
            setChartAsset(null);
          }}
        />
      )}

      {/* Trade Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => { setSelectedAsset(null); setAmount(''); }}>
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-3">
              {selectedAsset?.image ? (
                <img src={selectedAsset.image} alt={selectedAsset?.symbol} className="w-8 h-8 rounded-full object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {selectedAsset?.symbol?.slice(0, 2)}
                </div>
              )}
              <span>{selectedAsset?.name}</span>
              <span className="font-mono text-gray-400 text-sm">{selectedAsset?.symbol}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-display">Entry Price</span>
                <div className="text-right">
                  <p className="font-mono font-bold text-gray-900">
                    ${selectedAsset.price < 0.001 ? selectedAsset.price.toFixed(8) : selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs font-semibold ${selectedAsset.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}% 24h
                  </p>
                </div>
              </div>

              {/* Long/Short */}
              <div className="flex gap-2">
                <Button variant={position === 'long' ? 'default' : 'outline'} className={`flex-1 gap-2 font-display ${position === 'long' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`} onClick={() => setPosition('long')}>
                  <TrendingUp className="w-4 h-4" /> Long
                </Button>
                <Button variant={position === 'short' ? 'default' : 'outline'} className={`flex-1 gap-2 font-display ${position === 'short' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`} onClick={() => setPosition('short')}>
                  <TrendingDown className="w-4 h-4" /> Short
                </Button>
              </div>

              {/* Amount */}
              <div>
                <Label className="text-xs text-gray-500 font-display">Amount (USD)</Label>
                <div className="relative mt-1">
                  <Input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} className="bg-gray-50 border-gray-200 font-display pr-16" />
                  {wallet && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary font-display font-semibold px-1.5 py-0.5 rounded bg-primary/10"
                      onClick={() => setAmount(String(wallet.balance || 0))}>MAX</button>
                  )}
                </div>
                {wallet && <p className="text-xs text-gray-400 font-display mt-1">Available: ${(wallet.balance || 0).toLocaleString()}</p>}
              </div>

              {/* Leverage */}
              <div>
                <Label className="text-xs text-gray-500 font-display">Leverage</Label>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 mt-1 font-display"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['1x', '2x', '5x', '10x', '25x', '50x', '100x'].map(l => (
                      <SelectItem key={l} value={l} className="font-display">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target */}
              {amount && (
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-sm font-display">
                  <div className="flex justify-between"><span className="text-gray-500">Direction</span><span className={`font-semibold ${position === 'long' ? 'text-emerald-600' : 'text-red-500'}`}>{position.toUpperCase()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Leverage</span><span className="font-semibold">{leverage}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total Exposure</span><span className="font-semibold">${(parseFloat(amount || 0) * parseInt(leverage)).toLocaleString()}</span></div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Price (+15%)</span>
                    <span className="font-semibold text-emerald-600">${(selectedAsset.price * (position === 'long' ? 1.15 : 0.85)).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-500">Est. APY</span><span className="font-semibold text-emerald-600">~{selectedAsset.apy}%</span></div>
                </div>
              )}

              <Button
                className="w-full font-display font-semibold h-11"
                style={{ background: position === 'long' ? '#059669' : '#dc2626' }}
                onClick={() => investMutation.mutate()}
                disabled={investMutation.isPending || !amount}
              >
                {investMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {investMutation.isPending ? 'Executing...' : `Execute ${position.toUpperCase()} — ${selectedAsset.symbol}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}