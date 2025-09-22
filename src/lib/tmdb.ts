export type TmdbParams = Record<string, string | number | boolean | undefined>;

const TMDB_BASE = "https://api.themoviedb.org/3";

export function hasTmdbKey(): boolean {
  return Boolean(import.meta.env.VITE_TMDB_API_KEY);
}

function getApiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
  if (!key) {
    throw new Error("Missing VITE_TMDB_API_KEY. Add it to a .env file and restart dev server.");
  }
  return key;
}

export function buildTmdbUrl(path: string, params: TmdbParams = {}): string {
  const url = new URL(`${TMDB_BASE}${path}`);
  const apiKey = getApiKey();
  url.searchParams.set("api_key", apiKey);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export async function tmdbGet<T>(path: string, params?: TmdbParams): Promise<T> {
  const url = buildTmdbUrl(path, params);
  const resp = await fetch(url, { headers: { Accept: "application/json" } });
  if (!resp.ok) {
    let message = resp.statusText || "TMDb request failed";
    try {
      const data = await resp.json();
      message = (data && (data.status_message || data.message)) || message;
    } catch {}
    throw new Error(message);
  }
  return resp.json() as Promise<T>;
}


