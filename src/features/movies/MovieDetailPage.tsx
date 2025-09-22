import { useParams, Link } from "react-router-dom";
import { useMovieDetail } from "./queries";
import { useState, useEffect } from "react";

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
      <div>
        {/* Back button skeleton */}
        <div 
          style={{ 
            height: 36, 
            width: 120, 
            marginBottom: 16,
            ...skeletonStyle,
            borderRadius: '9999px'
          }} 
        />
        
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" }}>
        {/* Poster skeleton */}
        <div 
          style={{ 
            width: 300, 
            height: 450, 
            ...skeletonStyle
          }} 
        />
        
        {/* Content skeleton */}
        <div style={{ textAlign: 'left' }}>
          {/* Title skeleton */}
          <div 
            style={{ 
              height: 56, 
              width: '85%', 
              marginBottom: 20,
              ...skeletonStyle
            }} 
          />
          
          {/* Overview skeleton - multiple lines */}
          <div style={{ marginBottom: 20 }}>
            <div 
              style={{ 
                height: 30, 
                width: '100%', 
                marginBottom: 8,
                ...skeletonStyle
              }} 
            />
            <div 
              style={{ 
                height: 30, 
                width: '95%', 
                marginBottom: 8,
                ...skeletonStyle
              }} 
            />
            <div 
              style={{ 
                height: 30, 
                width: '80%', 
                marginBottom: 8,
                ...skeletonStyle
              }} 
            />
            <div 
              style={{ 
                height: 30, 
                width: '60%',
                ...skeletonStyle
              }} 
            />
          </div>
          
          {/* Stats boxes skeleton */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ 
              width: 80, 
              height: 50, 
              ...skeletonStyle,
              borderRadius: '4px'
            }} />
            <div style={{ 
              width: 80, 
              height: 50, 
              ...skeletonStyle,
              borderRadius: '4px'
            }} />
            <div style={{ 
              width: 80, 
              height: 50, 
              ...skeletonStyle,
              borderRadius: '4px'
            }} />
          </div>
          
          {/* Additional info skeleton */}
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.05)', 
            borderRadius: '8px', 
            padding: '12px'
          }}>
          <div 
            style={{ 
              height: 16, 
                width: '40%', 
                marginBottom: 8,
                ...skeletonStyle
              }} 
            />
            <div 
              style={{ 
                height: 20, 
                width: '60%', 
                marginBottom: 4,
              ...skeletonStyle
            }} 
          />
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default function MovieDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data, isLoading, isError, error } = useMovieDetail(id);
  
  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div>
      {isLoading ? (
        <MovieDetailSkeleton />
      ) : isError ? (
        <div style={{ color: "crimson" }}>{(error as any)?.message || "Error"}</div>
      ) : !data ? (
        <div>Not found.</div>
      ) : (
    <div>
      <Link 
        to="/movies" 
        style={{ 
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
          display: 'inline-block', 
          borderRadius: 9999, 
          background: '#FF4925', 
          color: '#fff', 
          padding: '8px 16px', 
          textDecoration: 'none', 
          fontWeight: 600, 
          fontFamily: 'Kanit, sans-serif', 
          letterSpacing: 0.3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        ← Back to list
      </Link>
      
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", 
            gap: 16, 
            alignItems: "start" 
          }}>
          {data.poster_path ? (
            <img 
              alt={data.title} 
              src={`https://image.tmdb.org/t/p/w342${data.poster_path}`} 
              style={{ 
                width: isMobile ? '100%' : 300, 
                maxWidth: isMobile ? '300px' : 'none',
                margin: isMobile ? '0 auto' : '0',
                borderRadius: 8 
              }} 
            />
          ) : (
            <div style={{ 
              width: isMobile ? '100%' : 300, 
              maxWidth: isMobile ? '300px' : 'none',
              height: isMobile ? 'auto' : 450,
              aspectRatio: isMobile ? '2/3' : 'auto',
              margin: isMobile ? '0 auto' : '0',
              background: "#ddd", 
              borderRadius: 8 
            }} />
          )}
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              fontSize: isMobile ? 28 : 40, 
              fontWeight: 700, 
              margin: '4px 0 20px', 
              textAlign: 'left' 
            }}>
              {data.title}
            </h1>
            
            {data.overview ? (
              <p style={{ 
                fontFamily: 'Mulish, sans-serif', 
                fontSize: isMobile ? 16 : 22, 
                fontWeight: 400, 
                lineHeight: isMobile ? '24px' : '30px', 
                textAlign: 'left', 
                margin: '0 0 20px 0',
                paddingRight: isMobile ? '0' : '40px'
              }}>
                {data.overview}
              </p>
            ) : (
              <p style={{ 
                fontFamily: 'Mulish, sans-serif', 
                fontSize: isMobile ? 16 : 22, 
                fontWeight: 400, 
                lineHeight: isMobile ? '24px' : '30px', 
                textAlign: 'left', 
                margin: '0 0 20px 0',
                paddingRight: isMobile ? '0' : '40px'
              }}>
                No overview available.
              </p>
            )}
            
            {/* Stats and Details - Only show on desktop */}
            {!isMobile && (
              <>
                 {/* Stats Boxes - Simple Gray */}
                 <div style={{ display: 'flex', gap: 12, marginTop: '90px', marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ 
                    background: '#f5f5f5', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    padding: '8px 12px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '12px', color: '#666' }}>RATING</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                      {data.vote_average ? data.vote_average.toFixed(1) : "—"}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: '#f5f5f5', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    padding: '8px 12px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '12px', color: '#666' }}>VOTES</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                      {data.vote_count ? data.vote_count.toLocaleString() : "—"}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: '#f5f5f5', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    padding: '8px 12px',
                    textAlign: 'center',
                    minWidth: '80px'
                  }}>
                    <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '12px', color: '#666' }}>RELEASE</div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                      {data.release_date ? new Date(data.release_date).getFullYear() : "—"}
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.05)', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  textAlign: 'left'
                }}>
                  <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>
                    MOVIE DETAILS
                  </div>
                  <div style={{ fontFamily: 'Imprima, sans-serif', fontSize: '14px', color: '#555', lineHeight: '20px' }}>
                    <div><strong>Release Date:</strong> {data.release_date || "Not available"}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Stats and Details - Below Poster */}
        {isMobile && (
          <div style={{ marginTop: '20px' }}>
            {/* Stats Boxes - Mobile */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ 
                background: '#f5f5f5', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '6px 10px',
                textAlign: 'center',
                minWidth: '70px',
                flex: '1'
              }}>
                <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '10px', color: '#666' }}>RATING</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                  {data.vote_average ? data.vote_average.toFixed(1) : "—"}
                </div>
              </div>
              
              <div style={{ 
                background: '#f5f5f5', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '6px 10px',
                textAlign: 'center',
                minWidth: '70px',
                flex: '1'
              }}>
                <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '10px', color: '#666' }}>VOTES</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                  {data.vote_count ? data.vote_count.toLocaleString() : "—"}
                </div>
              </div>
              
              <div style={{ 
                background: '#f5f5f5', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '6px 10px',
                textAlign: 'center',
                minWidth: '70px',
                flex: '1'
              }}>
                <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '10px', color: '#666' }}>RELEASE</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                  {data.release_date ? new Date(data.release_date).getFullYear() : "—"}
                </div>
              </div>
            </div>
            
            {/* Additional Info - Mobile */}
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.05)', 
              borderRadius: '8px', 
              padding: '12px', 
              textAlign: 'left'
            }}>
              <div style={{ fontFamily: 'Kanit, sans-serif', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>
                MOVIE DETAILS
              </div>
              <div style={{ fontFamily: 'Imprima, sans-serif', fontSize: '12px', color: '#555', lineHeight: '18px' }}>
                <div><strong>Release Date:</strong> {data.release_date || "Not available"}</div>
              </div>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}