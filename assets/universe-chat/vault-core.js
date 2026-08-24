/* @module universe-chat/vault-core
   Single responsibility: the pure logic of chat-session persistence — how a
   vault key string is understood, how a session names itself and its files,
   and which files actually changed since the last save. No network, no DOM,
   no clock: everything ambient is passed in, so gate 27 can test it. */
'use strict';

/** Where every chat session lives inside the vault. */
export const VAULT_ROOT = 'universe-chat';

/**
 * Understand a pasted vault key. Two accepted shapes, per the family's
 * sg-vault-connect: "passphrase:vaultId" (the last colon splits, so the
 * passphrase may itself contain colons) and a Simple Token ("word-word-0000").
 * @param {string} raw
 * @returns {{kind: 'passphrase', passphrase: string, vaultId: string} | {kind: 'token', token: string}}
 */
export function parseVaultKey(raw) {
  const s = (raw || '').trim();
  if (!s) throw new Error('empty vault key');
  const lastColon = s.lastIndexOf(':');
  if (lastColon > 0 && lastColon < s.length - 1) {
    return { kind: 'passphrase', passphrase: s.slice(0, lastColon), vaultId: s.slice(lastColon + 1) };
  }
  if (lastColon !== -1) throw new Error('a vault key looks like passphrase:vaultId');
  return { kind: 'token', token: s };
}

/**
 * A sortable, filesystem-safe session id from a date plus a random suffix.
 * @param {Date} now
 * @param {string} [rand] - 4 chars; passed in so tests are deterministic
 */
export function sessionId(now, rand) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  const r = rand || Math.random().toString(36).slice(2, 6);
  return now.getUTCFullYear() + p(now.getUTCMonth() + 1) + p(now.getUTCDate())
    + '-' + p(now.getUTCHours()) + p(now.getUTCMinutes()) + p(now.getUTCSeconds()) + '-' + r;
}

/**
 * The folder for one session: /universe-chat/<doc-slug>/<session-id>
 * @returns {string}
 */
export function sessionFolder(slug, id) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('bad slug: ' + slug);
  if (!/^[A-Za-z0-9-]+$/.test(id)) throw new Error('bad session id: ' + id);
  return '/' + VAULT_ROOT + '/' + slug + '/' + id;
}

/** djb2 over a string — cheap change detection, not integrity. */
export function contentHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36) + ':' + s.length;
}

/**
 * Decide which files need writing: name → content for every entry whose hash
 * moved since the last save. Returns the writes and the new hash record.
 * @param {Record<string, string>} files - name → serialized content
 * @param {Record<string, string>} lastHashes - name → contentHash from the previous save
 * @returns {{writes: Record<string, string>, hashes: Record<string, string>}}
 */
export function changedFiles(files, lastHashes) {
  const writes = {}, hashes = {};
  for (const name of Object.keys(files)) {
    const h = contentHash(files[name]);
    hashes[name] = h;
    if (lastHashes[name] !== h) writes[name] = files[name];
  }
  return { writes, hashes };
}

/**
 * Serialize one session's state into its files. Pure assembly: the chat
 * passes what it has, absent parts are simply not written.
 * @param {{meta?: object, messages?: object, drafts?: object, trace?: string}} parts
 * @returns {Record<string, string>}
 */
export function sessionFiles(parts) {
  const out = {};
  if (parts.meta) out['session.json'] = JSON.stringify(parts.meta, null, 1) + '\n';
  if (parts.messages) out['messages.json'] = JSON.stringify(parts.messages, null, 1) + '\n';
  if (parts.drafts) {
    const d = parts.drafts;
    const n = (d.annotations || []).length + (d.crossrefs || []).length
      + ((d.scratch || {}).nodes || []).length + ((d.scratch || {}).edges || []).length;
    if (n > 0) out['drafts.json'] = JSON.stringify(d, null, 1) + '\n';
  }
  if (parts.trace && parts.trace.trim()) out['trace.txt'] = parts.trace;
  return out;
}

/** A safe file name for a model-authored document inside the session folder. */
export function documentName(name) {
  const clean = String(name || '').trim().replace(/[^\w.-]+/g, '-')
    .replace(/-+\./g, '.').replace(/^[-.]+|[-.]+$/g, '');
  if (!clean) throw new Error('the document needs a usable name');
  return /\.[A-Za-z0-9]{1,8}$/.test(clean) ? clean : clean + '.md';
}
