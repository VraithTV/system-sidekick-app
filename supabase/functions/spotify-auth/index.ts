import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      action,
      code,
      refresh_token,
      redirect_uri,
      access_token,
      query,
      device_id,
      uris,
      volume_percent,
      state,
    } = body;

    const callSpotifyApi = async (path: string, init: RequestInit = {}) => {
      if (!access_token || typeof access_token !== "string") {
        return jsonResponse({ error: "Missing Spotify access token" }, 400);
      }

      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${access_token}`);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`https://api.spotify.com${path}`, {
        ...init,
        headers,
      });
      const data = await parseResponseBody(response);

      console.info(`[spotify-auth] ${action}: ${response.status}`);

      if (!response.ok) {
        return jsonResponse(
          { error: "Spotify API request failed", status: response.status, data },
          response.status
        );
      }

      return jsonResponse({ data, status: response.status });
    };

    if (["exchange", "refresh", "get-auth-url"].includes(action)) {
      const SPOTIFY_CLIENT_ID = Deno.env.get("SPOTIFY_CLIENT_ID");
      const SPOTIFY_CLIENT_SECRET = Deno.env.get("SPOTIFY_CLIENT_SECRET");

      if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        return jsonResponse({ error: "Spotify credentials not configured" }, 500);
      }

      const authHeader = "Basic " + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

      if (action === "exchange") {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirect_uri || "http://localhost:8888/callback",
          }),
        });

        const data = await parseResponseBody(response);
        if (!response.ok) {
          return jsonResponse({ error: data?.error_description || data?.error || data }, response.status);
        }

        return jsonResponse(data);
      }

      if (action === "refresh") {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token,
          }),
        });

        const data = await parseResponseBody(response);
        if (!response.ok) {
          return jsonResponse({ error: data?.error_description || data?.error || data }, response.status);
        }

        return jsonResponse(data);
      }

      if (action === "get-auth-url") {
        const scopes = "user-modify-playback-state user-read-playback-state user-read-currently-playing streaming";
        const actualRedirect = redirect_uri || "http://127.0.0.1:8080";
        const params = new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          response_type: "code",
          redirect_uri: actualRedirect,
          scope: scopes,
          show_dialog: "true",
        });

        return jsonResponse({ url: `https://accounts.spotify.com/authorize?${params}` });
      }
    }

    if (action === "search-track") {
      return await callSpotifyApi(`/v1/search?q=${encodeURIComponent(query || "")}&type=track&limit=1`);
    }

    if (action === "get-devices") {
      return await callSpotifyApi("/v1/me/player/devices");
    }

    if (action === "transfer-playback") {
      return await callSpotifyApi("/v1/me/player", {
        method: "PUT",
        body: JSON.stringify({ device_ids: [device_id], play: false }),
      });
    }

    if (action === "play-track") {
      const searchParams = new URLSearchParams();
      if (device_id) searchParams.set("device_id", device_id);
      const suffix = searchParams.toString() ? `?${searchParams}` : "";

      return await callSpotifyApi(`/v1/me/player/play${suffix}`, {
        method: "PUT",
        body: JSON.stringify({ uris: Array.isArray(uris) ? uris : [] }),
      });
    }

    if (action === "pause") {
      return await callSpotifyApi("/v1/me/player/pause", { method: "PUT" });
    }

    if (action === "resume") {
      return await callSpotifyApi("/v1/me/player/play", { method: "PUT" });
    }

    if (action === "next") {
      return await callSpotifyApi("/v1/me/player/next", { method: "POST" });
    }

    if (action === "previous") {
      return await callSpotifyApi("/v1/me/player/previous", { method: "POST" });
    }

    if (action === "set-volume") {
      return await callSpotifyApi(`/v1/me/player/volume?volume_percent=${encodeURIComponent(String(volume_percent ?? 50))}`, {
        method: "PUT",
      });
    }

    if (action === "now-playing") {
      return await callSpotifyApi("/v1/me/player/currently-playing");
    }

    if (action === "player-state") {
      return await callSpotifyApi("/v1/me/player");
    }

    if (action === "shuffle") {
      return await callSpotifyApi(`/v1/me/player/shuffle?state=${state ? "true" : "false"}`, {
        method: "PUT",
      });
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (e) {
    console.error("spotify-auth error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
