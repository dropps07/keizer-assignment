import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchMovieDetail } from '../queries';

// Optimized hook for movie card interactions
export function useMovieCard() {
  const queryClient = useQueryClient();

  // Memoized prefetch function to prevent unnecessary re-renders
  const prefetchMovie = useCallback((id: number) => {
    // Only prefetch if not already in cache or stale
    const queryKey = ['movies', 'detail', id];
    const existingData = queryClient.getQueryData(queryKey);
    
    if (!existingData) {
      prefetchMovieDetail(queryClient, id);
    }
  }, [queryClient]);

  // Debounced prefetch to avoid excessive API calls
  const debouncedPrefetch = useMemo(() => {
    let timeoutId: number;
    
    return (id: number, delay: number = 300) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        prefetchMovie(id);
      }, delay);
    };
  }, [prefetchMovie]);

  // Handle card click with optimized state management
  const handleCardClick = useCallback((id: number, currentPage: number) => {
    try {
      sessionStorage.setItem('returnAnchor', JSON.stringify({ 
        id, 
        page: currentPage,
        scrollY: window.scrollY,
        timestamp: Date.now()
      }));
    } catch (error) {
      // Silently handle sessionStorage errors
      console.warn('Failed to save return anchor:', error);
    }
  }, []);

  // Handle hover with prefetching
  const handleCardHover = useCallback((id: number) => {
    debouncedPrefetch(id, 200); // 200ms delay for hover prefetch
  }, [debouncedPrefetch]);

  return {
    handleCardClick,
    handleCardHover,
    prefetchMovie,
  };
}
