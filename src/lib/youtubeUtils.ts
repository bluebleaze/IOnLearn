import { YouTubeVideoInfo } from "@/types";

/**
 * Validates whether a given string is a YouTube URL
 */
export function isYouTubeUrl(urlStr?: string | null): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  return /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i.test(
    urlStr.trim()
  );
}

/**
 * Extracts YouTube video ID and returns standard YouTubeVideoInfo
 */
export function parseYouTubeUrl(urlStr?: string | null): YouTubeVideoInfo | null {
  if (!urlStr || typeof urlStr !== "string") return null;
  const trimmed = urlStr.trim();

  // Match video ID from various YouTube URL formats
  const match = trimmed.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );

  if (!match || !match[1]) return null;

  const videoId = match[1];
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return {
    videoId,
    url: trimmed,
    canonicalUrl,
    embedUrl,
    thumbnailUrl,
  };
}

/**
 * Finds all YouTube URLs inside a block of text
 */
export function extractYouTubeUrls(text?: string | null): string[] {
  if (!text || typeof text !== "string") return [];
  const regex = /(https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?[^\s<>"'{}|\\^`]*v=[a-zA-Z0-9_-]{11}[^\s<>"'{}|\\^`]*|embed\/[a-zA-Z0-9_-]{11}|shorts\/[a-zA-Z0-9_-]{11}|live\/[a-zA-Z0-9_-]{11})|youtu\.be\/[a-zA-Z0-9_-]{11}[^\s<>"'{}|\\^`]*))/gi;
  const matches = text.match(regex);
  if (!matches) return [];

  const cleaned = matches.map((u) => u.replace(/[.,;!?)]+$/, ""));
  const unique = Array.from(new Set(cleaned));
  return unique.filter((url) => isYouTubeUrl(url));
}

/**
 * Fetches basic video metadata (title, author, thumbnail) using YouTube oEmbed API
 * Note: Free, requires no API key, works natively in server and browser.
 */
export async function fetchYouTubeMetadata(videoIdOrUrl: string): Promise<{
  title?: string;
  authorName?: string;
  authorUrl?: string;
  thumbnailUrl?: string;
} | null> {
  const trimmed = videoIdOrUrl?.trim() || "";
  let targetUrl = trimmed;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    targetUrl = `https://www.youtube.com/watch?v=${trimmed}`;
  } else {
    const parsed = parseYouTubeUrl(trimmed);
    if (parsed) targetUrl = parsed.canonicalUrl;
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      targetUrl
    )}&format=json`;
    const res = await fetch(oembedUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || undefined,
        authorName: data.author_name || undefined,
        authorUrl: data.author_url || undefined,
        thumbnailUrl: data.thumbnail_url || undefined,
      };
    }
  } catch (err) {
    console.warn("Failed to fetch YouTube oEmbed metadata:", err);
  }

  return null;
}

/**
 * Extract balanced JSON array from text
 */
function extractBalancedJsonArray(text: string, startIndex: number): string | null {
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "[") depth++;
      else if (char === "]") {
        depth--;
        if (depth === 0) {
          return text.slice(startIndex, i + 1);
        }
      }
    }
  }
  return null;
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
function formatTimestamp(seconds: number): string {
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Attempt to fetch and parse YouTube video transcript / captions
 */
export async function fetchYouTubeTranscript(videoId: string): Promise<string | null> {
  if (!videoId || videoId.length !== 11) return null;

  try {
    // 1. Fetch the video watch page HTML
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3500),
    });

    if (!pageRes.ok) return null;
    const pageHtml = await pageRes.text();

    // 2. Extract player response captions JSON using balanced brackets
    const marker = '"captionTracks":';
    const markerIdx = pageHtml.indexOf(marker);
    if (markerIdx === -1) return null;

    const startBracketIdx = pageHtml.indexOf("[", markerIdx + marker.length);
    if (startBracketIdx === -1) return null;

    const jsonStr = extractBalancedJsonArray(pageHtml, startBracketIdx);
    if (!jsonStr) return null;

    let captionTracks: any[] = [];
    try {
      captionTracks = JSON.parse(jsonStr);
    } catch {
      return null;
    }

    if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
      return null;
    }

    // Pick best caption track: Indonesian preferred, then English, or first available
    let chosenTrack =
      captionTracks.find((t) => t.languageCode === "id") ||
      captionTracks.find((t) => (t.languageCode || "").startsWith("en")) ||
      captionTracks[0];

    if (!chosenTrack || !chosenTrack.baseUrl) return null;

    // 3. Fetch timed text
    const timedTextUrl = chosenTrack.baseUrl + "&fmt=json3";
    const timedRes = await fetch(timedTextUrl);

    if (timedRes.ok) {
      const timedJson = await timedRes.json();
      if (timedJson.events && Array.isArray(timedJson.events)) {
        const transcriptLines: string[] = [];
        for (const ev of timedJson.events) {
          if (!ev.segs) continue;
          const text = ev.segs
            .map((s: any) => s.utf8 || "")
            .join("")
            .replace(/\n+/g, " ")
            .trim();
          if (!text) continue;

          const startSec = (ev.tStartMs || 0) / 1000;
          const timestampStr = formatTimestamp(startSec);
          transcriptLines.push(`[${timestampStr}] ${text}`);
        }

        if (transcriptLines.length > 0) {
          return transcriptLines.join("\n");
        }
      }
    }

    // Fallback: XML timedtext parsing
    const xmlRes = await fetch(chosenTrack.baseUrl);
    if (xmlRes.ok) {
      const xmlText = await xmlRes.text();
      const textMatches = Array.from(
        xmlText.matchAll(/<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g)
      );

      if (textMatches.length > 0) {
        const transcriptLines = textMatches
          .map((m) => {
            const startSec = parseFloat(m[1]);
            const rawText = m[2]
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\n+/g, " ")
              .trim();
            return `[${formatTimestamp(startSec)}] ${rawText}`;
          })
          .filter(Boolean);

        if (transcriptLines.length > 0) {
          return transcriptLines.join("\n");
        }
      }
    }
  } catch (e) {
    console.warn(`Could not extract transcript for YouTube video ${videoId}:`, e);
  }

  return null;
}

