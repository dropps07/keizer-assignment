import Nav from "../components/Nav";
import MoviesListPage from "./movies/MoviesListPage";

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <Nav />
        <div style={{ padding: '0 16px' }}>
          <MoviesListPage />
        </div>
      </div>
    </div>
  );
}