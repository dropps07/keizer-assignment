import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function makeKey(pathname: string, search: string) {
  return `scroll:${pathname}${search}`;
}

export default function ScrollMemory() {
  const location = useLocation();
  const navType = useNavigationType();
  const prevKeyRef = useRef<string | null>(null);
  const isRestoringRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Save scroll for previous route on location change
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    
    // Save scroll position for previous route
    if (prevKey && !isRestoringRef.current) {
      try {
        const scrollY = Math.max(0, window.scrollY);
        sessionStorage.setItem(prevKey, JSON.stringify({ y: scrollY }));
        console.log(`Saved scroll position ${scrollY} for ${prevKey}`);
      } catch (error) {
        console.warn('Failed to save scroll position:', error);
      }
    }

    const currentKey = makeKey(location.pathname, location.search);
    prevKeyRef.current = currentKey;

    // Clean up any previous restoration attempts
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    isRestoringRef.current = false; // Reset restoration flag

    // Restore scroll position for current route
    const restoreScroll = () => {
      try {
        const anchorRaw = sessionStorage.getItem('returnAnchor');
        
        // Handle anchor-based restoration first
        if (anchorRaw) {
          const { id } = JSON.parse(anchorRaw) as { id?: number };
          if (typeof id === 'number') {
            isRestoringRef.current = true;
            let tries = 0;
            const maxTries = 30;
            let timeoutId: number;
            
            const tryAnchor = (): boolean => {
              // Support both movie and character data attributes
              let el = document.querySelector(`[data-movie-id="${id}"]`) as HTMLElement;
              if (!el) {
                el = document.querySelector(`[data-character-id="${id}"]`) as HTMLElement;
              }
              
              if (el) {
                el.scrollIntoView({ 
                  block: 'center', 
                  behavior: 'instant' as ScrollBehavior 
                });
                sessionStorage.removeItem('returnAnchor');
                console.log(`Restored scroll to anchor with id ${id}`);
                return true;
              }
              return false;
            };

            const tick = () => {
              if (tryAnchor()) {
                isRestoringRef.current = false;
                return;
              }
              
              tries += 1;
              if (tries < maxTries) {
                timeoutId = window.setTimeout(tick, 50);
              } else {
                console.warn(`Failed to find anchor element with id="${id}" after ${maxTries} attempts`);
                isRestoringRef.current = false;
              }
            };

            cleanupRef.current = () => {
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
              isRestoringRef.current = false;
            };

            tick();
            return;
          }
        }

        // Handle regular scroll position restoration
        const raw = sessionStorage.getItem(currentKey);
        console.log(`Looking for saved scroll for ${currentKey}:`, raw);
        
        if (raw) {
          const { y } = JSON.parse(raw) as { y?: number };
          if (typeof y === 'number' && y >= 0) {
            console.log(`Attempting to restore scroll to position ${y}`);
            isRestoringRef.current = true;
            
            // For back/forward navigation, restore immediately
            if (navType === 'POP') {
              window.scrollTo(0, y);
              
              // Additional restoration attempts to handle late-loading content
              let attempts = 0;
              const maxAttempts = 15;
              let timeoutId: number;

              const restore = () => {
                if (!isRestoringRef.current) return;
                
                const currentScroll = window.scrollY;
                const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const targetY = Math.min(y, maxScrollY);
                
                // If we're not at the target position, try again
                if (Math.abs(currentScroll - targetY) > 10) {
                  window.scrollTo(0, targetY);
                  console.log(`Restoration attempt ${attempts + 1}: scrolled to ${targetY}, current: ${currentScroll}`);
                }

                attempts += 1;
                if (attempts < maxAttempts) {
                  timeoutId = window.setTimeout(restore, 150);
                } else {
                  console.log(`Finished scroll restoration after ${attempts} attempts`);
                  isRestoringRef.current = false;
                }
              };

              cleanupRef.current = () => {
                if (timeoutId) {
                  clearTimeout(timeoutId);
                }
                isRestoringRef.current = false;
              };

              // Start additional restoration attempts for back/forward navigation
              timeoutId = window.setTimeout(restore, 150);
            } else {
              // For other navigation types, let them handle it naturally
              isRestoringRef.current = false;
            }
          }
        } else {
          // For new navigations (PUSH/REPLACE), scroll to top; for back/forward (POP), let browser handle it
          if (navType === 'PUSH' || navType === 'REPLACE') {
            console.log(`New navigation (${navType}), scrolling to top`);
            window.scrollTo(0, 0);
          } else {
            console.log(`Back/forward navigation (${navType}), no saved position found`);
          }
        }
      } catch (error) {
        console.warn('Failed to restore scroll position:', error);
        isRestoringRef.current = false;
      }
    };

    // Start restoration after a small delay to allow React to render
    const timeoutId = setTimeout(restoreScroll, 100);

    // Cleanup function for the effect
    return () => {
      clearTimeout(timeoutId);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [location.pathname, location.search, navType]);

  // Save scroll position on page hide/visibility change
  useEffect(() => {
    const saveCurrentScroll = () => {
      if (!isRestoringRef.current) {
        const key = makeKey(location.pathname, location.search);
        try {
          const scrollY = Math.max(0, window.scrollY);
          sessionStorage.setItem(key, JSON.stringify({ y: scrollY }));
          console.log(`Saved current scroll position ${scrollY} for ${key}`);
        } catch (error) {
          console.warn('Failed to save scroll position on page hide:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveCurrentScroll();
      }
    };

    // Detect user scrolling to stop restoration
    let scrollTimeout: number;
    const handleUserScroll = () => {
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Set a timeout to detect if this was user-initiated scrolling
      scrollTimeout = window.setTimeout(() => {
        // If we're still restoring after a delay, assume user scrolled
        if (isRestoringRef.current) {
          console.log('User scroll detected, stopping restoration');
          isRestoringRef.current = false;
        }
      }, 200);
    };

    window.addEventListener('pagehide', saveCurrentScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    window.addEventListener('scroll', handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener('pagehide', saveCurrentScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleUserScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [location.pathname, location.search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return null;
}