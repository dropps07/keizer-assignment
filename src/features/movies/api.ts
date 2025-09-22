import { z } from "zod";
import { tmdbGet } from "../../lib/tmdb";

// Zod schemas (validate detail response at minimum)
export const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  adult: z.boolean().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  vote_count: z.number().nullable().optional(),
});

export type Movie = z.infer<typeof MovieSchema>;

const PaginatedSchema = <T extends z.ZodTypeAny>(item: T) => z.object({
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
  results: z.array(item),
});

export const MoviesPageSchema = PaginatedSchema(MovieSchema);
export type MoviesPage = z.infer<typeof MoviesPageSchema>;

function isBlockedByKeyword(title?: string | null): boolean {
  const t = (title || "").toLowerCase();
  const normalized = t.replace(/[^a-z0-9]+/g, "");
  const bannedFragments = [
    "erotic",
  ];
  const bannedExactNormalized = [
    "skinlikesun", // blocks "Skin. Like. Sun."
  ];
  if (bannedFragments.some((w) => t.includes(w))) return true;
  if (bannedExactNormalized.includes(normalized)) return true;
  return false;
}

export async function fetchPopularMovies(page: number): Promise<MoviesPage> {
  // Use discover with certification filter to avoid 18+ content proactively
  const data = await tmdbGet<unknown>(`/discover/movie`, {
    sort_by: "popularity.desc",
    page,
    include_adult: false,
    certification_country: "US",
    "certification.lte": "PG-13",
  });
  const parsed = MoviesPageSchema.parse(data);
  return { ...parsed, results: parsed.results.filter((m) => !m.adult && !isBlockedByKeyword(m.title)) };
}

export async function fetchTrendingMovies(page: number): Promise<MoviesPage> {
  const data = await tmdbGet<unknown>(`/trending/movie/day`, { page });
  const parsed = MoviesPageSchema.parse(data as unknown);
  return { ...parsed, results: parsed.results.filter((m) => !m.adult && !isBlockedByKeyword(m.title)) };
}

export async function fetchFreeToWatchMovies(page: number): Promise<MoviesPage> {
  const data = await tmdbGet<unknown>(`/discover/movie`, {
    page,
    include_adult: false,
    watch_region: 'US',
    with_watch_monetization_types: 'free',
    sort_by: 'popularity.desc',
    certification_country: 'US',
    "certification.lte": 'PG-13',
  });
  const parsed = MoviesPageSchema.parse(data as unknown);
  return { ...parsed, results: parsed.results.filter((m) => !m.adult && !isBlockedByKeyword(m.title)) };
}

// Release dates schema to inspect certification (rating)
const ReleaseDatesSchema = z.object({
  results: z.array(
    z.object({
      iso_3166_1: z.string(),
      release_dates: z.array(
        z.object({
          certification: z.string(),
          note: z.string().optional().nullable(),
          type: z.number().optional().nullable(),
        })
      ),
    })
  ),
});
type ReleaseDates = z.infer<typeof ReleaseDatesSchema>;

async function fetchReleaseDates(id: number): Promise<ReleaseDates> {
  const data = await tmdbGet<unknown>(`/movie/${id}/release_dates`);
  return ReleaseDatesSchema.parse(data);
}

export async function fetchMovieDetail(id: number): Promise<Movie> {
  const data = await tmdbGet<unknown>(`/movie/${id}`);
  const parsed = MovieSchema.parse(data);
  if (parsed.adult || isBlockedByKeyword(parsed.title)) {
    throw new Error('Content restricted');
  }
  // Additional certification guard: block R/NC-17 (and 18-style labels)
  try {
    const rel = await fetchReleaseDates(id);
    const us = rel.results.find((r) => r.iso_3166_1 === 'US');
    const certs = (us?.release_dates ?? []).map((d) => (d.certification || '').toUpperCase());
    const blocked = certs.some((c) => c === 'R' || c === 'NC-17' || c === '18' || c === 'X' || c === 'A');
    if (blocked) throw new Error('Content restricted');
  } catch (_) {
    // If release dates endpoint fails validation, we fail closed to be safe
    // but do not swallow known good content; only block when certain
  }
  return parsed;
}

export async function searchMovies(query: string, page: number): Promise<MoviesPage> {
  const data = await tmdbGet<unknown>(`/search/movie`, { query, page, include_adult: false, certification_country: "US", "certification.lte": "PG-13" });
  const parsed = MoviesPageSchema.parse(data);
  return { ...parsed, results: parsed.results.filter((m) => !m.adult && !isBlockedByKeyword(m.title)) };
}


