import { useQuery, QueryClient, queryOptions } from "@tanstack/react-query";
import { fetchMovieDetail, fetchPopularMovies, searchMovies, fetchTrendingMovies, fetchFreeToWatchMovies } from "./api";

// Centralized query key factory for better cache management
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (type: string, page: number) => [...movieKeys.lists(), type, page] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: number) => [...movieKeys.details(), id] as const,
  searches: () => [...movieKeys.all, 'search'] as const,
  search: (query: string, page: number) => [...movieKeys.searches(), query, page] as const,
} as const;

// Optimized query options with better caching strategies
export const popularMoviesOptions = (page: number) =>
  queryOptions({
    queryKey: movieKeys.list('popular', page),
    queryFn: () => fetchPopularMovies(page),
    staleTime: 1000 * 60 * 15, // 15 minutes - popular movies don't change often
    gcTime: 1000 * 60 * 60 * 2, // 2 hours - keep in cache longer
    placeholderData: (previous) => previous, // keep previous page's data during pagination
    refetchOnWindowFocus: false, // prevent unnecessary refetches
    refetchOnMount: false, // use cached data if available
  });

export function usePopularMovies(page: number) {
  return useQuery(popularMoviesOptions(page));
}

export const trendingMoviesOptions = (page: number) =>
  queryOptions({
    queryKey: movieKeys.list('trending', page),
    queryFn: () => fetchTrendingMovies(page),
    staleTime: 1000 * 60 * 5, // 5 minutes - trending changes more frequently
    gcTime: 1000 * 60 * 60, // 1 hour
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export function useTrendingMovies(page: number) {
  return useQuery(trendingMoviesOptions(page));
}

export const freeToWatchMoviesOptions = (page: number) =>
  queryOptions({
    queryKey: movieKeys.list('free', page),
    queryFn: () => fetchFreeToWatchMovies(page),
    staleTime: 1000 * 60 * 20, // 20 minutes - free content changes less frequently
    gcTime: 1000 * 60 * 60 * 3, // 3 hours - keep longer as it's valuable
    placeholderData: (previous) => previous,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export function useFreeToWatchMovies(page: number) {
  return useQuery(freeToWatchMoviesOptions(page));
}

export const movieDetailOptions = (id: number) =>
  queryOptions({
    queryKey: movieKeys.detail(id),
    queryFn: () => fetchMovieDetail(id),
    staleTime: 1000 * 60 * 30, // 30 minutes - movie details rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep movie details for a long time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export function useMovieDetail(id: number) {
  return useQuery(movieDetailOptions(id));
}

export const searchMoviesOptions = (q: string, page: number) =>
  queryOptions({
    queryKey: movieKeys.search(q, page),
    queryFn: () => searchMovies(q, page),
    enabled: q.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes - search results can change
    gcTime: 1000 * 60 * 15, // 15 minutes - shorter cache for search
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export function useSearchMovies(q: string, page: number) {
  return useQuery(searchMoviesOptions(q, page));
}

// Advanced prefetching utilities
export function prefetchMovieDetail(client: QueryClient, id: number) {
  return client.prefetchQuery(movieDetailOptions(id));
}

// Prefetch multiple movie details efficiently
export function prefetchMovieDetails(client: QueryClient, ids: number[]) {
  return Promise.all(ids.map(id => prefetchMovieDetail(client, id)));
}

// Prefetch next page for better UX
export function prefetchNextPage(client: QueryClient, type: 'popular' | 'trending' | 'free', currentPage: number) {
  const nextPage = currentPage + 1;
  const options = type === 'popular' ? popularMoviesOptions(nextPage) :
                 type === 'trending' ? trendingMoviesOptions(nextPage) :
                 freeToWatchMoviesOptions(nextPage);
  
  return client.prefetchQuery(options);
}

// Invalidate and refetch specific queries
export function invalidateMovieQueries(client: QueryClient) {
  return client.invalidateQueries({ queryKey: movieKeys.all });
}

export function invalidateMovieList(client: QueryClient) {
  return client.invalidateQueries({ queryKey: movieKeys.lists() });
}