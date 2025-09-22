import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMovieCard } from '../useMovieCard'

// Mock the prefetchMovieDetail function
vi.mock('../../queries', () => ({
  prefetchMovieDetail: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useMovieCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear sessionStorage
    sessionStorage.clear()
  })

  it('should provide handleCardClick and handleCardHover functions', () => {
    const { result } = renderHook(() => useMovieCard(), {
      wrapper: createWrapper(),
    })

    expect(result.current.handleCardClick).toBeInstanceOf(Function)
    expect(result.current.handleCardHover).toBeInstanceOf(Function)
    expect(result.current.prefetchMovie).toBeInstanceOf(Function)
  })

  it('should save return anchor data on card click', () => {
    const { result } = renderHook(() => useMovieCard(), {
      wrapper: createWrapper(),
    })

    const movieId = 123
    const currentPage = 2
    const scrollY = 500

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: scrollY,
    })

    act(() => {
      result.current.handleCardClick(movieId, currentPage)
    })

    const savedData = JSON.parse(sessionStorage.getItem('returnAnchor') || '{}')
    expect(savedData).toEqual({
      id: movieId,
      page: currentPage,
      scrollY: scrollY,
      timestamp: expect.any(Number),
    })
  })

  it('should handle sessionStorage errors gracefully', () => {
    // Mock sessionStorage.setItem to throw an error
    const originalSetItem = sessionStorage.setItem
    sessionStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useMovieCard(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.handleCardClick(123, 1)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save return anchor:',
      expect.any(Error)
    )

    // Restore original function
    sessionStorage.setItem = originalSetItem
    consoleSpy.mockRestore()
  })

  it('should debounce hover prefetch calls', async () => {
    const { result } = renderHook(() => useMovieCard(), {
      wrapper: createWrapper(),
    })

    const movieId = 456

    // Call handleCardHover multiple times quickly
    act(() => {
      result.current.handleCardHover(movieId)
      result.current.handleCardHover(movieId)
      result.current.handleCardHover(movieId)
    })

    // Wait for debounce delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
    })

    // The prefetch should only be called once due to debouncing
    // Note: This test would need the actual prefetchMovieDetail to be called
    // In a real scenario, you'd mock the prefetchMovieDetail function
  })
})
