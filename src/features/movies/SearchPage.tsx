import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSearchMovies } from "./queries";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchMovieDetail } from "./queries";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const pageParam = Number(params.get("page") ?? 1);
  const [page, setPage] = useState(pageParam);
  const client = useQueryClient();
  const { data, isLoading, isError, error, isFetching } = useSearchMovies(q, page);

  const results = useMemo(() => data?.results ?? [], [data]);
  const totalPages = data?.total_pages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    const nextQ = input.value.trim();
    setPage(1);
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (nextQ) next.set("q", nextQ); else next.delete("q");
      next.set("page", "1");
      return next;
    });
  }

  function goPage(nextPage: number) {
    setPage(nextPage);
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.set("page", String(nextPage));
      return next;
    });
  }

  return (
    <div>
      <h1>Search Movies</h1>
      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input name="q" defaultValue={q} placeholder="Search..." />
        <button type="submit">Search</button>
      </form>

      {q.length === 0 ? (
        <div>Type a query to search.</div>
      ) : isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div style={{ color: "crimson" }}>{(error as any)?.message || "Error"}</div>
      ) : results.length === 0 ? (
        <div>No results.</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {results.map((m) => (
              <Link key={m.id} to={`/movies/${m.id}`} onMouseEnter={() => prefetchMovieDetail(client, m.id)} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                  {m.poster_path ? (
                    <img alt={m.title} src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} style={{ width: "100%", display: "block" }} />
                  ) : (
                    <div style={{ height: 256, background: "#ddd" }} />
                  )}
                  <div style={{ padding: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <button disabled={!canPrev || isFetching} onClick={() => goPage(Math.max(1, page - 1))}>Prev</button>
            <span>Page {page} {isFetching ? "(updating...)" : ""}</span>
            <button disabled={!canNext || isFetching} onClick={() => goPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}


