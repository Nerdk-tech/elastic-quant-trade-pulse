import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useLivePrices(refreshInterval = 30000) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('getLivePrices', {});
      if (res.data?.assets) {
        setAssets(res.data.assets);
      }
    } catch (e) {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  const searchAssets = useCallback(async (query) => {
    if (!query || query.length < 2) return null;
    try {
      const res = await base44.functions.invoke('getLivePrices', { query });
      return res.data?.assets || [];
    } catch {
      return [];
    }
  }, []);

  return { assets, loading, searchAssets, refetch: fetchPrices };
}