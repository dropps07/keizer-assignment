import { describe, it, expect, vi } from 'vitest'
import { MovieSchema, MoviesPageSchema } from '../api'

describe('API Schema Validation', () => {
  describe('MovieSchema', () => {
    it('should validate a correct movie object', () => {
      const validMovie = {
        id: 123,
        title: 'Test Movie',
        overview: 'A test movie',
        poster_path: '/test-poster.jpg',
        backdrop_path: '/test-backdrop.jpg',
        release_date: '2023-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        adult: false,
        original_language: 'en',
        original_title: 'Test Movie',
        popularity: 85.5,
        video: false,
        genre_ids: [28, 12, 16],
      }

      expect(() => MovieSchema.parse(validMovie)).not.toThrow()
    })

    it('should reject movie with missing required fields', () => {
      const invalidMovie = {
        id: 123,
        // Missing title
        overview: 'A test movie',
      }

      expect(() => MovieSchema.parse(invalidMovie)).toThrow()
    })

    it('should reject movie with invalid types', () => {
      const invalidMovie = {
        id: 'not-a-number', // Should be number
        title: 'Test Movie',
        overview: 'A test movie',
        poster_path: '/test-poster.jpg',
        backdrop_path: '/test-backdrop.jpg',
        release_date: '2023-01-01',
        vote_average: 'high', // Should be number
        vote_count: 1000,
        adult: false,
        original_language: 'en',
        original_title: 'Test Movie',
        popularity: 85.5,
        video: false,
        genre_ids: [28, 12, 16],
      }

      expect(() => MovieSchema.parse(invalidMovie)).toThrow()
    })

    it('should handle null values correctly', () => {
      const movieWithNulls = {
        id: 123,
        title: 'Test Movie',
        overview: 'A test movie',
        poster_path: null, // Null is allowed
        backdrop_path: null, // Null is allowed
        release_date: '2023-01-01',
        vote_average: 8.5,
        vote_count: 1000,
        adult: false,
        original_language: 'en',
        original_title: 'Test Movie',
        popularity: 85.5,
        video: false,
        genre_ids: [28, 12, 16],
      }

      expect(() => MovieSchema.parse(movieWithNulls)).not.toThrow()
    })
  })

  describe('MoviesPageSchema', () => {
    it('should validate a correct movies page response', () => {
      const validMoviesPage = {
        page: 1,
        results: [
          {
            id: 123,
            title: 'Test Movie',
            overview: 'A test movie',
            poster_path: '/test-poster.jpg',
            backdrop_path: '/test-backdrop.jpg',
            release_date: '2023-01-01',
            vote_average: 8.5,
            vote_count: 1000,
            adult: false,
            original_language: 'en',
            original_title: 'Test Movie',
            popularity: 85.5,
            video: false,
            genre_ids: [28, 12, 16],
          }
        ],
        total_pages: 10,
        total_results: 200,
      }

      expect(() => MoviesPageSchema.parse(validMoviesPage)).not.toThrow()
    })

    it('should reject movies page with invalid results array', () => {
      const invalidMoviesPage = {
        page: 1,
        results: 'not-an-array', // Should be array
        total_pages: 10,
        total_results: 200,
      }

      expect(() => MoviesPageSchema.parse(invalidMoviesPage)).toThrow()
    })

    it('should reject movies page with missing required fields', () => {
      const invalidMoviesPage = {
        page: 1,
        results: [],
        // Missing total_pages and total_results
      }

      expect(() => MoviesPageSchema.parse(invalidMoviesPage)).toThrow()
    })

    it('should handle empty results array', () => {
      const emptyMoviesPage = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      }

      expect(() => MoviesPageSchema.parse(emptyMoviesPage)).not.toThrow()
    })
  })

  describe('API Integration', () => {
    it('should validate real API response structure', () => {
      // This would typically test with actual API response
      const mockApiResponse = {
        page: 1,
        results: [
          {
            id: 550,
            title: 'Fight Club',
            overview: 'A ticking-time-bomb insomniac...',
            poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
            backdrop_path: '/87hTDiay2N2qWyX4Dx7d0T6bvl.jpg',
            release_date: '1999-10-15',
            vote_average: 8.433,
            vote_count: 26280,
            adult: false,
            original_language: 'en',
            original_title: 'Fight Club',
            popularity: 61.916,
            video: false,
            genre_ids: [18],
          }
        ],
        total_pages: 500,
        total_results: 10000,
      }

      expect(() => MoviesPageSchema.parse(mockApiResponse)).not.toThrow()
    })
  })
})
