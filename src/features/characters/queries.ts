import { useQuery, queryOptions } from "@tanstack/react-query";
import { fetchCharacters } from "./api";
import type { CharactersParams, CharactersResponse } from "./api";

const charactersKey = (params: CharactersParams) => ["characters", params.page ?? 1, params.name ?? ""] as const;

export const charactersQueryOptions = (params: CharactersParams) =>
  queryOptions({
    queryKey: charactersKey(params),
    queryFn: () => fetchCharacters(params),
    staleTime: 1000 * 60, // 1 min
    gcTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

export function useCharacters(params: CharactersParams) {
  return useQuery(charactersQueryOptions(params));
}