import { getJson } from "../../lib/http";

export type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  image: string;
};

export type CharactersResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
};

export type CharactersParams = {
  page?: number; // 1-based
  name?: string;
};

const BASE_URL = "https://rickandmortyapi.com/api";

export function fetchCharacters(params: CharactersParams = {}) {
  const url = new URL(`${BASE_URL}/character`);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.name) url.searchParams.set("name", params.name);
  return getJson<CharactersResponse>(url.toString());
}


