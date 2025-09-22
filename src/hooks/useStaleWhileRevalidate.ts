import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult, UseQueryOptions } from '@tanstack/react-query';

export function useStaleWhileRevalidate<TData, TError = unknown>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> & { isStale: boolean } {
  const query = useQuery(options);
  
  // Consider data stale if it's older than staleTime
  const isStale = query.dataUpdatedAt 
    ? Date.now() - query.dataUpdatedAt > ((options as any).staleTime || 0)
    : false;

  return {
    ...query,
    isStale,
  };
}
