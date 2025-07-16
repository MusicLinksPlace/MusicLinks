import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedQueryOptions<T> {
  queryFn: () => Promise<T>;
  dependencies?: any[];
  enabled?: boolean;
  cacheTime?: number;
  staleTime?: number;
}

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useOptimizedQuery = <T>({
  queryFn,
  dependencies = [],
  enabled = true,
  cacheTime = 5 * 60 * 1000, // 5 minutes
  staleTime = 30 * 1000 // 30 seconds
}: UseOptimizedQueryOptions<T>) => {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback(() => {
    return JSON.stringify(dependencies);
  }, [dependencies]);

  const isStale = useCallback((timestamp: number) => {
    return Date.now() - timestamp > staleTime;
  }, [staleTime]);

  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    const cacheKey = getCacheKey();
    const cached = cacheRef.current.get(cacheKey);

    // Return cached data if it's still fresh
    if (cached && !isStale(cached.timestamp)) {
      setState(prev => ({ ...prev, data: cached.data, loading: false, error: null }));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await queryFn();
      
      // Cache the result
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      // Clean up old cache entries
      const now = Date.now();
      for (const [key, value] of cacheRef.current.entries()) {
        if (now - value.timestamp > cacheTime) {
          cacheRef.current.delete(key);
        }
      }

      setState({ data, loading: false, error: null });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || 'Une erreur est survenue' 
        }));
      }
    }
  }, [queryFn, dependencies, enabled, cacheTime, staleTime, getCacheKey, isStale]);

  // Debounced query execution
  const debouncedExecuteQuery = useCallback(() => {
    const timeoutId = setTimeout(executeQuery, 100);
    return () => clearTimeout(timeoutId);
  }, [executeQuery]);

  useEffect(() => {
    const cleanup = debouncedExecuteQuery();
    return cleanup;
  }, [debouncedExecuteQuery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    const cacheKey = getCacheKey();
    cacheRef.current.delete(cacheKey);
    executeQuery();
  }, [executeQuery, getCacheKey]);

  return {
    ...state,
    refetch
  };
};

// Hook pour les requêtes avec pagination
export const usePaginatedQuery = <T>({
  queryFn,
  pageSize = 10,
  dependencies = []
}: {
  queryFn: (page: number, pageSize: number) => Promise<T[]>;
  pageSize?: number;
  dependencies?: any[];
}) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newData = await queryFn(page, pageSize);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData(prev => page === 1 ? newData : [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [queryFn, page, pageSize, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    reset();
    loadMore();
  }, [...dependencies]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
}; 