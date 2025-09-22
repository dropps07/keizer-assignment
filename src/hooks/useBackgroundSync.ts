import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { movieKeys } from '../features/movies/queries';

export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const syncTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleOnline = () => {
      // Clear any existing sync timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Delay sync slightly to ensure connection is stable
      syncTimeoutRef.current = setTimeout(() => {
        // Invalidate and refetch all movie queries when coming back online
        queryClient.invalidateQueries({ 
          queryKey: movieKeys.all,
          refetchType: 'active' // Only refetch currently active queries
        });
      }, 1000);
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [queryClient]);
}
