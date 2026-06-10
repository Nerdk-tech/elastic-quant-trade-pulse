import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, X, ExternalLink, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y'];

// Map timeframe to TradingView interval
const TF_MAP = {
  '1D': '60',    // 1-hour candles
  '1W': '240',   // 4-hour candles
  '1M': 'D',     // Daily candles
  '3M': 'W',     // Weekly candles
  '1Y': 'M',     // Monthly candles
};

function getTradingViewSymbol(asset) {
  if (asset.tradingviewSymbol) return asset.tradingviewSymbol;
  if (asset.type === 'stock') return `NASDAQ:${asset.symbol}`;
  // Crypto mapping
  const cryptoMap = {
    BTC: 'BINANCE:BTCUSDT',
    ETH: 'BINANCE:ETHUSDT',
    SOL: 'BINANCE:SOLUSDT',
    BNB: 'BINANCE:BNBUSDT',
    XRP: 'BINANCE:XRPUSDT',
    DOGE: 'BINANCE:DOGEUSDT',
    ADA: 'BINANCE:ADAUSDT',
    AVAX: 'BINANCE:AVAXUSDT',
    LINK: 'BINANCE:LINKUSDT',
    DOT: 'BINANCE:DOTUSDT',
    UNI: 'BINANCE:UNIUSDT',
    LTC: 'BINANCE:LTCUSDT',
    MATIC: 'BINANCE:MATICUSDT',
    TON: 'BINANCE:TONUSDT',
    SUI: 'BINANCE:SUIUSDT',
    TRX: 'BINANCE:TRXUSDT',
    NEAR: 'BINANCE:NEARUSDT',
    ICP: 'BINANCE:ICPUSDT',
    APT: 'BINANCE:APTUSDT',
    PEPE: 'BINANCE:PEPEUSDT',
    SHIB: 'BINANCE:SHIBUSDT',
  };
  return cryptoMap[asset.symbol] || `BINANCE:${asset.symbol}USDT`;
}

export default function TradeChartModal({ asset, investment, onClose, onOpenTrade, onCloseTrade }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartLoaded, setChartLoaded] = useState(false);
  const iframeRef = useRef(null);

  if (!asset) return null;

  const tvSymbol = getTradingViewSymbol(asset);
  const interval = TF_MAP[timeframe];
  
  const entryPrice = investment?.entry_price || asset.price;
  const targetPrice = investment?.target_price || (investment?.position_type === 'long' 
    ? entryPrice * 1.15 
    : entryPrice * 0.85);
  const currentPnl = investment?.profit_loss || 0;
  const pnlPct = investment?.amount_invested > 0 ? (currentPnl / investment.amount_invested * 100).toFixed(2) : '0.00';
  const isProfit = currentPnl >= 0;

  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(tvSymbol)}&interval=${interval}&theme=light&style=1&locale=en&toolbar_bg=%23f1f3f6&enable_publishing=false&hide_side_toolbar=false&allow_symbol_change=false&save_image=false&withdateranges=true&details=true&hotlist=true&calendar=false&studies=[]&hide_top_toolbar=false&hide_legend=false&container_id=tradingview_chart`;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-white border-gray-200 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {asset.image
              ? <img src={asset.image} alt={asset.symbol} className="w-9 h-9 rounded-full" />
              : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">{asset.symbol.slice(0,2)}</div>
            }
            <div>
              <h2 className="font-display font-bold text-gray-900">{asset.name} <span className="text-gray-400 font-normal text-sm">({asset.symbol})</span></h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-gray-900">
                  ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${asset.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {asset.change >= 0 ? '+' : ''}{asset.change}%
                </span>
              </div>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {TIMEFRAMES.map(tf => (
              <button key={tf} onClick={() => { setTimeframe(tf); setChartLoaded(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all ${timeframe === tf ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Trade info bar (if viewing open trade) */}
        {investment && (
          <div className={`px-4 py-3 border-b flex flex-wrap items-center gap-4 text-sm ${isProfit ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border font-display ${investment.position_type === 'long' ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : 'text-red-600 bg-red-100 border-red-200'}`}>
                {investment.position_type?.toUpperCase()}
              </span>
              <span className="font-display text-gray-600 text-xs">{investment.leverage}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-display">
              <BookOpen className="w-3 h-3" /> Entry: <span className="font-bold text-gray-900">${(entryPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-display">
              <Target className="w-3 h-3" /> Target: <span className="font-bold text-gray-900">${(targetPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-display ml-auto">
              <span className="text-gray-500">Invested: <span className="font-bold text-gray-900">${investment.amount_invested?.toLocaleString()}</span></span>
            </div>
            <div className={`flex items-center gap-1 font-display font-bold text-sm ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
              P&L: {isProfit ? '+' : ''}${currentPnl.toLocaleString()} ({isProfit ? '+' : ''}{pnlPct}%)
            </div>
            {onCloseTrade && (
              <Button size="sm"
                className={`gap-1.5 font-display text-xs h-8 ${isProfit ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                onClick={() => onCloseTrade(investment)}>
                {isProfit ? '✅ Secure Profit' : '⛔ Close & Exit'}
              </Button>
            )}
          </div>
        )}

        {/* TradingView Chart */}
        <div className="relative bg-gray-50" style={{ height: '480px' }}>
          {!chartLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-display">Loading live chart...</p>
              </div>
            </div>
          )}
          <iframe
            key={`${tvSymbol}-${interval}`}
            ref={iframeRef}
            src={chartUrl}
            className="w-full h-full border-0"
            onLoad={() => setChartLoaded(true)}
            title={`${asset.symbol} Chart`}
            allow="fullscreen"
          />
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
          <a href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary font-display transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Open in TradingView
          </a>
          {!investment && onOpenTrade && (
            <div className="flex gap-2">
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display"
                onClick={() => { onOpenTrade('long'); }}>
                <TrendingUp className="w-3.5 h-3.5" /> Long
              </Button>
              <Button size="sm" className="gap-1.5 bg-red-600 hover:bg-red-700 text-white font-display"
                onClick={() => { onOpenTrade('short'); }}>
                <TrendingDown className="w-3.5 h-3.5" /> Short
              </Button>
            </div>
          )}
          {investment && !onCloseTrade && (
            <span className="text-xs text-gray-400 font-display">Read-only view</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}