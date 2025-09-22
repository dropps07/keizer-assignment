import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchNextPage } from '../queries';

interface UsePaginationProps {
  currentPage: number;
  totalPages: number;
  type: 'popular' | 'trending' | 'free';
  isFetching: boolean;
}

export function usePagination({ currentPage, totalPages, type, isFetching }: UsePaginationProps) {
  const queryClient = useQueryClient();

  // Memoized pagination state to prevent unnecessary re-renders
  const paginationState = useMemo(() => ({
    canPrev: currentPage > 1,
    canNext: currentPage < totalPages,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  }), [currentPage, totalPages]);

  // Prefetch next page when user is on current page for a while
  useEffect(() => {
    if (paginationState.canNext && !isFetching) {
      const timer = setTimeout(() => {
        prefetchNextPage(queryClient, type, currentPage);
      }, 2000); // Prefetch after 2 seconds on current page

      return () => clearTimeout(timer);
    }
  }, [currentPage, paginationState.canNext, isFetching, queryClient, type]);

  // Optimized page change handlers
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return page;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  const goToNextPage = useCallback(() => {
    return goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPrevPage = useCallback(() => {
    return goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    ...paginationState,
    goToPage,
    goToNextPage,
    goToPrevPage,
  };
}
