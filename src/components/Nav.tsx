import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

type Suggestion = string | { id?: string; title?: string; name?: string; url?: string };

export default function Nav() {
  // injecting Google Fonts 
  useEffect(() => {
    const styleId = 'gf-import-browse';
    const preconnect1Id = 'gf-preconnect-1';
    const preconnect2Id = 'gf-preconnect-2';
    const linkId = 'gf-link-others';
    const khandId = 'gf-link-khand';
    const placeholderStyleId = 'nav-search-placeholder-style';

    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.appendChild(
        document.createTextNode(
          "@import url('https://fonts.googleapis.com/css2?family=Anton+SC&family=Comfortaa:wght@300..700&family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=Syne:wght@400..800&display=swap');"
        )
      );
      document.head.appendChild(styleEl);
    }

    if (!document.getElementById(preconnect1Id)) {
      const pc1 = document.createElement('link');
      pc1.id = preconnect1Id;
      pc1.rel = 'preconnect';
      pc1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(pc1);
    }

    if (!document.getElementById(preconnect2Id)) {
      const pc2 = document.createElement('link');
      pc2.id = preconnect2Id;
      pc2.rel = 'preconnect';
      pc2.href = 'https://fonts.gstatic.com';
      pc2.crossOrigin = '';
      document.head.appendChild(pc2);
    }

    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Anton+SC&family=Comfortaa:wght@300..700&family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Maitree:wght@200;300;400;500;600;700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=Syne:wght@400..800&display=swap';
      document.head.appendChild(link);
    }
    if (!document.getElementById(khandId)) {
      const khand = document.createElement('link');
      khand.id = khandId;
      khand.rel = 'stylesheet';
      khand.href = 'https://fonts.googleapis.com/css2?family=Khand:wght@300;400;500;600;700&display=swap';
      document.head.appendChild(khand);
    }
    if (!document.getElementById(placeholderStyleId)) {
      const style = document.createElement('style');
      style.id = placeholderStyleId;
      style.appendChild(document.createTextNode(`
        #nav-search-input::placeholder { color: #9CA3AF; font-family: 'Maitree', serif; }
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `));
      document.head.appendChild(style);
    }
  }, []);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const hasSuggestions = suggestions.length > 0;
  const isSmallScreen = windowWidth <= 640;
  const shouldShowSearchIcon = isSmallScreen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Try an API if present; otherwise this will fail silently and we keep suggestions empty
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`);
        if (!res.ok) {
          throw new Error('Search not available');
        }
        const data = await res.json();
        if (!cancelled) {
          const items: Suggestion[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
          setSuggestions(items);
          setOpen(true);
        }
      } catch {
        if (!cancelled) {
          // Fallback: no suggestions
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const getSuggestionLabel = (s: Suggestion) => {
    if (typeof s === 'string') return s;
    return s.title || s.name || s.url || '';
  };

  const onSelect = (s: Suggestion) => {
    const label = getSuggestionLabel(s);
    if (!label) return;
    // Prefer url if provided
    if (typeof s !== 'string' && s.url) {
      window.location.href = s.url;
      return;
    }
    window.location.href = `/search?q=${encodeURIComponent(label)}`;
  };

  const handleSearchIconClick = () => {
    setIsSearchModalOpen(true);
    // Focus the input after a brief delay to ensure it's rendered
    setTimeout(() => {
      const input = document.getElementById('modal-search-input');
      if (input) input.focus();
    }, 100);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleModalClose = () => {
    setIsSearchModalOpen(false);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= suggestions.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? Math.max(suggestions.length - 1, 0) : next;
      });
    } else if (e.key === 'Enter') {
      if (open && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        onSelect(suggestions[highlightedIndex]);
      } else if (query.trim()) {
        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <nav style={{ width: '100%', padding: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6, 
          fontWeight: 700, 
          letterSpacing: 0.2, 
          fontFamily: 'Khand, sans-serif', 
          fontSize: windowWidth <= 360 ? 20 : windowWidth <= 480 ? 22 : windowWidth <= 640 ? 24 : windowWidth <= 768 ? 26 : 28 
        }}>
          <span style={{ whiteSpace: 'nowrap' }}>Keizer</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="/movies" style={{ 
            display: 'inline-block', 
            width: 'max-content', 
            height: 'max-content', 
            borderRadius: 9999, 
            background: '#FF4925', 
            padding: windowWidth <= 360 ? '8px 16px' : windowWidth <= 480 ? '10px 20px' : windowWidth <= 640 ? '10px 24px' : windowWidth <= 768 ? '12px 28px' : '12px 30px', 
            fontSize: windowWidth <= 360 ? 14 : windowWidth <= 480 ? 15 : windowWidth <= 640 ? 16 : windowWidth <= 768 ? 17 : 18, 
            lineHeight: windowWidth <= 360 ? '24px' : windowWidth <= 480 ? '26px' : windowWidth <= 640 ? '28px' : windowWidth <= 768 ? '30px' : '33px', 
            fontWeight: 500, 
            color: '#fff', 
            boxShadow: 'none', 
            transition: 'all 150ms', 
            textDecoration: 'none', 
            fontFamily: 'Kanit, sans-serif' 
          }} onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(1px)'; }} onMouseUp={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}>Browse</a>
          <div
            ref={wrapperRef}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: shouldShowSearchIcon 
                ? '40px' 
                : windowWidth <= 360
                  ? 'min(50vw, 140px)'
                  : windowWidth <= 480
                  ? 'min(55vw, 160px)'
                  : windowWidth <= 640
                  ? 'min(60vw, 180px)'
                  : windowWidth <= 768
                  ? 'min(65vw, 220px)'
                  : windowWidth <= 1024
                  ? 'min(50vw, 280px)'
                  : 'min(40vw, 320px)'
            }}
          >
            {shouldShowSearchIcon ? (
              <button
                onClick={handleSearchIconClick}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #FF4925',
                  background: '#fff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Search"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF4925"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            ) : (
              <input id="nav-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => {
                  if (hasSuggestions) setOpen(true);
                }}
                onBlur={() => {}}
                onKeyDown={onKeyDown}
                placeholder="Search..."
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  border: '2px solid #FF4925',
                  background: '#fff',
                  color: '#111827',
                  padding:
                    windowWidth <= 360
                      ? '6px 8px'
                      : windowWidth <= 480
                      ? '6px 10px'
                      : windowWidth <= 640
                      ? '8px 12px'
                      : windowWidth <= 768
                      ? '8px 14px'
                      : windowWidth <= 1024
                      ? '10px 16px'
                      : '10px 18px',
                  borderRadius: 9999,
                  outline: 'none',
                  boxShadow: 'none',
                  fontSize: (
                    windowWidth <= 360 ? 11 :
                    windowWidth <= 480 ? 12 :
                    windowWidth <= 640 ? 13 :
                    windowWidth <= 768 ? 14 :
                    windowWidth <= 1024 ? 15 : 16
                  ),
                  lineHeight: '22px',
                  fontFamily: 'Maitree, serif'
                }}
                aria-expanded={open}
                aria-controls="nav-search-suggestions"
                aria-autocomplete="list"
                role="combobox"
              />
            )}
            {(!shouldShowSearchIcon && open && (loading || hasSuggestions)) && (
              <div
                id="nav-search-suggestions"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  background: '#fff',
                  border: '1px solid #FF4925',
                  borderRadius: 12,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  zIndex: 50
                }}
                role="listbox"
              >
                {loading && (
                  <div style={{ padding: '10px 12px', fontSize: 14, color: '#6B7280', fontFamily: 'Maitree, serif' }}>Searching…</div>
                )}
                {!loading && hasSuggestions && suggestions.map((s, idx) => {
                  const label = getSuggestionLabel(s);
                  const isActive = idx === highlightedIndex;
                  return (
                    <div
                      key={typeof s === 'string' ? `${label}-${idx}` : s.id || `${label}-${idx}`}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect(s);
                      }}
                      role="option"
                      aria-selected={isActive}
                      style={{
                        cursor: 'pointer',
                        padding: '10px 12px',
                        background: isActive ? '#F3F4F6' : '#fff',
                        color: '#111827',
                        borderBottom: '1px solid #F3F4F6',
                        fontFamily: 'Maitree, serif'
                      }}
                    >
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{label}</span>
                    </div>
                  );
                })}
                {!loading && !hasSuggestions && debouncedQuery && (
                  <div style={{ padding: '10px 12px', fontSize: 14, color: '#6B7280', fontFamily: 'Maitree, serif' }}>No results</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal Search Overlay */}
      {isSearchModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '20vh'
          }}
          onClick={handleModalClose}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '600px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              margin: '0 auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleModalClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              ×
            </button>
            
            <form onSubmit={handleSearchSubmit}>
              <div style={{ position: 'relative' }}>
                <input
                  id="modal-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={(e) => {
                    if (hasSuggestions) setOpen(true);
                    e.currentTarget.style.borderColor = '#FF4925';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 73, 37, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#FF4925';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 73, 37, 0.15)';
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search movies..."
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    border: '2px solid #FF4925',
                    background: '#fff',
                    color: '#111827',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    outline: 'none',
                    boxShadow: '0 4px 12px rgba(255, 73, 37, 0.15)',
                    fontSize: '18px',
                    lineHeight: '24px',
                    fontFamily: 'Maitree, serif',
                    transition: 'all 0.3s ease',
                    borderColor: '#FF4925',
                    boxSizing: 'border-box'
                  }}
                  aria-expanded={open}
                  aria-controls="modal-search-suggestions"
                  aria-autocomplete="list"
                  role="combobox"
                />
                
                {open && (loading || hasSuggestions) && (
                  <div
                    id="modal-search-suggestions"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '1px solid #FF4925',
                      borderRadius: '12px',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      zIndex: 50,
                      maxHeight: '300px',
                      overflowY: 'auto',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    role="listbox"
                  >
                    {loading && (
                      <div style={{ padding: '16px 20px', fontSize: 16, color: '#6B7280', fontFamily: 'Maitree, serif' }}>Searching…</div>
                    )}
                    {!loading && hasSuggestions && suggestions.map((s, idx) => {
                      const label = getSuggestionLabel(s);
                      const isActive = idx === highlightedIndex;
                      return (
                        <div
                          key={typeof s === 'string' ? `${label}-${idx}` : s.id || `${label}-${idx}`}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          onMouseLeave={() => setHighlightedIndex(-1)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onSelect(s);
                          }}
                          role="option"
                          aria-selected={isActive}
                          style={{
                            cursor: 'pointer',
                            padding: '16px 20px',
                            background: isActive ? '#F3F4F6' : '#fff',
                            color: '#111827',
                            borderBottom: '1px solid #F3F4F6',
                            fontFamily: 'Maitree, serif',
                            fontSize: '16px'
                          }}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{label}</span>
                        </div>
                      );
                    })}
                    {!loading && !hasSuggestions && debouncedQuery && (
                      <div style={{ padding: '16px 20px', fontSize: 16, color: '#6B7280', fontFamily: 'Maitree, serif' }}>No results</div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}


