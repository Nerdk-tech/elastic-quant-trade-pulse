import { useState, useEffect } from 'react';

// Fetches live prices directly from CoinGecko public API (no auth needed for landing page)
const COINS = 'bitcoin,ethereum,solana,dogecoin,ripple,cardano';

export function usePublicPrices() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINS}&vs_currencies=usd&include_24hr_change=true`;
      const res = await fetch(url);
      const data = await res.json();
      // Map to symbol-keyed
      const map = {
        BTC: { price: data.bitcoin?.usd, change: data.bitcoin?.usd_24h_change },
        ETH: { price: data.ethereum?.usd, change: data.ethereum?.usd_24h_change },
        SOL: { price: data.solana?.usd, change: data.solana?.usd_24h_change },
        DOGE: { price: data.dogecoin?.usd, change: data.dogecoin?.usd_24h_change },
        XRP: { price: data.ripple?.usd, change: data.ripple?.usd_24h_change },
        ADA: { price: data.cardano?.usd, change: data.cardano?.usd_24h_change },
      };
      setPrices(map);
    } catch {
      // keep stale
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return { prices, loading };
}