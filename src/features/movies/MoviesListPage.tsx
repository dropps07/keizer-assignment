import { useMemo, useState, useEffect, useRef, memo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePopularMovies, useTrendingMovies, useFreeToWatchMovies } from "./queries";
import { useMovieCard } from "./hooks/useMovieCard";
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
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
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

function ShelfSkeleton({ title, isSmall, isMobile }: { title: string; isSmall: boolean; isMobile: boolean }) {
  const cardsPerRow = isMobile ? 3 : 6;
  const skeletonCount = isMobile ? 6 : 12;
  
  return (
    <section style={{ marginBottom: 24 }}>
       <h2 style={{ margin: '4px 4px 6px', fontFamily: 'Anton SC, sans-serif', letterSpacing: 0.5, fontSize: 28, fontWeight: 400 }}>{title}</h2>
      <div style={{ background: '#FF4925', borderRadius: 16, padding: 12, position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`, gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <MovieCardSkeleton key={index} isSmall={isSmall} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MainPageSkeleton({ isSmall, isMobile }: { isSmall: boolean; isMobile: boolean }) {
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
        <ShelfSkeleton title="Trending" isSmall={isSmall} isMobile={isMobile} />
        <ShelfSkeleton title="What's popular" isSmall={isSmall} isMobile={isMobile} />
        <ShelfSkeleton title="Free to watch" isSmall={isSmall} isMobile={isMobile} />
      </div>
    </>
  );
}

function AllMoviesPageSkeleton({ isSmall, isMobile }: { isSmall: boolean; isMobile: boolean }) {
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
         <h2 style={{ margin: '4px 4px 12px', fontFamily: 'Anton SC, sans-serif', letterSpacing: 0.5, fontSize: 28, fontWeight: 400 }}>All movies</h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 3 : 6}, minmax(0, 1fr))`, gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0, gridAutoRows: 'min-content', gridAutoFlow: 'row' }}>
        {Array.from({ length: isMobile ? 9 : 18 }).map((_, index) => (
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

// ✅ Optimized MovieCard with prefetching
const MovieCard = memo(function MovieCard({ 
  m, 
  isSmall, 
  firstVisit, 
  currentPage 
}: { 
  m: any; 
  isSmall: boolean; 
  firstVisit?: boolean; 
  currentPage?: number;
}) {
  const { handleCardClick, handleCardHover } = useMovieCard();

  const handleClick = () => {
    if (currentPage) {
      handleCardClick(m.id, currentPage);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prefetch movie details on hover
    handleCardHover(m.id);
    
    // Visual hover effects
    (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
    (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
  };

  return (
    <Link 
      to={`/movies/${m.id}`} 
      onClick={handleClick} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        {...(firstVisit ? { 'data-fade': true as unknown as undefined } : {})}
        style={{
          background: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          ...(firstVisit ? { filter: 'blur(6px)', opacity: 0, transform: 'translateY(8px)' } : {})
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {m.poster_path ? (
          <img 
            alt={m.title} 
            src={`https://image.tmdb.org/t/p/w342${m.poster_path}`} 
            style={{ 
              width: '100%', 
              height: (isSmall ? 160 : 240), 
              objectFit: 'cover', 
              display: 'block', 
              maxWidth: '100%' 
            }} 
          />
        ) : (
          <div style={{ 
            height: (isSmall ? 160 : 240), 
            background: '#ddd', 
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            No Image
          </div>
        )}
      </div>
    </Link>
  );
});

function Shelf({ title, results, firstVisit, isSmall, currentPage, isMobile }: { title: string; results: any[]; firstVisit: boolean; isSmall: boolean; currentPage: number; isMobile: boolean }) {
  const cardsPerRow = isMobile ? 3 : 6;
  const INITIAL_VISIBLE = isMobile ? 6 : 12; // 2 rows of movies
  const [isExpanded, setIsExpanded] = useState(false);
  
  useInViewFade(firstVisit);
  const canShowMore = results.length > INITIAL_VISIBLE;
  const initialMovies = results.slice(0, INITIAL_VISIBLE);
  const remainingMovies = results.slice(INITIAL_VISIBLE);

  // Removed handleCardClick - now handled in MovieCard component

  const toggleShowMore = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section style={{ marginBottom: 24 }}>
       <h2 style={{ 
         margin: '4px 4px 6px', 
         fontFamily: 'Kanit, sans-serif', 
         letterSpacing: 0.5, 
         fontSize: 32, 
         fontWeight: 700,
         color: 'black',
         padding: '8px 16px',
         display: 'inline-block'
       }}>{title}</h2>
      <div style={{ background: '#FF4925', borderRadius: 16, padding: 2, position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`, gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          {initialMovies.map((m) => (
            <MovieCard key={m.id} m={m} isSmall={isSmall} firstVisit={firstVisit} currentPage={currentPage} />
          ))}
        </div>
        
        {canShowMore && !isExpanded && (
          <>
            {/* Show More Button - positioned after 2 rows */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: 16,
              transition: 'all 0.3s ease'
            }}>
              <Button 
                variant="contained" 
                disableElevation 
                onClick={toggleShowMore}
                style={{
                  background: 'white',
                  color: '#FF4925',
                  fontFamily: 'Hanken Grotesk, sans-serif',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  textTransform: 'none',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Show more
              </Button>
            </div>
          </>
        )}
        
        {canShowMore && isExpanded && (
          <div style={{ 
            marginTop: 12,
            animation: 'slideDown 0.4s ease-out',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`, gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
              {remainingMovies.map((m) => (
                <MovieCard key={m.id} m={m} isSmall={isSmall} firstVisit={firstVisit} currentPage={currentPage} />
              ))}
            </div>
            
            {/* Show Less Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: 16,
              transition: 'all 0.3s ease'
            }}>
              <Button 
                variant="outlined" 
                onClick={toggleShowMore}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  padding: '8px 16px',
                  textTransform: 'none',
                  fontSize: '14px',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Show less
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function MoviesListPage() {
  const [params, setParams] = useSearchParams();
  const isInitialMountRef = useRef(true);

  // Add CSS animation for slide down effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
          max-height: 0;
        }
        to {
          opacity: 1;
          transform: translateY(0);
          max-height: 1000px;
        }
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

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
  const { data: trending, isLoading: loadingTrending } = useTrendingMovies(1);
  const { data: free, isLoading: loadingFree } = useFreeToWatchMovies(1);

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

  // Handle return navigation from movie detail page
  useEffect(() => {
    try {
      const returnData = sessionStorage.getItem('returnAnchor');
      if (returnData) {
        const { page: returnPage, scrollY: returnScrollY, timestamp } = JSON.parse(returnData);
        const now = Date.now();
        // Only restore if the return data is recent (within 5 minutes)
        if (returnPage && (now - timestamp) < 300000) {
          if (returnPage !== page) {
            setPage(returnPage);
          }
          // Restore scroll position after content is loaded
          if (returnScrollY !== undefined) {
            const restoreScroll = () => {
              window.scrollTo(0, returnScrollY);
            };
            
            // Try multiple times to ensure content is loaded
            setTimeout(restoreScroll, 100);
            setTimeout(restoreScroll, 300);
            setTimeout(restoreScroll, 500);
          }
        }
        // Clear the return data after processing
        sessionStorage.removeItem('returnAnchor');
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }, []);

  const [isSmall, setIsSmall] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth <= 640 : false));
  const [isMobile, setIsMobile] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth <= 480 : false));

  useEffect(() => {
    const onResize = () => {
      setIsSmall(window.innerWidth <= 640);
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div>
      <div>
         <h1 style={{ fontFamily: 'Anton SC, sans-serif', fontSize: 45, letterSpacing: -0.2, marginBottom: 4, fontWeight: 400 }}>BROWSE MOVIES</h1>
         <p style={{ fontFamily: 'Exo, sans-serif', fontSize: 21, marginTop: 0, fontWeight: 600 }}>Find films you didn't know you were looking for.</p>
      </div>
      {loadingPopular || loadingTrending || loadingFree ? (
        page <= 1 ? (
          <MainPageSkeleton isSmall={isSmall} isMobile={isMobile} />
        ) : (
          <AllMoviesPageSkeleton isSmall={isSmall} isMobile={isMobile} />
        )
      ) : isErrorPopular ? (
        <div style={{ color: "crimson" }}>{(errorPopular as any)?.message || "Error"}</div>
      ) : popularResults.length === 0 ? (
        <div>No movies found.</div>
      ) : (
        <>
          {page <= 1 ? (
            <div style={{ background: '#FF4925', padding: 20, borderRadius: 60 }}>
              <Shelf title="Trending" results={trendingResults.slice(0, 20)} firstVisit={firstVisit} isSmall={isSmall} currentPage={page} isMobile={isMobile} />
              <Shelf title="What's popular" results={popularResults.slice(0, 20)} firstVisit={firstVisit} isSmall={isSmall} currentPage={page} isMobile={isMobile} />
              <Shelf title="Free to watch" results={freeResults.slice(0, 20)} firstVisit={firstVisit} isSmall={isSmall} currentPage={page} isMobile={isMobile} />
            </div>
          ) : (
            <div style={{ background: '#FF4925', padding: 20, borderRadius: 60 }}>
              <h2 style={{ margin: '4px 4px 12px', fontFamily: 'Anton SC, sans-serif', letterSpacing: 0.5, fontSize: 28, fontWeight: 400 }}>All movies</h2>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 3 : 6}, minmax(0, 1fr))`, gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0, gridAutoRows: 'min-content', gridAutoFlow: 'row' }}>
                {popularResults.slice(0, Math.floor(popularResults.length / (isMobile ? 3 : 6)) * (isMobile ? 3 : 6)).map((m) => (
                  <MovieCard key={m.id} m={m} isSmall={isSmall} currentPage={page} />
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <Button 
              variant="contained" 
              disableElevation 
              disabled={!canPrev || fetchingPopular} 
              onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              }}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#FF4925',
                fontWeight: 'bold',
                borderRadius: '30px',
                padding: '12px 24px',
                textTransform: 'none',
                fontSize: '16px',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >Prev</Button>
            <span style={{ 
              background: 'rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid #000000',
              borderTop: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              padding: '12px 24px',
              color: '#6b7280',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.15)'
            }}>Page {page} {fetchingPopular ? "(updating...)" : ""}</span>
            <Button 
              variant="contained" 
              disableElevation 
              disabled={!canNext || fetchingPopular} 
              onClick={() => {
              setPage((p) => p + 1);
              }}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#FF4925',
                fontWeight: 'bold',
                borderRadius: '30px',
                padding: '12px 24px',
                textTransform: 'none',
                fontSize: '16px',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >Next</Button>
          </div>
        </>
      )}
    </div>
  );
}

