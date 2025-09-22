import { useParams, Link } from "react-router-dom";
import { useMovieDetail } from "./queries";

// Skeleton component for loading state
function MovieDetailSkeleton() {
  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'loading 3.0s infinite',
    borderRadius: '8px'
  };

  const keyframes = `
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "start" }}>
        {/* Poster skeleton */}
        <div 
          style={{ 
            width: 240, 
            height: 360, 
            ...skeletonStyle
          }} 
        />
        
        {/* Content skeleton */}
        <div>
          {/* Title skeleton */}
          <div 
            style={{ 
              height: 40, 
              width: '70%', 
              marginBottom: 16,
              ...skeletonStyle
            }} 
          />
          
          {/* Overview skeleton - multiple lines */}
          <div style={{ marginBottom: 16 }}>
            <div 
              style={{ 
                height: 20, 
                width: '100%', 
                marginBottom: 8,
                ...skeletonStyle
              }} 
            />
            <div 
              style={{ 
                height: 20, 
                width: '95%', 
                marginBottom: 8,
                ...skeletonStyle
              }} 
            />
            <div 
              style={{ 
                height: 20, 
                width: '80%', 
                marginBottom: 8,
                ...skeletonStyle
              }} 
            />
            <div 
              style={{ 
                height: 20, 
                width: '60%',
                ...skeletonStyle
              }} 
            />
          </div>
          
          {/* Meta info skeleton */}
          <div 
            style={{ 
              height: 16, 
              width: '50%',
              ...skeletonStyle
            }} 
          />
        </div>
      </div>
    </>
  );
}

export default function MovieDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data, isLoading, isError, error } = useMovieDetail(id);

  return (
    <div>
      <Link 
        to="/movies" 
        style={{ 
          display: 'inline-block', 
          borderRadius: 9999, 
          background: '#FF4925', 
          color: '#fff', 
          padding: '8px 16px', 
          textDecoration: 'none', 
          fontWeight: 600, 
          fontFamily: 'Kanit, sans-serif', 
          letterSpacing: 0.3,
          marginBottom: '16px'
        }}
      >
        ← Back to list
      </Link>
      
      {isLoading ? (
        <MovieDetailSkeleton />
      ) : isError ? (
        <div style={{ color: "crimson" }}>{(error as any)?.message || "Error"}</div>
      ) : !data ? (
        <div>Not found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, alignItems: "start" }}>
          {data.poster_path ? (
            <img 
              alt={data.title} 
              src={`https://image.tmdb.org/t/p/w342${data.poster_path}`} 
              style={{ width: 240, borderRadius: 8 }} 
            />
          ) : (
            <div style={{ width: 240, height: 360, background: "#ddd", borderRadius: 8 }} />
          )}
          <div>
            <h1 style={{ fontFamily: 'Kanit, sans-serif', fontSize: 32, margin: '4px 0 8px' }}>
              {data.title}
            </h1>
            {data.overview ? (
              <p style={{ fontFamily: 'Maitree, serif', fontSize: 18, lineHeight: '28px' }}>
                {data.overview}
              </p>
            ) : (
              <p style={{ fontFamily: 'Maitree, serif', fontSize: 18, lineHeight: '28px' }}>
                No overview.
              </p>
            )}
            <div style={{ color: "#555", marginTop: 8 }}>
              Release: {data.release_date || "—"} • Rating: {data.vote_average ?? "—"} ({data.vote_count ?? 0} votes)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}