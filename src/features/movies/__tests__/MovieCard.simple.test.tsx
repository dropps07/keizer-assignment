import { render, screen } from '@testing-library/react'
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

describe('MovieCard - Core Functionality', () => {
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
})
