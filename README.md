# Keizer Assignment

Keizer is a modern **React-based movie discovery application** that provides users with an ui to **browse, search, and explore movies** using **The Movie Database (TMDB) API**.  
The application has search capabilities, responsive design, and optimized ui/ux.

## 🏗️ Core Application Structure

<img width="1477" height="747" alt="Screenshot 2025-09-23 034259" src="https://github.com/user-attachments/assets/8f2dda79-1216-47bc-ae85-787f38ad75b5" />

---

## 🔄 Data Flow Architecture

The app follows a **unidirectional data flow** with React Query managing server state and React hooks handling client state.  
Data is cached and invalidated based on volatility (e.g., trending vs. movie details).

<img width="1507" height="363" alt="Screenshot 2025-09-23 034338" src="https://github.com/user-attachments/assets/786483fc-ad17-4dff-ae85-8c375acbd2ca" />

---

## 🎯 Core Features

### 🎬 Movie Discovery
- Browse **popular**, **trending**, and **free-to-watch** movies  
- Advanced **real-time search** with pagination and suggestions  
- Detailed **movie information pages** with metadata  
- Responsive **grid layouts** across devices  

### ⚡ User Experience Optimization
- **Hover-based prefetching** for faster navigation  
- **Scroll position memory** for seamless back/forward navigation  
- **Debounced search input** to reduce API calls  
- **Smart caching** with React Query  

### 📱 Responsive Design
- Mobile-first UI with adaptive layouts  
- Touch-friendly navigation for small devices  
- Optimized Google Fonts integration  

---

## 🛠️ Technology Stack

### Frontend
- **React 18 + TypeScript** — Component-driven, type-safe UI  
- **Vite** — Lightning-fast build tool & dev server  
- **React Router** — Client-side routing  
- **Material-UI (MUI) + CSS** — Responsive UI styling  

### Data Management
- **React Query (@tanstack/react-query)** — Server state, caching, retries  
- **Zod** — Schema validation for inputs and responses  

### External Services
- **TMDB API** — Movie data (search, trending, details)  
- **Rick and Morty API** — Demo feature for extensibility  

---

## 📂 Project Structure

Framework: React with TypeScript 
Build Tool: Vite for fast development and optimized builds
State Management: React Query (@tanstack/react-query) for server state 
Routing: React Router for client-side navigation
Styling: CSS with Google Fonts integration.
Development Tools

Query Management: Centralized data fetching with React Query 
Performance Optimization: Prefetching and caching strategies 
State Persistence: Session storage for navigation context

Project Structure
```
keizer-assignment/  
├── src/  
│   ├── components/           # Reusable UI components  
│   │   ├── Nav.tsx          # Navigation and search component  
│   │   └── ScrollMemory.tsx # Scroll position management  
│   ├── features/            # Feature-based organization  
│   │   ├── movies/          # Movie-related functionality  
│   │   │   ├── hooks/       # Custom hooks for movie interactions  
│   │   │   │   └── useMovieCard.ts  
│   │   │   ├── queries.ts   # React Query configurations  
│   │   │   └── api.ts       # API integration layer  
│   │   └── characters/      # Character data (Rick & Morty API)  
│   │       ├── queries.ts   # Character query configurations  
│   │       └── api.ts       # Character API integration  
│   ├── hooks/               # Shared custom hooks  
│   │   └── useDebounce.ts   # Debounced input handling  
│   ├── lib/                 # Utility libraries  
│   │   ├── http.ts          # HTTP client utilities  
│   │   └── tmdb.ts          # TMDB API configuration  
│   └── App.tsx              # Main application component  
├── public/  
│   └── _redirects           # SPA routing configuration  
├── vite.config.ts           # Vite configuration  
├── package.json             # Dependencies and scripts  
└── README.md                # Project documentation  
```


---

## ⚡ Caching Strategy

| Data Type       | Stale Time | GC Time  | Strategy                                  |  
|-----------------|------------|----------|-------------------------------------------|  
| Search Results  | 2 minutes  | 15 mins  | Frequent updates expected                  |  
| Popular Movies  | 15 minutes | 2 hours  | Stable content, long cache                 |  
| Movie Details   | 30 minutes | 24 hours | Rarely changes, aggressive caching         |  
| Trending Movies | 5 minutes  | 1 hour   | Moderate volatility                        |  

---

## 🧑‍💻 Setup & Installation

### Prerequisites
- **Node.js** (v16 or higher)  
- **TMDB API Key** (get it free from [TMDB](https://www.themoviedb.org/settings/api))  

### 🚀 Setup Commands (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with TMDB API key
echo "VITE_TMDB_API_KEY=your_actual_api_key_here" > .env

# 3. Start development server
npm run dev
```

🏃‍♂️ Development Commands

```# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

🧪 Testing Commands
```
# Run tests in watch mode
npm run test:watch

# Run tests once
npm run test

# Run tests with UI
npm run test:ui

# Lint code
npm run lint

```
📋 Complete Setup Process

Clone repository & install dependencies

Create .env file with TMDB API key

Start development server (npm run dev)

Access the app:

Local: http://localhost:5173

🌐 Access the Application

Once running, Keizer supports:
Movie browsing with pagination
Real-time search
Detailed movie pages
Responsive design
Offline support
Unit tests with Zod validation

📜 License

This project is licensed under the MIT License.
