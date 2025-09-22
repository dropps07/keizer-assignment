import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useCharacters } from "./queries";

export default function Characters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMountRef = useRef(true);
  
  // Get initial values from URL params, with fallbacks to sessionStorage
  const getInitialPage = () => {
    const urlPage = searchParams.get('page');
    if (urlPage) return parseInt(urlPage);
    
    try {
      const saved = sessionStorage.getItem('characters:page');
      return saved ? parseInt(saved) : 1;
    } catch {
      return 1;
    }
  };

  const getInitialName = () => {
    const urlName = searchParams.get('name');
    if (urlName) return urlName;
    
    try {
      const saved = sessionStorage.getItem('characters:name');
      return saved || '';
    } catch {
      return '';
    }
  };

  const [page, setPage] = useState(getInitialPage);
  const [name, setName] = useState(getInitialName);

  const { data, isLoading, isError, error, isFetching } = useCharacters({ 
    page, 
    name: name || undefined 
  });

  // Sync URL with state changes (but only for user interactions, not URL changes)
  useEffect(() => {
    // Skip on initial mount to avoid overriding URL params
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const newParams = new URLSearchParams();
    
    if (page > 1) {
      newParams.set('page', page.toString());
    }
    
    if (name.trim()) {
      newParams.set('name', name.trim());
    }

    // Update URL
    setSearchParams(newParams, { replace: true });

    // Save to sessionStorage as backup
    try {
      sessionStorage.setItem('characters:page', page.toString());
      sessionStorage.setItem('characters:name', name);
    } catch {
      // Ignore sessionStorage errors
    }
  }, [page, name, setSearchParams]);

  // Listen for URL changes (browser back/forward) and update state accordingly
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMountRef.current) {
      return;
    }

    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlName = searchParams.get('name') || '';
    
    // Update state to match URL (this handles back/forward navigation)
    setPage(urlPage);
    setName(urlName);
  }, [searchParams.get('page'), searchParams.get('name')]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (newName.trim() !== name.trim()) {
      setPage(1); // Reset to page 1 when search actually changes
    }
  };

  const handleClearSearch = () => {
    setName('');
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage(Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  return (
    <div>
      <h1>Rick and Morty Characters</h1>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
        <input
          placeholder="Search by name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
        <button onClick={handleClearSearch}>Clear</button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div style={{ color: "crimson" }}>{(error as any)?.message || "Error"}</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {data?.results.map((c) => (
              <div 
                key={c.id} 
                data-character-id={c.id}
                style={{ background: "#fff", borderRadius: 8, padding: 12 }}
              >
                <img src={c.image} alt={c.name} style={{ width: "100%", borderRadius: 6 }} />
                <div style={{ marginTop: 8, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{c.species} • {c.status}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <button 
              disabled={!data?.info.prev || page === 1 || isFetching} 
              onClick={handlePrevPage}
            >
              Prev
            </button>
            <span>
              Page {page} {isFetching ? "(updating...)" : ""}
            </span>
            <button 
              disabled={!data?.info.next || isFetching} 
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}