import { useMemo, useState, useEffect, memo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSearchMovies } from "./queries";
import { useMovieCard } from "./hooks/useMovieCard";
import Button from "@mui/material/Button";

// Optimized Movie Card Component with prefetching
const MovieCard = memo(function MovieCard({ m, isSmall, currentPage }: { m: any; isSmall: boolean; currentPage: number }) {
  const { handleCardClick, handleCardHover } = useMovieCard();

  const handleClick = () => {
    handleCardClick(m.id, currentPage);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prefetch movie details on hover
    handleCardHover(m.id);
    
    // Visual hover effects
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  };

  return (
    <Link 
      to={`/movies/${m.id}`} 
      onClick={handleClick} 
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div 
        style={{ 
          background: '#fff', 
          borderRadius: 16, 
          overflow: 'hidden', 
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
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
              height: isSmall ? 160 : 240, 
              objectFit: 'cover', 
              display: 'block' 
            }} 
          />
        ) : (
          <div style={{ 
            height: isSmall ? 160 : 240, 
            background: '#ddd',
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

// Skeleton Component
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
    </div>
  );
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const pageParam = Number(params.get("page") ?? 1);
  const [page, setPage] = useState(pageParam);
  const [isSmall, setIsSmall] = useState(false);
  const { data, isLoading, isError, error, isFetching } = useSearchMovies(q, page);

  const results = useMemo(() => data?.results ?? [], [data]);
  const totalPages = data?.total_pages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Responsive state
  useEffect(() => {
    const checkSize = () => setIsSmall(window.innerWidth < 640);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Ensure complete rows (6 movies per row)
  const displayResults = useMemo(() => {
    if (!results.length) return [];
    const completeRows = Math.floor(results.length / 6);
    return results.slice(0, completeRows * 6);
  }, [results]);

  function goPage(nextPage: number) {
    setPage(nextPage);
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.set("page", String(nextPage));
      return next;
    });
  }

  // Removed handleCardClick - now handled in MovieCard component

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ 
          fontFamily: 'Anton SC, sans-serif', 
          fontSize: 45, 
          letterSpacing: -0.2, 
          marginBottom: 4, 
          fontWeight: 400 
        }}>
          SEARCH RESULTS
        </h1>
        <p style={{ 
          fontFamily: 'Exo, sans-serif', 
          fontSize: 21, 
          marginTop: 0, 
          fontWeight: 600,
          color: '#666'
        }}>
          {q ? `Results for "${q}"` : 'Search for movies to see results'}
        </p>
      </div>

      {q.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#666',
          fontSize: '18px',
          fontFamily: 'Maitree, serif'
        }}>
          Enter a search query to find movies
        </div>
      ) : isLoading ? (
        <div style={{ 
          background: '#FF4925', 
          borderRadius: 16, 
          padding: 12, 
          position: 'relative', 
          overflow: 'hidden', 
          transition: 'all 0.3s ease', 
          width: '100%', 
          boxSizing: 'border-box' 
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', 
            gap: 12, 
            width: '100%', 
            maxWidth: '100%', 
            boxSizing: 'border-box', 
            minWidth: 0 
          }}>
            {Array.from({ length: 18 }).map((_, index) => (
              <MovieCardSkeleton key={index} isSmall={isSmall} />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div style={{ 
          color: "crimson", 
          textAlign: 'center',
          padding: '40px 20px',
          fontSize: '18px',
          fontFamily: 'Maitree, serif'
        }}>
          {(error as any)?.message || "Error loading search results"}
        </div>
      ) : results.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#666',
          fontSize: '18px',
          fontFamily: 'Maitree, serif'
        }}>
          No movies found for "{q}"
        </div>
      ) : (
        <>
          <div style={{ 
            background: '#FF4925', 
            borderRadius: 16, 
            padding: 12, 
            position: 'relative', 
            overflow: 'hidden', 
            transition: 'all 0.3s ease', 
            width: '100%', 
            boxSizing: 'border-box' 
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', 
              gap: 12, 
              width: '100%', 
              maxWidth: '100%', 
              boxSizing: 'border-box', 
              minWidth: 0,
              gridAutoRows: 'min-content',
              gridAutoFlow: 'row'
            }}>
              {displayResults.map((m) => (
                <MovieCard 
                  key={m.id}
                  m={m} 
                  isSmall={isSmall} 
                  currentPage={page}
                />
              ))}
            </div>
          </div>
          
          {/* Pagination */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <Button 
              variant="contained" 
              disableElevation 
              disabled={!canPrev || isFetching} 
              onClick={() => goPage(Math.max(1, page - 1))}
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
            }}>Page {page} {isFetching ? "(updating...)" : ""}</span>
            <Button 
              variant="contained" 
              disableElevation 
              disabled={!canNext || isFetching} 
              onClick={() => goPage(page + 1)}
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


