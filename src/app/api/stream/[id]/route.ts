import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';

  const tmdbId = id;
  let sources: { label: string; type: string; src: string }[] = [];

  if (type === 'tv') {
    sources = [
      {
        label: 'VIDEASY',
        type: 'iframe',
        src: `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`
      }
    ];
  } else {
    sources = [
      {
        label: 'VIDEASY',
        type: 'iframe',
        src: `https://player.videasy.net/movie/${tmdbId}`
      }
    ];
  }

  return NextResponse.json({
    id,
    type,
    season,
    episode,
    source: sources[0],
    sources: sources.map((s, i) => ({
      id: i,
      label: s.label,
      type: s.type,
      src: s.src,
      priority: i === 0
    }))
  });
}
