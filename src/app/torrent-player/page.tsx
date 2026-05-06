'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

function TorrentPlayerContent() {
  const searchParams = useSearchParams();
  const magnet = searchParams.get('magnet');
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!magnet || !playerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@webtor/player-sdk-js/dist/index.min.js';
    script.async = true;
    
    script.onload = () => {
      // @ts-ignore
      window.webtor = window.webtor || [];
      // @ts-ignore
      window.webtor.push({
        id: 'webtor-player',
        magnet: magnet,
        width: '100%',
        height: '100%',
        theme: 'dark',
        lang: 'en',
        features: {
          title: false,
          p2pProgress: true,
          settings: true,
          fullscreen: true,
        }
      });
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [magnet]);

  if (!magnet) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        No magnet link provided
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden m-0 p-0">
      <div id="webtor-player" ref={playerRef} className="h-full w-full" />
    </div>
  );
}

export default function TorrentPlayer() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-black text-white">Loading player...</div>}>
      <TorrentPlayerContent />
    </Suspense>
  );
}
