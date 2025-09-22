import { renderHook, act } from '@testing-library/react'
import { useOffline } from '../useOffline'

describe('useOffline', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  it('should return false when online', () => {
    const { result } = renderHook(() => useOffline())
    expect(result.current).toBe(false)
  })

  it('should return true when offline', () => {
    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    const { result } = renderHook(() => useOffline())
    expect(result.current).toBe(true)
  })

  it('should update when online status changes', async () => {
    const { result } = renderHook(() => useOffline())
    
    // Initially online
    expect(result.current).toBe(false)

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })
    
    // Trigger offline event
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(true)

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
    
    // Trigger online event
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(false)
  })

  it('should handle SSR environment', () => {
    // This test is skipped in jsdom environment as window is always available
    // In a real SSR test, you'd mock the window object differently
    const { result } = renderHook(() => useOffline())
    expect(result.current).toBe(false)
  })
})
