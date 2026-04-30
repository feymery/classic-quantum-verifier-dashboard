import { useCallback, useEffect, useRef, useState } from "react";
import { fetchJobHistory, deleteAllJobs } from "../services/apiClient";
import type { JobHistoryItem } from "../types/runner";

const DEFAULT_LIMIT = 20;

interface JobHistoryState {
  items: JobHistoryItem[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

export interface UseJobHistoryReturn {
  items: JobHistoryItem[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  /** Re-fetch from offset 0, replacing current list. */
  refetch: () => void;
  /** Load the next page and append to current list. */
  loadMore: () => void;
  /** Delete all completed/failed jobs on the backend and refresh. */
  clearHistory: () => Promise<void>;
}

export function useJobHistory(): UseJobHistoryReturn {
  const [state, setState] = useState<JobHistoryState>({
    items: [],
    total: 0,
    hasMore: false,
    loading: true,
    error: null,
  });

  // Track the current offset for pagination without triggering re-renders.
  const offsetRef = useRef(0);

  const fetchPage = useCallback(async (offset: number, replace: boolean) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { items, hasMore, total } = await fetchJobHistory(
        DEFAULT_LIMIT,
        offset,
      );
      setState((prev) => ({
        items: replace ? items : [...prev.items, ...items],
        total,
        hasMore,
        loading: false,
        error: null,
      }));
      offsetRef.current = offset + items.length;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load job history";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  // Initial load on mount.
  useEffect(() => {
    void fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => {
    offsetRef.current = 0;
    void fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      void fetchPage(offsetRef.current, false);
    }
  }, [fetchPage, state.hasMore, state.loading]);

  const clearHistory = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteAllJobs();
      offsetRef.current = 0;
      const { items, hasMore, total } = await fetchJobHistory(DEFAULT_LIMIT, 0);
      setState({ items, total, hasMore, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to clear job history";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  return {
    items: state.items,
    total: state.total,
    hasMore: state.hasMore,
    loading: state.loading,
    error: state.error,
    refetch,
    loadMore,
    clearHistory,
  };
}
