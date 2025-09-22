import { useInfiniteQuery, useQuery, QueryClient, queryOptions } from "@tanstack/react-query";
import { fetchMovieDetail, fetchPopularMovies, searchMovies, fetchTrendingMovies, fetchFreeToWatchMovies } from "./api";
import type { MoviesPage, Movie } from "./api";

export const popularMoviesOptions = (page: number) =>
  queryOptions({
    queryKey: ["movies", "popular", page],
    queryFn: () => fetchPopularMovies(page),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previous) => previous, // keep previous page's data during pagination
  });

export function usePopularMovies(page: number) {
  return useQuery(popularMoviesOptions(page));
}

export const trendingMoviesOptions = (page: number) =>
  queryOptions({
    queryKey: ["movies", "trending", page],
    queryFn: () => fetchTrendingMovies(page),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previous) => previous,
  });

export function useTrendingMovies(page: number) {
  return useQuery(trendingMoviesOptions(page));
}

export const freeToWatchMoviesOptions = (page: number) =>
  queryOptions({
    queryKey: ["movies", "free", page],
    queryFn: () => fetchFreeToWatchMovies(page),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previous) => previous,
  });

export function useFreeToWatchMovies(page: number) {
  return useQuery(freeToWatchMoviesOptions(page));
}

export const movieDetailOptions = (id: number) =>
  queryOptions({
    queryKey: ["movies", "detail", id],
    queryFn: () => fetchMovieDetail(id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

export function useMovieDetail(id: number) {
  return useQuery(movieDetailOptions(id));
}

export const searchMoviesOptions = (q: string, page: number) =>
  queryOptions({
    queryKey: ["movies", "search", q, page],
    queryFn: () => searchMovies(q, page),
    enabled: q.trim().length > 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });

export function useSearchMovies(q: string, page: number) {
  return useQuery(searchMoviesOptions(q, page));
}

export function prefetchMovieDetail(client: QueryClient, id: number) {
  return client.prefetchQuery(movieDetailOptions(id));
}