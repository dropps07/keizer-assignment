import { useState, useEffect } from 'react';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false;
    return !navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
