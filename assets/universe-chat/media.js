/* @module universe-chat/media
   Single responsibility: the chat's voice and image capabilities, over the
   family's published audio modules and the OpenRouter API. Loaded on demand —
   the first mic press or infographic call pays the import, nobody else does.

   Voice: record (core/sg-audio) → WAV (core/sg-audio-decode, the one format
   every OpenRouter audio model accepts) → transcribe with a curated
   audio-capable chat model → the transcript becomes an ordinary chat message.
   Images: one OpenRouter call with image modalities; the caller renders and
   persists the result. Both use the user's own key from the shared
   sg-llm-config — nothing here talks to any sgraph.ai host. */
'use strict';
import { startRecording, stopRecording, getBestMimeType, isMediaRecorderSupported }
  from 'https://tools.sgraph.ai/core/sg-audio/v0/v0.1/v0.1.0/sg-audio.js';
import { blobToWav }
  from 'https://tools.sgraph.ai/core/sg-audio-decode/v0/v0.1/v0.1.0/sg-audio-decode.js';

/* Curated ids, per the estate's audio-models and infographic model-picker. */
export const TRANSCRIBE_MODEL = 'google/gemini-3.5-flash';
export const IMAGE_MODEL = 'google/gemini-3.1-flash-image-preview';

const OPENROUTER = 'https://openrouter.ai/api/v1/chat/completions';

function apiKey() {
  try {
    const cfg = JSON.parse(localStorage.getItem('sg-llm-config') || 'null');
    if (cfg && cfg.apiKey) return cfg.apiKey;
  } catch (e) { /* fall through */ }
  throw new Error('no OpenRouter key — connect a model first');
}

async function blobToBase64(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

async function callOpenRouter(body) {
  const res = await fetch(OPENROUTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = 'HTTP ' + res.status;
    try { msg = (await res.json()).error.message || msg; } catch (e) { /* keep the status */ }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Start one voice note. Returns a handle whose stop() resolves to the WAV blob
 * (or null when nothing was captured).
 */
export async function startVoiceNote() {
  if (!isMediaRecorderSupported()) throw new Error('this browser cannot record audio');
  const parts = [];
  const mime = getBestMimeType() || 'audio/webm';
  const session = await startRecording({
    segmentDurationMs: 10 * 60 * 1000,
    mimeType: mime,
    onSegment: (seg) => parts.push(seg.blob),
    onError: () => { /* surfaced by stop(): no parts means nothing captured */ },
  });
  return {
    async stop() {
      await stopRecording(session);
      /* the final segment lands via onSegment during stop; give it a beat */
      for (let i = 0; i < 20 && !parts.length; i++) await new Promise((r) => setTimeout(r, 50));
      if (!parts.length) return null;
      return blobToWav(new Blob(parts, { type: mime }));
    },
  };
}

/**
 * Transcribe a WAV blob. Returns the transcript text.
 * @param {Blob} wav
 */
export async function transcribe(wav) {
  const b64 = await blobToBase64(wav);
  const json = await callOpenRouter({
    model: TRANSCRIBE_MODEL,
    messages: [{ role: 'user', content: [
      { type: 'text', text: 'Transcribe this audio exactly, in its original language. Return only the transcript, nothing else.' },
      { type: 'input_audio', input_audio: { data: b64, format: 'wav' } },
    ] }],
  });
  const text = (json.choices && json.choices[0] && json.choices[0].message
    && json.choices[0].message.content || '').trim();
  if (!text) throw new Error('the transcription came back empty');
  return text;
}

/**
 * Generate one infographic image. Returns { dataUrl, model }.
 * @param {string} brief - what the infographic should show
 * @param {string} [style] - optional style guidance
 */
export async function generateInfographic(brief, style) {
  const prompt = 'Create a single clear infographic image.\n\n' + brief
    + (style ? '\n\nStyle: ' + style : '');
  const json = await callOpenRouter({
    model: IMAGE_MODEL,
    modalities: ['image', 'text'],
    messages: [{ role: 'user', content: prompt }],
  });
  const msg = json.choices && json.choices[0] && json.choices[0].message;
  const img = msg && msg.images && msg.images[0];
  const url = img && img.image_url && img.image_url.url;
  if (!url) throw new Error('the model returned no image' + (msg && msg.content ? ' — it said: ' + String(msg.content).slice(0, 200) : ''));
  return { dataUrl: url, model: IMAGE_MODEL };
}

/** data:...;base64,xxx → Uint8Array (for saving into the vault). */
export function dataUrlToBytes(dataUrl) {
  const b64 = String(dataUrl).split(',')[1] || '';
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
