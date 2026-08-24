/* @module universe-chat/vault
   Single responsibility: the chat's vault persistence, over the family's
   published vault modules (tools.sgraph.ai, pinned versions). The chat hands
   this module a pasted vault key; every session becomes a folder of files
   under /universe-chat/<doc-slug>/<session-id>/, committed and pushed to the
   SG/Send API — zero-knowledge, encrypted in this browser before anything
   leaves it, exactly the CLI's format, so an sgit clone elsewhere (a human,
   an agent, a cloud session) reads what the chat wrote.

   The pure logic (key parsing, session naming, change detection) lives in
   vault-core.js under gate 27; this module is the thin binding. */
'use strict';
import { deriveWriteKeys, deriveWriteKeysFromSimpleToken }
  from 'https://tools.sgraph.ai/core/vault-write/v1/v1.1/v1.1.1/sg-vault-write.js';
import { createSession }
  from 'https://tools.sgraph.ai/core/vault-session/v1/v1.0/v1.0.0/sg-vault-session.js';
import { addFile, updateFile, createFolder }
  from 'https://tools.sgraph.ai/core/vault-mutations/v1/v1.0/v1.0.0/sg-vault-mutations.js';
import { parseVaultKey, sessionFolder, changedFiles, sessionFiles, documentName, VAULT_ROOT,
  personaFolder, personaSlug, viewsFolder, appendFeedback, PERSONAS_ROOT }
  from './vault-core.js';

export const DEFAULT_ENDPOINT = 'https://send.sgraph.ai';

export class ChatVault {
  constructor() {
    this.session = null;
    this.vaultId = null;
    this._hashes = {};       /* per session-folder file hashes from the last save */
    this._folders = new Set();
    this._saving = null;
  }

  get connected() { return !!this.session; }

  /**
   * Derive keys from the pasted vault key and open the session.
   * @param {string} rawKey - "passphrase:vaultId" or a Simple Token
   * @param {{endpoint?: string, accessToken?: string}} [opts] - the server
   *   endpoint and, where the server requires one, its access token (the
   *   "access key" — distinct from the vault key, which never leaves the
   *   browser un-derived)
   */
  async connect(rawKey, opts = {}) {
    const parsed = parseVaultKey(rawKey);
    const keys = parsed.kind === 'token'
      ? await deriveWriteKeysFromSimpleToken(parsed.token)
      : await deriveWriteKeys(parsed.passphrase, parsed.vaultId);
    const session = createSession({
      apiBaseUrl: (opts.endpoint || DEFAULT_ENDPOINT).replace(/\/$/, ''),
      vaultId: keys.vaultId,
      keys,
      accessToken: opts.accessToken || undefined,
      branchName: 'universe-chat',
    });
    await session.open();
    this.session = session;
    this.vaultId = keys.vaultId;
    this._hashes = {};
    this._folders = new Set();
    return { vaultId: keys.vaultId };
  }

  disconnect() { this.session = null; this.vaultId = null; this._hashes = {}; }

  /** Create each missing segment of a folder path, tolerating existing ones. */
  async _ensurePath(path) {
    if (this._folders.has(path)) return;
    const parts = path.split('/').filter(Boolean);
    let at = '/';
    for (const part of parts) {
      const next = at === '/' ? '/' + part : at + '/' + part;
      if (!this._folders.has(next)) {
        try { await this.session.loadSubTree(next); }
        catch (e) { /* not loadable — may not exist yet */ }
        if (!this.session.treeModel.getNode(next)) {
          try { await createFolder(this.session, at, part, { message: 'chat: ' + next }); }
          catch (e) { if (!/exists/i.test(e.message)) throw e; }
        }
        this._folders.add(next);
      }
      at = next;
    }
  }

  async _writeFile(folder, name, content) {
    const node = this.session.treeModel.getNode(folder + '/' + name);
    if (node) await updateFile(this.session, folder, name, content, { message: 'chat: update ' + name });
    else await addFile(this.session, folder, name, content, { message: 'chat: add ' + name });
  }

  /**
   * Save one session's current state: only the files whose content moved are
   * written, one commit per file, one push per save. Serialized: overlapping
   * calls queue behind the running one.
   * @param {string} slug
   * @param {string} sid
   * @param {{meta?, messages?, drafts?, trace?}} parts
   * @returns {Promise<{written: string[]}>}
   */
  async save(slug, sid, parts) {
    while (this._saving) await this._saving.catch(() => {});
    const run = (async () => {
      const folder = sessionFolder(slug, sid);
      const { writes, hashes } = changedFiles(sessionFiles(parts), this._hashes[folder] || {});
      const names = Object.keys(writes);
      if (!names.length) return { written: [] };
      await this._ensurePath(folder);
      for (const name of names) await this._writeFile(folder, name, writes[name]);
      await this.session.push();
      this._hashes[folder] = Object.assign({}, this._hashes[folder], hashes);
      return { written: names };
    })();
    this._saving = run;
    try { return await run; } finally { this._saving = null; }
  }

  /**
   * Write one file into a subfolder of the session (documents/, voice-notes/,
   * images/ …). Content may be a string or a Uint8Array.
   */
  async saveFile(slug, sid, subfolder, name, content) {
    if (!/^[a-z-]+$/.test(subfolder)) throw new Error('bad subfolder: ' + subfolder);
    const folder = sessionFolder(slug, sid) + '/' + subfolder;
    const file = documentName(name);
    await this._ensurePath(folder);
    await this._writeFile(folder, file, content instanceof Uint8Array ? content : String(content));
    await this.session.push();
    return { path: folder + '/' + file };
  }

  /** Write one model-authored document into the session's documents/ folder. */
  saveDocument(slug, sid, name, content) {
    return this.saveFile(slug, sid, 'documents', name, content);
  }

  /** The saved sessions for one document, newest first. */
  async listSessions(slug) {
    const base = '/' + VAULT_ROOT + '/' + slug;
    try { await this.session.loadSubTree('/' + VAULT_ROOT); await this.session.loadSubTree(base); }
    catch (e) { return []; }
    const node = this.session.treeModel.getNode(base);
    if (!node || !node.children) return [];
    return Object.keys(node.children)
      .filter((k) => node.children[k] && node.children[k].type !== 'file')
      .sort().reverse();
  }

  /** Read one file's text, or null when it does not exist. */
  async _read(path) {
    const folder = path.slice(0, path.lastIndexOf('/')) || '/';
    try { await this.session.loadSubTree(folder); } catch (e) { return null; }
    const node = this.session.treeModel.getNode(path);
    if (!node || !node.blob_id) return null;
    const bytes = await this.session.getFile(node.blob_id);
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  /** Load one session's messages (and drafts, if saved) back out of the vault. */
  async loadSession(slug, sid) {
    const folder = sessionFolder(slug, sid);
    const messages = await this._read(folder + '/messages.json');
    if (!messages) throw new Error('that session has no messages.json');
    const drafts = await this._read(folder + '/drafts.json');
    return { messages: JSON.parse(messages), drafts: drafts ? JSON.parse(drafts) : null };
  }

  /* ---- personas: reading angles any key holder can author ------------------ */

  /** The personas in the vault, each read from its persona.json. */
  async listPersonas() {
    const base = '/' + PERSONAS_ROOT;
    try { await this.session.loadSubTree(base); } catch (e) { return []; }
    const node = this.session.treeModel.getNode(base);
    if (!node || !node.children) return [];
    const out = [];
    for (const k of Object.keys(node.children).sort()) {
      if (node.children[k] && node.children[k].type === 'file') continue;
      try {
        const raw = await this._read(personaFolder(k) + '/persona.json');
        if (raw) out.push({ slug: k, ...JSON.parse(raw) });
      } catch (e) { out.push({ slug: k, name: k, prompt: '', broken: e.message }); }
    }
    return out;
  }

  /** Create or update one persona's persona.json. Returns its slug. */
  async savePersona(name, prompt, extra = {}) {
    const slug = personaSlug(name);
    const folder = personaFolder(slug);
    const existing = await this._read(folder + '/persona.json');
    const prev = existing ? JSON.parse(existing) : {};
    const body = JSON.stringify({ ...prev, name, prompt, ...extra,
      updated: new Date().toISOString(),
      created: prev.created || new Date().toISOString() }, null, 1) + '\n';
    await this._ensurePath(folder);
    await this._writeFile(folder, 'persona.json', body);
    await this.session.push();
    return slug;
  }

  /** Save one persona-targeted view of a document. */
  async saveView(pslug, docSlug, name, content) {
    const folder = viewsFolder(pslug, docSlug);
    const file = documentName(name);
    await this._ensurePath(folder);
    await this._writeFile(folder, file, String(content));
    await this.session.push();
    return { path: folder + '/' + file, view: file };
  }

  /** The saved views of one document for one persona. */
  async listViews(pslug, docSlug) {
    const folder = viewsFolder(pslug, docSlug);
    try { await this.session.loadSubTree(folder); } catch (e) { return []; }
    const node = this.session.treeModel.getNode(folder);
    if (!node || !node.children) return [];
    return Object.keys(node.children).sort()
      .filter((k) => k !== 'feedback.json' && !k.endsWith('.feedback.json'));
  }

  /** File one feedback entry beside a view: <view>.feedback.json. */
  async recordFeedback(pslug, docSlug, viewName, entry) {
    const folder = viewsFolder(pslug, docSlug);
    const view = documentName(viewName);
    const fname = view + '.feedback.json';
    const existing = await this._read(folder + '/' + fname);
    const body = appendFeedback(existing, entry);
    await this._ensurePath(folder);
    await this._writeFile(folder, fname, body);
    await this.session.push();
    return { path: folder + '/' + fname, entries: JSON.parse(body).entries.length };
  }
}
