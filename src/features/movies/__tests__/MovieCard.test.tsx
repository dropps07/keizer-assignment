import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { MovieCard } from '../MoviesListPage'

// Mock the useMovieCard hook
vi.mock('../hooks/useMovieCard', () => ({
  useMovieCard: () => ({
    handleCardClick: vi.fn(),
    handleCardHover: vi.fn(),
  }),
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
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const mockMovie = {
  id: 123,
  title: 'Test Movie',
  poster_path: '/test-poster.jpg',
  vote_average: 8.5,
  release_date: '2023-01-01',
}

describe('MovieCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render movie poster when available', () => {
    render(
      <MovieCard 
        m={mockMovie} 
        isSmall={false} 
        firstVisit={false} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    const image = screen.getByAltText('Test Movie')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w342/test-poster.jpg')
  })

  it('should render fallback when no poster', () => {
    const movieWithoutPoster = { ...mockMovie, poster_path: null }

    render(
      <MovieCard 
        m={movieWithoutPoster} 
        isSmall={false} 
        firstVisit={false} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('should have correct link to movie detail', () => {
    render(
      <MovieCard 
        m={mockMovie} 
        isSmall={false} 
        firstVisit={false} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/movies/123')
  })

  it('should apply correct styling for small cards', () => {
    render(
      <MovieCard 
        m={mockMovie} 
        isSmall={true} 
        firstVisit={false} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    const image = screen.getByAltText('Test Movie')
    expect(image).toHaveStyle({ height: '160px' })
  })

  it('should apply correct styling for large cards', () => {
    render(
      <MovieCard 
        m={mockMovie} 
        isSmall={false} 
        firstVisit={false} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    const image = screen.getByAltText('Test Movie')
    expect(image).toHaveStyle({ height: '240px' })
  })

  it('should handle hover events', () => {
    const mockHandleCardHover = vi.fn()
    vi.mocked(require('../hooks/useMovieCard').useMovieCard).mockReturnValue({
      handleCardClick: vi.fn(),
      handleCardHover: mockHandleCardHover,
    })

    render(
      <MovieCard 
        m={mockMovie} 
        isSmall={false} 
        firstVisit={false} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    const card = screen.getByRole('link').firstChild as HTMLElement
    fireEvent.mouseEnter(card)

    expect(mockHandleCardHover).toHaveBeenCalledWith(123)
  })

  it('should handle click events', () => {
    const mockHandleCardClick = vi.fn()
    vi.mocked(require('../hooks/useMovieCard').useMovieCard).mockReturnValue({
      handleCardClick: mockHandleCardClick,
      handleCardHover: vi.fn(),
    })

    render(
      <MovieCard 
        m={mockMovie} 
        isSmall={false} 
        firstVisit={false} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    const link = screen.getByRole('link')
    fireEvent.click(link)

    expect(mockHandleCardClick).toHaveBeenCalledWith(123, 1)
  })

  it('should apply fade-in animation for first visit', () => {
    render(
      <MovieCard 
        m={mockMovie} 
        isSmall={false} 
        firstVisit={true} 
        currentPage={1} 
      />,
      { wrapper: createWrapper() }
    )

    const card = screen.getByRole('link').firstChild as HTMLElement
    expect(card).toHaveAttribute('data-fade')
  })
})
