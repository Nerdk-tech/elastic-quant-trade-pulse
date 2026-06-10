import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Stock logos from official sources
const STOCK_LOGOS = {
  TSLA: 'https://logo.clearbit.com/tesla.com',
  AAPL: 'https://logo.clearbit.com/apple.com',
  NVDA: 'https://logo.clearbit.com/nvidia.com',
  AMZN: 'https://logo.clearbit.com/amazon.com',
  MSFT: 'https://logo.clearbit.com/microsoft.com',
  GOOGL: 'https://logo.clearbit.com/google.com',
  META: 'https://logo.clearbit.com/meta.com',
  NFLX: 'https://logo.clearbit.com/netflix.com',
  PYPL: 'https://logo.clearbit.com/paypal.com',
  AMD: 'https://logo.clearbit.com/amd.com',
  COIN: 'https://logo.clearbit.com/coinbase.com',
  HOOD: 'https://logo.clearbit.com/robinhood.com',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { query = '', symbol = '' } = body;

    // If searching by query text, use CoinGecko search
    if (query) {
      const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });
      const searchData = await searchRes.json();
      const coinIds = (searchData.coins || []).slice(0, 8).map(c => c.id);
      if (coinIds.length === 0) return Response.json({ assets: [] });
      const priceUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h`;
      const priceRes = await fetch(priceUrl, { headers: { 'Accept': 'application/json' } });
      const priceData = await priceRes.json();
      const assets = (priceData || []).map(c => ({
        id: c.id, name: c.name, symbol: c.symbol.toUpperCase(),
        price: c.current_price,
        change: parseFloat((c.price_change_percentage_24h || 0).toFixed(2)),
        type: 'crypto', marketCap: c.market_cap, image: c.image,
        apy: parseFloat((80 + Math.random() * 60).toFixed(1)),
        coingeckoId: c.id,
      }));
      return Response.json({ assets });
    }

    // Fetch crypto prices from CoinGecko
    const defaultCoins = 'bitcoin,ethereum,solana,dogecoin,pepe,shiba-inu,litecoin,ripple,cardano,avalanche-2,chainlink,polkadot,uniswap,the-open-network,sui,bnb,tron,near,internet-computer,aptos';
    const priceUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${defaultCoins}&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h`;
    const priceRes = await fetch(priceUrl, { headers: { 'Accept': 'application/json' } });
    const priceData = await priceRes.json();

    const memeCoins = new Set(['dogecoin','pepe','shiba-inu','floki','bonk','baby-doge-coin','dogelon-mars']);

    const cryptoAssets = (priceData || []).map(c => ({
      id: c.id, name: c.name, symbol: c.symbol.toUpperCase(),
      price: c.current_price,
      change: parseFloat((c.price_change_percentage_24h || 0).toFixed(2)),
      type: memeCoins.has(c.id) ? 'meme' : 'crypto',
      marketCap: c.market_cap, image: c.image,
      apy: parseFloat((80 + Math.random() * 60).toFixed(1)),
      coingeckoId: c.id,
    }));

    // Fetch real stock prices from Yahoo Finance (via yfinance-compatible API)
    // Using a public proxy for real-time stock prices
    const stockSymbols = ['TSLA', 'AAPL', 'NVDA', 'AMZN', 'MSFT', 'GOOGL', 'META', 'NFLX', 'COIN', 'AMD'];
    let stockAssets = [];
    
    try {
      const stockUrl = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${stockSymbols.join(',')}&range=1d&interval=5m`;
      const stockRes = await fetch(stockUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      const stockData = await stockRes.json();
      const sparklineResult = stockData?.spark?.result || [];
      
      stockAssets = sparklineResult.map(s => {
        const sym = s.symbol;
        const closes = s.response?.[0]?.indicators?.quote?.[0]?.close || [];
        const validCloses = closes.filter(v => v != null);
        const lastPrice = validCloses[validCloses.length - 1] || 0;
        const openPrice = validCloses[0] || lastPrice;
        const change = openPrice > 0 ? parseFloat(((lastPrice - openPrice) / openPrice * 100).toFixed(2)) : 0;
        return {
          id: sym.toLowerCase(),
          name: { TSLA:'Tesla',AAPL:'Apple',NVDA:'Nvidia',AMZN:'Amazon',MSFT:'Microsoft',GOOGL:'Alphabet',META:'Meta',NFLX:'Netflix',COIN:'Coinbase',AMD:'AMD' }[sym] || sym,
          symbol: sym,
          price: parseFloat(lastPrice.toFixed(2)),
          change,
          type: 'stock',
          image: STOCK_LOGOS[sym] || null,
          apy: parseFloat((70 + Math.random() * 50).toFixed(1)),
          tradingviewSymbol: `NASDAQ:${sym}`,
        };
      }).filter(s => s.price > 0);
    } catch (_e) {
      // Fallback stock prices if API fails
      const fallback = [
        { sym:'TSLA', name:'Tesla', price:312.8, change:-1.34 },
        { sym:'AAPL', name:'Apple', price:198.5, change:0.87 },
        { sym:'NVDA', name:'Nvidia', price:892.3, change:2.15 },
        { sym:'AMZN', name:'Amazon', price:185.6, change:1.45 },
        { sym:'MSFT', name:'Microsoft', price:420.1, change:0.65 },
        { sym:'GOOGL', name:'Alphabet', price:175.2, change:1.12 },
        { sym:'META', name:'Meta', price:490.3, change:2.88 },
        { sym:'NFLX', name:'Netflix', price:625.4, change:0.55 },
        { sym:'COIN', name:'Coinbase', price:218.9, change:3.21 },
        { sym:'AMD', name:'AMD', price:168.7, change:1.77 },
      ];
      stockAssets = fallback.map(s => ({
        id: s.sym.toLowerCase(), name: s.name, symbol: s.sym,
        price: s.price, change: s.change, type: 'stock',
        image: STOCK_LOGOS[s.sym] || null,
        apy: parseFloat((70 + Math.random() * 50).toFixed(1)),
        tradingviewSymbol: `NASDAQ:${s.sym}`,
      }));
    }

    return Response.json({ assets: [...cryptoAssets, ...stockAssets] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});