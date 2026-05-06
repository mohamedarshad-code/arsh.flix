export type PlayerSource =
  | { type: "hls"; src: string }
  | { type: "mp4"; src: string }
  | { type: "iframe"; src: string };

export const STREAMS = {
  bunny: {
    title: "Big Buck Bunny",
    source: {
      type: "hls" as const,
      src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    }
  },
  sample: {
    title: "Sample MP4",
    source: {
      type: "mp4" as const,
      src: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  },
  external: {
    title: "External Embed (fallback)",
    source: {
      type: "iframe" as const,
      src: "https://vidsrc.to/embed/movie/1318447"
    }
  }
};
