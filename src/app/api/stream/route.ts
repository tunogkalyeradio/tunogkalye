import { NextRequest } from "next/server";

// ─── Server-Side Stream Proxy ────────────────────────────────
// Proxies the AzuraCast audio stream through our own domain to
// avoid CORS / CORP / Cloudflare issues.
//
// Browser → hub.tunogkalye.net/api/stream (same-origin, no CORS)
// Server → tunogkalye.net/listen/tunog-kalye/radio (upstream)

// Correct stream URL from AzuraCast playlist.pls
const UPSTREAM_STREAM = process.env.STREAM_UPSTREAM_URL || "https://tunogkalye.net/listen/tunog-kalye/radio";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30 * 60 * 1000);

    const upstream = new URL(UPSTREAM_STREAM);

    const response = await fetch(upstream.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Encoding": "identity",
      },
      signal: controller.signal,
      redirect: "follow",
      // @ts-expect-error - duplex needed for streaming
      duplex: "half",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Stream returned " + response.status }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the audio data through
    const contentType = response.headers.get("content-type") || "audio/mpeg";

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store",
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Stream proxy error: " + message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
