import { NextResponse } from "next/server";
import {
  parseYouTubeUrl,
  fetchYouTubeMetadata,
  fetchYouTubeTranscript,
} from "@/lib/youtubeUtils";

export async function POST(req: Request) {
  try {
    const { url, includeTranscript = false } = (await req.json()) as {
      url: string;
      includeTranscript?: boolean;
    };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL YouTube diperlukan." },
        { status: 400 }
      );
    }

    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Format tautan YouTube tidak valid atau video ID tidak ditemukan." },
        { status: 400 }
      );
    }

    // Fetch oEmbed metadata (title, author/channel, thumbnail)
    const meta = await fetchYouTubeMetadata(parsed.canonicalUrl);

    let transcript: string | null = null;
    if (includeTranscript) {
      transcript = await fetchYouTubeTranscript(parsed.videoId);
    }

    const videoInfo = {
      videoId: parsed.videoId,
      url: parsed.url,
      canonicalUrl: parsed.canonicalUrl,
      embedUrl: parsed.embedUrl,
      thumbnailUrl: meta?.thumbnailUrl || parsed.thumbnailUrl,
      title: meta?.title || `Video YouTube (${parsed.videoId})`,
      authorName: meta?.authorName || "YouTube Creator",
      authorUrl: meta?.authorUrl,
      transcript: transcript || undefined,
      hasTranscript: Boolean(transcript),
    };

    return NextResponse.json(videoInfo);
  } catch (error: any) {
    console.error("Error in YouTube info API:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data video YouTube." },
      { status: 500 }
    );
  }
}

