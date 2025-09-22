import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OfflineIndicator from '../OfflineIndicator'
import { useOffline } from '../../hooks/useOffline'

// Mock the useOffline hook
vi.mock('../../hooks/useOffline')
const mockUseOffline = vi.mocked(useOffline)

// Mock the movieKeys
vi.mock('../../features/movies/queries', () => ({
  movieKeys: {
    lists: () => ['movies', 'list'],
  },
}))

const createWrapper = (hasCachedData = false) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  // Mock getQueryData to return cached data or undefined
  queryClient.getQueryData = vi.fn(() => 
    hasCachedData ? { results: [] } : undefined
  )

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when online', () => {
    mockUseOffline.mockReturnValue(false)

    render(<OfflineIndicator />, { wrapper: createWrapper() })
    
    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument()
  })

  it('should render offline message when offline with cached data', () => {
    mockUseOffline.mockReturnValue(true)

    render(<OfflineIndicator />, { wrapper: createWrapper(true) })
    
    expect(screen.getByText(/You're offline • Showing cached data • Will sync when back online/)).toBeInTheDocument()
  })

  it('should render offline message when offline without cached data', () => {
    mockUseOffline.mockReturnValue(true)

    render(<OfflineIndicator />, { wrapper: createWrapper(false) })
    
    expect(screen.getByText(/You're offline • No cached data available • Check your connection/)).toBeInTheDocument()
  })

  it('should have correct styling', () => {
    mockUseOffline.mockReturnValue(true)

    const { container } = render(<OfflineIndicator />, { wrapper: createWrapper(true) })
    
    const indicator = container.firstChild as HTMLElement
    expect(indicator).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      background: '#f59e0b',
      color: '#92400e',
      zIndex: '9999',
    })
  })

  it('should include emoji icon', () => {
    mockUseOffline.mockReturnValue(true)

    render(<OfflineIndicator />, { wrapper: createWrapper(true) })
    
    expect(screen.getByText(/📱/)).toBeInTheDocument()
  })
})
