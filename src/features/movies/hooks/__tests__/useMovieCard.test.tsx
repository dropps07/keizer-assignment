import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMovieCard } from '../useMovieCard'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'

// Mock the prefetchMovieDetail function
vi.mock('../../queries', () => ({
  prefetchMovieDetail: vi.fn(),
}))

// Import the mocked function for assertions
import { prefetchMovieDetail } from '../../queries'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Mock sessionStorage globally
const mockSessionStorage = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

describe('useMovieCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionStorage.clear()
    // Reset mocked functions
    ;(prefetchMovieDetail as any).mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
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

    // Set window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: scrollY,
    })

    act(() => {
      result.current.handleCardClick(movieId, currentPage)
    })

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'returnAnchor',
      expect.stringContaining(`"id":${movieId}`)
    )
    
    // Verify the stored data structure
    const setItemCall = (mockSessionStorage.setItem as any).mock.calls.find(
      (call: any[]) => call[0] === 'returnAnchor'
    )
    
    if (setItemCall) {
      const savedData = JSON.parse(setItemCall[1])
      expect(savedData).toEqual({
        id: movieId,
        page: currentPage,
        scrollY: scrollY,
        timestamp: expect.any(Number),
      })
    }
  })

  it('should handle sessionStorage errors gracefully', () => {
    // Mock sessionStorage.setItem to throw an error
    const setItemSpy = vi.spyOn(mockSessionStorage, 'setItem').mockImplementation(() => {
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

    // Restore mocks
    setItemSpy.mockRestore()
    consoleSpy.mockRestore()
  })

  it('should debounce hover prefetch calls', async () => {
    // Use fake timers for better control
    vi.useFakeTimers()
    
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

    // Fast-forward time to trigger debounced function
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Verify prefetch was called only once due to debouncing
    expect(prefetchMovieDetail).toHaveBeenCalledTimes(1)
    expect(prefetchMovieDetail).toHaveBeenCalledWith(movieId)

    vi.useRealTimers()
  })

  it('should not prefetch if movieId is invalid', () => {
    const { result } = renderHook(() => useMovieCard(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.handleCardHover(0)
    })

    expect(prefetchMovieDetail).not.toHaveBeenCalled()
  })
})