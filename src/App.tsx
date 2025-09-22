import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import MovieDetailPage from './features/movies/MovieDetailPage'
import SearchPage from './features/movies/SearchPage'
import { hasTmdbKey } from './lib/tmdb'
import MoviesListPage from './features/movies/MoviesListPage'
import Nav from './components/Nav'
import ScrollMemory from './components/ScrollMemory'

function App() {
 return (
  <div className="min-h-screen w-full relative">
   <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(125% 125% at 50% 90%, #fff 40%, #7c3aed 100%)' }} />
   <div style={{ position: 'relative', zIndex: 1 }}>
    <ScrollMemory />
    <Nav />
    {!hasTmdbKey() ? (
      <div style={{ background: '#ffefc1', color: '#6b4e00', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        Missing VITE_TMDB_API_KEY. Create a .env at project root with: VITE_TMDB_API_KEY=YOUR_KEY and restart the dev server.
      </div>
    ) : null}
    {/* Links moved into Nav pill buttons */}
    <Routes>
      <Route path="/" element={<Navigate to="/movies" replace />} />
      <Route path="/movies" element={<MoviesListPage />} />
      <Route path="/movies/:id" element={<MovieDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
   </div>
  </div>
 )
}

export default App
