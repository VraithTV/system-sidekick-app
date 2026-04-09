

# Integrate Kokoro TTS into Jarvis

## Overview
Add Kokoro TTS as the primary voice engine. Jarvis calls your hosted Kokoro server for speech synthesis. Users install nothing extra; they just use the Jarvis app.

## Architecture

```text
User's PC (Jarvis App)
    │
    │  POST https://your-server.com/v1/audio/speech
    │  { "input": "Hello sir", "voice": "af_bella" }
    │
    ▼
Your VPS ($5-10/mo)
    │  Kokoro TTS (Docker)
    │  Returns MP3/WAV audio
    │
    ▼
Jarvis plays the audio
    (falls back to browser voices if server unreachable)
```

## Steps

### 1. Create a backend function to proxy Kokoro requests
- New edge function `kokoro-tts` that forwards TTS requests to your Kokoro server URL (stored as a secret).
- This avoids exposing your server URL directly in the app code.

### 2. Add Kokoro server URL setting
- New secret: `KOKORO_TTS_URL` (e.g. `https://tts.yoursite.com`)
- The edge function reads this secret and proxies requests.

### 3. Update the TTS pipeline in the app
- Modify `src/lib/elevenLabsTTS.ts` (or create `src/lib/kokoroTTS.ts`) to call the edge function.
- TTS priority: Kokoro server → ElevenLabs (if configured) → browser voices.
- The hook in `useVoiceAssistant.ts` already has fallback logic; we extend it.

### 4. Add Kokoro voice options
- Map Kokoro's built-in voices (e.g. `af_bella`, `am_adam`, `bf_emma`, `bm_george`) to the existing voice selector in settings.
- Update `src/lib/voices.ts` with Kokoro voice entries.

### 5. Automatic fallback
- If the Kokoro server returns an error or times out (2s), fall back to browser TTS silently.
- No user-facing error unless all methods fail.

## What you need to do (separate from Lovable)
1. Rent a VPS with GPU support (Hetzner GPU, Vast.ai, RunPod, etc.)
2. Run: `docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-gpu:latest`
3. Set up a domain/reverse proxy (nginx) so it's accessible via HTTPS
4. Add the URL as a secret in the project settings

## Technical details
- Edge function: `su