# ARSH.FLIX 🚀

ARSH.FLIX is a premium, high-performance Netflix clone built with **Next.js**, designed to provide a seamless streaming experience with a modern, cinematic UI.

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Framework-Next.js-black)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC)

## ✨ Features

- 🎬 **Premium Video Player**: Integrated with **VIDEASY** for high-quality streaming of movies and TV shows.
- 🎭 **Dynamic Hero Slider**: An auto-sliding Hero section featuring 4 trending movies and 1 series with smooth Framer Motion animations.
- 🖼️ **Advanced Image Optimization**: Powered by **wsrv.nl** for global caching and WebP conversion, ensuring lightning-fast poster loads.
- 🔍 **Real-time Search**: Instant search results with a specialized overlay interface.
- 📑 **Watchlist & History**: Keep track of what you want to see and where you left off with local persistence.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile viewing.
- 🌐 **Multi-audio Support**: Access dubbed versions and multiple subtitles directly within the player interface.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), React
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API**: [TMDB (The Movie Database)](https://www.themoviedb.org/)
- **Image Proxy**: [wsrv.nl](https://wsrv.nl/)
- **Streaming**: [VIDEASY](https://videasy.net/)

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/mohamedarshad-code/arsh.flix.git
cd arsh.flix
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Setup
Create a `.env.local` file in the root directory and add your TMDB credentials:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
```
> [!IMPORTANT]
> Never commit your actual API keys to GitHub. Always use environment variables.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Codebase Structure

- `/src/app`: Next.js App Router pages and API routes.
- `/src/components`: Reusable UI components (Navbar, Hero, MovieCard, etc.).
- `/src/lib`: Core logic, TMDB API wrappers, and utility functions.
- `/src/hooks`: Custom React hooks for watchlist and history management.
- `/src/context`: State management for global application settings.

## 🤝 Credits
- Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
- Video playback powered by [VIDEASY](https://videasy.net/).
- Image caching by [wsrv.nl](https://wsrv.nl/).

---
Developed with ❤️ by [Mohamed Arshad](https://github.com/mohamedarshad-code)
