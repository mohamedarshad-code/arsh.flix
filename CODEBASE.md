# 🎬 ARSH.FLIX — Complete Codebase Documentation

> **Netflix clone** built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, and the **TMDB API**.  
> Streams content via **VidKing** and **StreamIMDB** iframe embeds.

---

## 📁 Project Structure

```
netflix-clone/
├── .env.local                        # API keys (TMDB)
├── next.config.ts                    # Next.js config (image optimization)
├── package.json                      # Dependencies & scripts
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (fonts, metadata)
│   │   ├── globals.css               # Global styles & design tokens
│   │   ├── page.tsx                  # Homepage
│   │   ├── movies/page.tsx           # Movies page
│   │   ├── tv/page.tsx               # TV Shows page
│   │   ├── new/page.tsx              # New & Popular page
│   │   ├── watchlist/page.tsx        # My List page
│   │   ├── watch/[id]/page.tsx       # Video playback page
│   │   ├── torrent-player/page.tsx   # WebTorrent player page
│   │   └── api/stream/[id]/route.ts  # Stream URL API route
│   ├── components/                   # UI Components
│   │   ├── ArshPlayer.tsx            # Custom video player
│   │   ├── Hero.tsx                  # Hero banner section
│   │   ├── MovieCard.tsx             # Movie thumbnail card
│   │   ├── MovieRow.tsx              # Horizontal scrollable row
│   │   ├── MovieDetailModal.tsx      # Movie/TV detail popup
│   │   ├── Navbar.tsx                # Top navigation bar
│   │   ├── OriginalsRow.tsx          # Provider dropdown row
│   │   ├── TabbedMovieRow.tsx        # Movies/Series toggle row
│   │   └── SearchOverlay.tsx         # Full-screen search
│   ├── hooks/                        # Custom React hooks
│   │   ├── useWatchHistory.ts        # Watch history (localStorage)
│   │   └── useWatchlist.ts           # Watchlist / My List (localStorage)
│   └── lib/                          # Utilities & API clients
│       ├── tmdb.ts                   # TMDB API wrapper
│       ├── streams.ts                # Player source type definitions
│       └── utils.ts                  # Tailwind class merger (cn)
```

---

## ⚙️ Configuration Files

### `.env.local`
Contains the TMDB API credentials:
- `NEXT_PUBLIC_TMDB_API_KEY` — API key for all TMDB requests
- `NEXT_PUBLIC_TMDB_ACCESS_TOKEN` — Bearer token (alternative auth)
- `NEXT_PUBLIC_TMDB_BASE_URL` — `https://api.themoviedb.org/3`
- `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL` — Image CDN base URL

### `next.config.ts`
- Allows remote images from `image.tmdb.org`
- Configures output formats (`avif`, `webp`), cache TTL (30 days), and device/image sizes
- Custom image sizes: `[16, 32, 64, 128, 256, 300, 500]`

### `package.json`
Key dependencies:
| Package | Purpose |
|---------|---------|
| `next` 16.2.4 | Framework (App Router, Turbopack) |
| `react` 19.2.4 | UI library |
| `tailwindcss` 4 | Styling |
| `framer-motion` | Animations & transitions |
| `hls.js` | HLS video stream playback |
| `axios` | HTTP client for TMDB |
| `@radix-ui/react-dialog` | Accessible modal dialogs |
| `lucide-react` | Icon library |
| `cheerio` | HTML parsing (for scraping, currently unused) |

---

## 🎨 Styling — `globals.css`

Defines the core design system:
- **Colors**: `--background: #141414`, `--arsh-red: #E50914`, `--card-bg: #181818`
- **Tailwind v4 theme** using `@theme` directive to register custom colors as utilities (`bg-arsh-red`, `text-arsh-dark-red`, etc.)
- **Animations**: `fade-in` and `scale-in` keyframes
- **Scrollbar**: Custom red scrollbar styling (`scrollbar-hide` utility class)

---

## 🔌 API Layer

### `src/lib/tmdb.ts` — TMDB API Wrapper

The central data-fetching module. Creates an Axios instance pre-configured with the API key.

**Types exported:**
- `Movie` — Base type (id, title, name, poster_path, backdrop_path, vote_average, media_type)
- `Episode` — TV episode (name, overview, still_path, episode_number, runtime)
- `MovieDetails` — Extended movie (genres, seasons, credits, external_ids)

**Functions:**

| Function | Description |
|----------|-------------|
| `fetchTrending(type)` | Fetches weekly trending content. `type` can be `'all'`, `'movie'`, or `'tv'` |
| `fetchTopRated(type)` | Fetches top-rated movies or TV shows |
| `fetchArshOriginals()` | Fetches shows from network ID 213 (Netflix originals via TMDB) |
| `fetchByGenre(type, genreId)` | Discovers content by genre (e.g., 28=Action, 35=Comedy, 27=Horror) |
| `fetchByNetwork(networkId)` | Discovers TV shows by streaming network (Netflix=213, Prime=1024, Disney+=2739, etc.) |
| `fetchDetails(type, id)` | Fetches full details with credits, similar titles, and external IDs (IMDB) |
| `fetchEpisodes(tvId, seasonNumber)` | Fetches all episodes for a TV season |
| `fetchEpisodeDetails(tvId, s, e)` | Fetches episode-level external IDs |
| `searchContent(query)` | Multi-search across movies, TV, and people |
| `getImageUrl(path, size)` | Builds TMDB image URL. Returns a gray SVG placeholder if `path` is null/empty |

### `src/lib/streams.ts` — Player Source Types

Defines the `PlayerSource` union type used by ArshPlayer:
```typescript
type PlayerSource =
  | { type: "hls"; src: string }   // HLS manifest stream
  | { type: "mp4"; src: string }   // Direct MP4 file
  | { type: "iframe"; src: string } // Embedded iframe player
```
Also contains test streams (`Big Buck Bunny`, `Sample MP4`, `External Embed`) for development.

### `src/lib/utils.ts` — Tailwind Utility

Exports `cn()` — a helper that merges Tailwind class names using `clsx` + `tailwind-merge` to avoid conflicts.

---

## 🚀 API Route

### `src/app/api/stream/[id]/route.ts` — Stream URL Generator

**Purpose:** Server-side route that generates embed URLs for the video player.

**How it works:**
1. Receives `id` (TMDB ID), `type` (movie/tv), `s` (season), `e` (episode) as query params
2. **Resolves the series-level IMDB ID** by calling TMDB's `/external_ids` endpoint server-side. This is critical — it always fetches the *show's* IMDB ID, never an episode-specific one
3. Builds two iframe source URLs:

| Source | URL Pattern | ID Used |
|--------|-------------|---------|
| **VidKing** (primary) | `vidking.net/embed/tv/{tmdbId}/{s}/{e}?color=E50914&autoplay=true` | TMDB ID |
| **StreamIMDB** (fallback) | `streamimdb.ru/embed/tv/{imdbId}/{s}/{e}` | Series IMDB ID |

4. Returns JSON: `{ id, source: sources[0], sources: [...] }`

**Why IMDB ID resolution matters:**  
StreamIMDB needs the *series* IMDB ID (e.g., `tt7775902` for "The Boys") combined with season/episode numbers. If you pass an *episode-specific* IMDB ID instead, it plays the wrong content.

---

## 📄 Pages

### `src/app/layout.tsx` — Root Layout
- Loads **Geist** and **Geist Mono** fonts from Google Fonts
- Sets page title: "ARSH.FLIX - Stream Movies & TV Shows"
- Applies `antialiased` rendering and dark background

### `src/app/page.tsx` — Homepage
The main landing page. Fetches data in parallel on mount:
- Trending (all + movies specifically)
- Top Rated movies
- ARSH.FLIX Originals (Netflix network)
- Action & Comedy genres

**Sections rendered:**
1. `<Hero>` — Random featured original
2. `Continue Watching` — From localStorage watch history
3. `My List` — From localStorage watchlist
4. `Trending Today` — **TabbedMovieRow** with Movies/Series toggle
5. `Only on Netflix` — **OriginalsRow** with streaming provider dropdown
6. `Top Rated` — **TabbedMovieRow** with Movies/Series toggle + 🏆 icon
7. `Action Movies` — Standard **MovieRow**
8. `Comedy` — **TabbedMovieRow** with Movies/Series toggle

### `src/app/movies/page.tsx` — Movies Page
Dedicated movies page with sections: Trending Movies, Top Rated, Action, Horror.

### `src/app/tv/page.tsx` — TV Shows Page
Dedicated TV page with sections: Trending TV, ARSH.FLIX Originals, Action & Adventure TV, Comedy TV.

### `src/app/new/page.tsx` — New & Popular Page
Shows all trending content: All, Movies only, TV only, and Top Rated.

### `src/app/watchlist/page.tsx` — My List Page
Grid display of all watchlisted movies/shows. Shows empty state if no items saved.

### `src/app/watch/[id]/page.tsx` — Video Playback Page
The core streaming page. Flow:
1. Reads `id`, `type`, `s` (season), `e` (episode) from URL params
2. Fetches movie/show metadata from TMDB (`fetchDetails`)
3. Calls `/api/stream/{id}` to get embed URLs
4. Renders `<ArshPlayer>` with the stream source, all available sources, and metadata
5. Shows loading spinner or error state if stream fails

### `src/app/torrent-player/page.tsx` — Torrent Player
Accepts a `?magnet=` query param and loads the **Webtor** player SDK to stream torrent content directly in the browser via WebRTC/P2P. Wrapped in `<Suspense>` to avoid Next.js prerendering errors.

---

## 🧩 Components

### `Hero.tsx` — Hero Banner
Full-viewport-height banner showing a featured movie/show.
- Uses **native `<img>`** tag with `w1280` TMDB size (not Next.js Image) for fast loading
- `fetchPriority="high"` and `loading="eager"` for above-the-fold priority
- Two gradient overlays (bottom-to-top + left-to-right) for text readability
- "ARSH.FLIX Original" badge, title, overview, Play and More Info buttons
- Animated entry using Tailwind CSS `animate-in` utilities

### `Navbar.tsx` — Navigation Bar
Fixed-position top nav that transitions from transparent to solid `#141414` on scroll.
- **Left**: Netflix-style SVG logo (custom red "N" with gradients) + navigation links (Home, TV Shows, Movies, New & Popular, My List)
- **Right**: Search icon (triggers `SearchOverlay`), bell notification icon, user avatar with dropdown menu
- Dropdown includes: Manage Profiles, Account, Help Center, Sign Out

### `MovieCard.tsx` — Movie Thumbnail
Compact card showing a movie's backdrop image.
- Hover effect: scales up 110%, shows gradient overlay with Play/Add/Expand buttons
- Displays match percentage, age rating, and truncated title
- Uses Next.js `<Image>` with `unoptimized` for direct TMDB loading

### `MovieRow.tsx` — Horizontal Scroll Row
Standard scrollable row of `MovieCard` components.
- Left/right chevron buttons for scrolling (appear on hover)
- Smooth scroll behavior with full-width page jumps
- Used for simple sections like "Action Movies" and "Continue Watching"

### `OriginalsRow.tsx` — Provider Dropdown Row
Enhanced row with a streaming **network selector dropdown**.
- Title format: `| Only on [Netflix ▼]` with a dashed underline on the provider name
- **7 supported networks**: Netflix (213), Prime Video (1024), Max (3186), Disney+ (2739), Apple TV+ (2552), Paramount+ (4330), Hulu (453)
- Each network has a colored icon badge and triggers `fetchByNetwork(id)` on click
- Animated dropdown with Framer Motion (scale + fade)
- Closes on outside click

### `TabbedMovieRow.tsx` — Movies/Series Toggle Row
Row with a pill-style **Movies | Series** tab switcher on the right.
- Active tab has white background, inactive is transparent
- Switching tabs calls the appropriate fetch function (`fetchMovies` or `fetchSeries`)
- Displays **poster-style** vertical cards (2:3 aspect ratio) instead of backdrop thumbnails
- Each card shows: poster image, title, star rating, year, and content type
- Hover: scales poster image up 110% with gradient reveal
- Supports an optional icon prop (e.g., 🏆 for "Top Rated")

### `MovieDetailModal.tsx` — Detail Popup
Netflix-style modal that opens when clicking a movie/show.
- **Radix UI Dialog** for accessibility (focus trap, keyboard nav, screen reader support)
- **Header**: Full-width backdrop image with gradient, title (uppercase, tracked), Play button, watchlist toggle (Plus/Check), thumbs up
- **Content area** (3-column grid):
  - Main: Match %, year, age rating, season count, HD badge, full overview
  - **TV Episodes section**: Season dropdown, episode list with thumbnails, play overlay on hover, runtime badges
  - Sidebar: Cast list (top 5), genres, mood tags ("Exciting, Gritty, Suspenseful")
- Clicking an episode navigates to `/watch/{id}?type=tv&s={season}&e={episode}`

### `ArshPlayer.tsx` — Custom Video Player (700+ lines)
The core streaming player component. Handles three source types: HLS, MP4, and iframe.

**For iframe sources (VidKing/StreamIMDB):**
- Renders full-screen `<iframe>` with `allow="autoplay; encrypted-media; picture-in-picture; fullscreen"`
- Auto-appends `autoplay=true` to all iframe URLs
- Loading overlay: spinner for 2 seconds, then auto-hides
- "Stuck?" warning after 10 seconds with option to try next source
- Listens for `postMessage` events from VidAPI for progress tracking
- Saves/resumes playback position via `localStorage` with `resumeAt` param

**For native video (HLS/MP4):**
- HLS.js integration with quality level selection
- Custom controls overlay with:
  - Progress bar (seekable, hover-expand)
  - Play/Pause, skip ±10s, volume slider (auto-expand on hover)
  - Quality selector popup (Auto + individual levels like 1080p, 720p)
  - Subtitles button, fullscreen toggle
- Auto-hide controls after 3 seconds of inactivity

**Source Switcher (top-right):**
- Dropdown showing all available stream sources (VidKing, StreamIMDB)
- Red dot indicator for active source
- "Try next source" button in stuck warning

**Episodes Tab (TV shows only):**
- "Episodes" button in bottom control bar (only visible for TV shows)
- Slide-out right sidebar panel (400px, glassmorphism backdrop)
- **Header**: Search input, season dropdown (S1, S2, ...), Auto-next toggle switch, close button
- **Episode list**: Cards with still images, episode number, title, runtime, overview
- "WATCHING" red badge on current episode, red ring highlight
- Clicking an episode navigates via `router.push()` with the new season/episode params
- Search filters episodes by name

### `SearchOverlay.tsx` — Full-Screen Search
Full-viewport overlay triggered from the navbar search icon.
- Debounced search (500ms) using TMDB's multi-search endpoint
- Filters results to only items with poster/backdrop images
- Grid layout of `MovieCard` components
- Empty state: "Your search for X did not have any matches" with suggestions
- Initial state: large search icon with "Search for your favorite movies and shows"
- Animated entry (fade + scale) via Framer Motion

---

## 🪝 Custom Hooks

### `useWatchHistory.ts`
Manages the "Continue Watching" row using `localStorage`.
- **Key**: `arshflix-watch-history`
- **Max entries**: 30 (oldest dropped)
- Stores: id, type, title, poster, backdrop, overview, rating, season, episode, timestamp
- `addToHistory()` — Adds or bumps entry to front (deduplicates by id+type)
- `removeFromHistory()` — Removes specific entry
- `clearHistory()` — Wipes all history
- `historyAsMovies` — Converts history entries to `Movie` type for `MovieRow` compatibility

### `useWatchlist.ts`
Manages the "My List" feature using `localStorage`.
- **Key**: `arshflix-watchlist`
- `addToWatchlist(movie)` — Appends movie to list
- `removeFromWatchlist(id)` — Removes by ID
- `isInWatchlist(id)` — Boolean check (used for toggling the Plus/Check icon)

---

## 🔄 Data Flow

```
User clicks a movie → MovieDetailModal opens → User clicks "Play"
       ↓
/watch/{tmdbId}?type=tv&s=1&e=1
       ↓
WatchPage fetches TMDB metadata (fetchDetails)
       ↓
WatchPage calls /api/stream/{id}?type=tv&s=1&e=1
       ↓
API Route resolves series IMDB ID from TMDB
       ↓
API Route builds VidKing + StreamIMDB URLs
       ↓
ArshPlayer renders iframe with autoplay
       ↓
User can switch sources, browse episodes, seek, fullscreen
```

---

## 🎯 Key Design Decisions

1. **VidKing as primary**: Uses TMDB IDs directly — no IMDB resolution needed, most reliable
2. **StreamIMDB as fallback**: Needs series-level IMDB ID, resolved server-side to prevent wrong-episode bugs
3. **No Next.js Image for Hero**: Native `<img>` with `w1280` size loads 3-5x faster than server-optimized `original`
4. **localStorage for state**: Watch history and watchlist persist without a backend/database
5. **Iframe autoplay**: `autoplay=true` appended to all embed URLs in the URL builder
6. **Suspense boundaries**: Torrent player and watch page use Suspense to avoid static prerendering errors with `useSearchParams()`
