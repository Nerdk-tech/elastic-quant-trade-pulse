import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TradeChartModal from '@/components/trade/TradeChartModal';

export default function TradeHistory() {
  const [user, setUser] = useState(null);
  const [searchAsset, setSearchAsset] = useState('');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
  }, []);

  const { data: investments = [] } = useQuery({
    queryKey: ['investments', user?.id],
    queryFn: () => base44.entities.Investment.filter({ user_id: user?.id, status: 'closed' }),
    enabled: !!user?.id,
  });

  const closedTrades = investments.filter(trade => {
    if (!searchAsset) return true;
    return trade.asset_name.toLowerCase().includes(searchAsset.toLowerCase()) ||
           trade.asset_symbol.toLowerCase().includes(searchAsset.toLowerCase());
  });

  const totalProfit = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
  const totalRealizedPL = closedTrades.length > 0 ? totalProfit : 0;

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl font-bold text-gray-900">Trade History</h1>
        <p className="text-sm text-gray-500 font-display">View all your completed trades and performance</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500 font-display">Total Completed Trades</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 font-display">{closedTrades.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500 font-display">Realized P&L</p>
          <p className={`text-3xl font-bold mt-2 font-display ${totalRealizedPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalRealizedPL >= 0 ? '+' : ''} ${totalRealizedPL.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500 font-display">Win Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 font-display">
            {closedTrades.length > 0 ? `${((closedTrades.filter(t => t.profit_loss > 0).length / closedTrades.length) * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Input
          placeholder="Search by asset name or symbol..."
          value={searchAsset}
          onChange={(e) => setSearchAsset(e.target.value)}
          className="border-gray-200 font-display"
        />
      </motion.div>

      {/* Trades Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {closedTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 font-display">Asset</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 font-display">Entry Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 font-display">Exit Date</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 font-display">Entry Price</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 font-display">Exit Price</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 font-display">Invested</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 font-display">P&L</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-900 font-display">Return %</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 font-display">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {closedTrades.map((trade) => {
                  const returnPercent = ((trade.current_value - trade.amount_invested) / trade.amount_invested) * 100;
                  const isProfit = trade.profit_loss >= 0;
                  return (
                    <tr key={trade.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 font-display">{trade.asset_symbol}</p>
                          <p className="text-xs text-gray-500 font-display">{trade.asset_name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 font-display">{new Date(trade.created_date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 font-display">{new Date(trade.updated_date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-gray-900 font-semibold font-display">${trade.entry_price?.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-gray-900 font-semibold font-display">${(trade.current_value / (trade.amount_invested / trade.entry_price))?.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-gray-900 font-semibold font-display">${trade.amount_invested?.toFixed(2)}</p>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold font-display ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isProfit ? '+' : ''} ${trade.profit_loss?.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold font-display ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {returnPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            const assetObj = {
                              symbol: trade.asset_symbol,
                              name: trade.asset_name,
                              price: trade.entry_price,
                              change: ((trade.current_value - trade.amount_invested) / trade.amount_invested * 100),
                            };
                            setSelectedTrade({ asset: assetObj, investment: trade });
                            setShowChart(true);
                          }}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-gray-500 font-display">No completed trades yet</p>
              <p className="text-xs text-gray-400 font-display mt-1">Your closed trades will appear here</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Chart Modal */}
      {showChart && selectedTrade && (
        <TradeChartModal
          asset={selectedTrade.asset}
          investment={selectedTrade.investment}
          onClose={() => setShowChart(false)}
        />
      )}
    </div>
  );
}