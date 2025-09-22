import { useOffline } from '../hooks/useOffline';
import { useQueryClient } from '@tanstack/react-query';
import { movieKeys } from '../features/movies/queries';

export default function OfflineIndicator() {
  const isOffline = useOffline();
  const queryClient = useQueryClient();

  if (!isOffline) return null;

  // Check if we have cached data
  const hasCachedData = queryClient.getQueryData(movieKeys.lists()) !== undefined;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#f59e0b',
        color: '#92400e',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 9999,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {hasCachedData ? (
        <>
          📱 You're offline • Showing cached data • Will sync when back online
        </>
      ) : (
        <>
          📱 You're offline • No cached data available • Check your connection
        </>
      )}
    </div>
  );
}
