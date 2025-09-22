import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePopularMovies, useTrendingMovies, useFreeToWatchMovies } from "./queries";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@mui/material/Button";

// Skeleton Components
function MovieCardSkeleton({ isSmall }: { isSmall: boolean }) {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'loading 1.5s infinite',
    borderRadius: '8px'
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
      <div 
        style={{ 
          width: '100%', 
          height: (isSmall ? 160 : 240), 
          ...skeletonStyle 
        }} 
      />
      <div style={{ padding: 8 }}>
        <div 
          style={{ 
            height: 20, 
            width: '80%',
            ...skeletonStyle
          }} 
        />
      </div>
    </div>
  );
}

function ShelfSkeleton({ title, isSmall }: { title: string; isSmall: boolean }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '4px 4px 6px', fontFamily: 'Kanit, sans-serif', letterSpacing: 0.5, fontSize: 28, fontWeight: 700 }}>{title}</h2>
      <div style={{ background: '#FF4925', borderRadius: 16, padding: 12, position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 100 : 160}px, 1fr))`, gap: 12 }}>
          {Array.from({ length: 12 }).map((_, index) => (
            <MovieCardSkeleton key={index} isSmall={isSmall} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MainPageSkeleton({ isSmall }: { isSmall: boolean }) {
  const keyframes = `
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={{ background: '#FF4925', padding: 16, borderRadius: 16 }}>
        <ShelfSkeleton title="Trending" isSmall={isSmall} />
        <ShelfSkeleton title="What's popular" isSmall={isSmall} />
        <ShelfSkeleton title="Free to watch" isSmall={isSmall} />
      </div>
    </>
  );
}

function AllMoviesPageSkeleton({ isSmall }: { isSmall: boolean }) {
  const keyframes = `
    @keyframes loading {
      0% { backg-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={{ background: '#FF4925', padding: 16, borderRadius: 16 }}>
        <h2 style={{ margin: '4px 4px 12px', fontFamily: 'Kanit, sans-serif', letterSpacing: 0.5, fontSize: 28, fontWeight: 700 }}>All movies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 100 : 160}px, 1fr))`, gap: 12 }}>
          {Array.from({ length: 20 }).map((_, index) => (
            <MovieCardSkeleton key={index} isSmall={isSmall} />
          ))}
        </div>
      </div>
    </>
  );
}

function useInViewFade(enabled: boolean) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-fade]')) as HTMLElement[];
    if (!enabled) {
      elements.forEach((el) => {
        el.style.filter = 'blur(0px)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.style.filter = 'blur(0px)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [enabled]);
}

// ✅ Reusable MovieCard
function MovieCard({ m, isSmall, firstVisit, onClick }: { m: any; isSmall: boolean; firstVisit?: boolean; onClick?: () => void }) {
  return (
    <Link 
      to={`/movies/${m.id}`} 
      onClick={onClick} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        {...(firstVisit ? { 'data-fade': true as unknown as undefined } : {})}
        style={{
          background: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'all 250ms ease',
          cursor: 'pointer',
          ...(firstVisit ? { filter: 'blur(6px)', opacity: 0, transform: 'translateY(8px)' } : {})
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        {m.poster_path ? (
          <img alt={m.title} src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} style={{ width: '100%', height: (isSmall ? 160 : 240), objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ height: (isSmall ? 160 : 240), background: '#ddd' }} />
        )}
        <div style={{ padding: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 14, height: 20, lineHeight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'Maitree, serif', WebkitMaskImage: 'linear-gradient(90deg, #000 75%, transparent 100%)', maskImage: 'linear-gradient(90deg, #000 75%, transparent 100%)' }}>{m.title}</div>
        </div>
      </div>
    </Link>
  );
}

function Shelf({ title, results, firstVisit, isSmall }: { title: string; results: any[]; firstVisit: boolean; isSmall: boolean }) {
  const INITIAL_VISIBLE = 12;
  const [visible, setVisible] = useState(firstVisit ? INITIAL_VISIBLE : results.length);
  useEffect(() => {
    setVisible(firstVisit ? INITIAL_VISIBLE : results.length);
  }, [results, firstVisit]);
  useInViewFade(firstVisit);
  const shown = results.slice(0, visible);
  const canShowMore = visible < results.length;
  const preview = canShowMore ? results.slice(visible, Math.min(visible + 6, results.length)) : [];

  const handleCardClick = (id?: number) => {
    try {
      if (typeof id === 'number') {
        sessionStorage.setItem('returnAnchor', JSON.stringify({ id }));
      }
    } catch {}
  };

  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ margin: '4px 4px 6px', fontFamily: 'Kanit, sans-serif', letterSpacing: 0.5, fontSize: 28, fontWeight: 700 }}>{title}</h2>
      <div style={{ background: '#FF4925', borderRadius: 16, padding: 12, position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 100 : 160}px, 1fr))`, gap: 12 }}>
          {shown.map((m) => (
            <MovieCard key={m.id} m={m} isSmall={isSmall} firstVisit={firstVisit} onClick={() => handleCardClick(m.id)} />
          ))}
        </div>
        {canShowMore && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 100 : 160}px, 1fr))`, gap: 12, marginTop: 12, filter: 'blur(3px)', opacity: 0.8, pointerEvents: 'none', maxHeight: (isSmall ? 110 : 140), overflow: 'hidden' }}>
              {preview.map((m) => (
                <MovieCard key={`preview-${m.id}`} m={m} isSmall={isSmall} />
              ))}
            </div>
            <div style={{ position: 'absolute', right: 16, bottom: 16 }}>
              <Button variant="contained" disableElevation onClick={() => setVisible(results.length)}>Show more</Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function MoviesListPage() {
  const [params, setParams] = useSearchParams();
  const isInitialMountRef = useRef(true);

  const getInitialPage = () => {
    const urlPage = params.get("page");
    return urlPage ? Number(urlPage) : 1;
  };

  const [page, setPage] = useState(getInitialPage);
  const [firstVisit, setFirstVisit] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('visitedOnce');
    } catch {
      return true;
    }
  });

  const { data: popular, isLoading: loadingPopular, isError: isErrorPopular, error: errorPopular, isFetching: fetchingPopular } = usePopularMovies(page);
  const { data: trending, isLoading: loadingTrending, isError: isErrorTrending, error: errorTrending } = useTrendingMovies(1);
  const { data: free, isLoading: loadingFree, isError: isErrorFree, error: errorFree } = useFreeToWatchMovies(1);

  const totalPages = popular?.total_pages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const popularResults = useMemo(() => popular?.results ?? [], [popular]);
  const trendingResults = useMemo(() => trending?.results ?? [], [trending]);
  const freeResults = useMemo(() => free?.results ?? [], [free]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const newParams = new URLSearchParams(params);
    if (page > 1) {
      newParams.set("page", String(page));
    } else {
      newParams.delete("page");
    }
    setParams(newParams, { replace: true });
  }, [page, setParams]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      return;
    }
    const urlPage = Number(params.get("page") ?? 1);
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [params.get("page")]);

  useEffect(() => {
    try {
      localStorage.setItem('visitedOnce', '1');
    } catch {}
    setFirstVisit(false);
  }, []);

  const client = useQueryClient();
  const [isSmall, setIsSmall] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth <= 360 : false));

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth <= 360);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div>
      <div>
        <h1 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 45, letterSpacing: -0.2, marginBottom: 4 }}>BROWSE MOVIES</h1>
        <p style={{ fontFamily: 'Maitree, serif', fontSize: 21, marginTop: 0, fontWeight: 600 }}>Browse genres. Or directors. Or double-award-winners. Find films you didn't know you were looking for.</p>
      </div>
      {loadingPopular || loadingTrending || loadingFree ? (
        page <= 1 ? (
          <MainPageSkeleton isSmall={isSmall} />
        ) : (
          <AllMoviesPageSkeleton isSmall={isSmall} />
        )
      ) : isErrorPopular ? (
        <div style={{ color: "crimson" }}>{(errorPopular as any)?.message || "Error"}</div>
      ) : popularResults.length === 0 ? (
        <div>No movies found.</div>
      ) : (
        <>
          {page <= 1 ? (
            <div style={{ background: '#FF4925', padding: 16, borderRadius: 60 }}>
              <Shelf title="Trending" results={trendingResults.slice(0, 20)} firstVisit={firstVisit} isSmall={isSmall} />
              <Shelf title="What's popular" results={popularResults.slice(0, 20)} firstVisit={firstVisit} isSmall={isSmall} />
              <Shelf title="Free to watch" results={freeResults.slice(0, 20)} firstVisit={firstVisit} isSmall={isSmall} />
            </div>
          ) : (
            <div style={{ background: '#FF4925', padding: 16, borderRadius: 60 }}>
              <h2 style={{ margin: '4px 4px 12px', fontFamily: 'Kanit, sans-serif', letterSpacing: 0.5, fontSize: 28, fontWeight: 700 }}>All movies</h2>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 100 : 160}px, 1fr))`, gap: 12 }}>
                {popularResults.map((m) => (
                  <MovieCard key={m.id} m={m} isSmall={isSmall} onClick={() => {
                    try {
                      sessionStorage.setItem('returnAnchor', JSON.stringify({ id: m.id }));
                    } catch {}
                  }} />
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <Button variant="contained" disableElevation disabled={!canPrev || fetchingPopular} onClick={() => {
              setPage((p) => Math.max(1, p - 1));
            }}>Prev</Button>
            <span>Page {page} {fetchingPopular ? "(updating...)" : ""}</span>
            <Button variant="contained" disableElevation disabled={!canNext || fetchingPopular} onClick={() => {
              setPage((p) => p + 1);
            }}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
