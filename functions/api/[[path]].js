/**
 * API webu Ing. arch. Nadi Francové, Ph.D.
 * Běží jako Cloudflare Pages Function na adresách /api/*.
 * Data: D1 databáze s bindingem "DB" (tabulky posts, images, settings, login_attempts).
 *
 *   POST   /api/login            přihlášení {user, pass}
 *   POST   /api/logout           odhlášení
 *   GET    /api/me               kdo je přihlášený
 *   POST   /api/password         změna hesla {current, next}
 *   GET    /api/posts            seznam článků (?limit=6, ?all=1 pro admina vč. konceptů)
 *   GET    /api/posts/:id        jeden článek (id nebo slug)
 *   POST   /api/posts            nový článek
 *   PUT    /api/posts/:id        úprava článku
 *   DELETE /api/posts/:id        smazání článku
 *   POST   /api/images           nahrání obrázku (multipart, pole "file")
 *   GET    /api/images/:id       zobrazení obrázku
 */

const COOKIE = 'nf_session';
const SESSION_DAYS = 7;
const MAX_IMAGE_BYTES = 1_900_000; // D1 drží max. 2 MB na hodnotu
const IMAGE_TYPES = { 'image/jpeg': 1, 'image/png': 1, 'image/webp': 1, 'image/gif': 1 };
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY, slug TEXT UNIQUE, title TEXT NOT NULL, date TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '', cover TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    thumb TEXT NOT NULL DEFAULT '')`,
  `CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(published, date DESC)`,
  `CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY, mime TEXT NOT NULL, size INTEGER NOT NULL, width INTEGER, height INTEGER,
    name TEXT, data BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT NOT NULL, at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts(ip, at)`,
  `CREATE TABLE IF NOT EXISTS tracker_projects (
    id TEXT PRIMARY KEY, data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
];

const OLD_TRACKER_URL = 'https://project-tracker-esni.onrender.com/api/projects';

let ready = false;

export async function onRequest(context) {
  const { request, env, params } = context;
  if (!env.DB) {
    return json({ error: 'Chybí propojení s databází (binding "DB"). Viz README.' }, 500);
  }
  try {
    await ensureReady(env, request);
    const parts = (params.path || []).filter(Boolean);
    const method = request.method.toUpperCase();

    // Ochrana proti CSRF: zápisy musí přijít z našeho JS (vlastní hlavička vynutí same-origin).
    if (method !== 'GET' && method !== 'HEAD' && request.headers.get('X-Requested-With') !== 'fetch') {
      return json({ error: 'Neplatný požadavek.' }, 403);
    }

    const [res, id] = parts;
    if (res === 'login' && method === 'POST') return login(request, env);
    if (res === 'logout' && method === 'POST') return logout();
    if (res === 'me' && method === 'GET') return me(request, env);
    if (res === 'password' && method === 'POST') return changePassword(request, env);

    if (res === 'posts') {
      if (!id && method === 'GET') return listPosts(request, env);
      if (!id && method === 'POST') return savePost(request, env, null);
      if (id && method === 'GET') return getPost(request, env, id);
      if (id && method === 'PUT') return savePost(request, env, id);
      if (id && method === 'DELETE') return deletePost(request, env, id);
    }

    if (res === 'images') {
      if (!id && method === 'POST') return uploadImage(request, env);
      if (id && (method === 'GET' || method === 'HEAD')) return serveImage(context, id);
    }

    // Project Tracker: /api/tracker/projects[/:id], /api/tracker/import
    if (res === 'tracker') {
      const [, sub, pid] = parts;
      if (sub === 'import' && method === 'POST') return importTracker(request, env);
      if (sub === 'projects') {
        if (!pid && method === 'GET') return listProjects(request, env);
        if (!pid && method === 'POST') return createProject(request, env);
        if (pid && method === 'GET') return getProject(env, pid);
        if (pid && method === 'PUT') return updateProject(request, env, pid);
        if (pid && method === 'DELETE') return deleteProject(request, env, pid);
      }
    }

    return json({ error: 'Nenalezeno.' }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: 'Chyba serveru: ' + (err && err.message ? err.message : String(err)) }, 500);
  }
}

/* ---------------------------------------------------------------- setup */

async function ensureReady(env, request) {
  if (ready) return;
  await env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s)));
  // Starší databáze nemusí mít sloupec thumb.
  try { await env.DB.prepare(`ALTER TABLE posts ADD COLUMN thumb TEXT NOT NULL DEFAULT ''`).run(); } catch (_) {}

  const seeded = await env.DB.prepare(`SELECT value FROM settings WHERE key='seeded'`).first();
  if (!seeded) {
    const count = await env.DB.prepare(`SELECT COUNT(*) AS n FROM posts`).first();
    if (count.n === 0 && env.ASSETS) {
      const r = await env.ASSETS.fetch(new URL('/data/seed-posts.json', request.url));
      if (r.ok) {
        const posts = await r.json();
        const stmts = posts.map((p) =>
          env.DB.prepare(
            `INSERT OR IGNORE INTO posts (id, slug, title, date, excerpt, cover, content, published, thumb)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
          ).bind(p.id, p.slug, p.title, p.date, p.excerpt || '', p.cover || '', p.content || '', p.cover || firstImage(p.content))
        );
        if (stmts.length) await env.DB.batch(stmts);
      }
    }
    await env.DB.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded', '1')`).run();
  }
  ready = true;
}

/* ---------------------------------------------------------------- helpers */

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

async function readJson(request) {
  try { return await request.json(); } catch (_) { return null; }
}

const enc = new TextEncoder();

function b64url(bytes) {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function getSetting(env, key) {
  const row = await env.DB.prepare(`SELECT value FROM settings WHERE key=?`).bind(key).first();
  return row ? row.value : null;
}
async function setSetting(env, key, value) {
  await env.DB.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).bind(key, value).run();
}

async function sessionKey(env) {
  let secret = await getSetting(env, 'session_secret');
  if (!secret) {
    secret = b64url(crypto.getRandomValues(new Uint8Array(32)));
    await setSetting(env, 'session_secret', secret);
  }
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function hashPassword(password, saltBytes, iterations = 100000) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations }, key, 256);
  return new Uint8Array(bits);
}

async function verifyPassword(password, stored) {
  if (!stored) return false;
  const [scheme, iter, salt, hash] = stored.split('$');
  if (scheme !== 'pbkdf2') return false;
  const got = await hashPassword(password, Uint8Array.from(atob(salt), (c) => c.charCodeAt(0)), Number(iter));
  const want = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
  return safeEqual(got, want);
}

async function makePasswordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);
  const toB64 = (u) => btoa(String.fromCharCode(...u));
  return `pbkdf2$100000$${toB64(salt)}$${toB64(hash)}`;
}

async function createSession(env, user) {
  const payload = b64url(enc.encode(JSON.stringify({ u: user, exp: Date.now() + SESSION_DAYS * 86400000 })));
  const sig = await crypto.subtle.sign('HMAC', await sessionKey(env), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

async function currentUser(request, env) {
  const token = getCookie(request, COOKIE);
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  try {
    const ok = await crypto.subtle.verify('HMAC', await sessionKey(env), fromB64(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64(payload)));
    if (!data.exp || data.exp < Date.now()) return null;
    return data.u;
  } catch (_) {
    return null;
  }
}

function sessionCookie(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function firstImage(html) {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || '');
  return m ? m[1] : '';
}

function stripTags(html) {
  return (html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeExcerpt(html, max = 170) {
  const text = stripTags(html);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : max).replace(/[\s,;:.–-]+$/, '') + '…';
}

function slugify(s) {
  return (s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 70)
    .replace(/-+$/, '') || 'clanek';
}

/** Odstraní ze HTML skripty, obsluhy událostí a javascript: odkazy. */
async function sanitize(html) {
  const allowedIframe = /^https:\/\/(www\.youtube(-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/|www\.google\.com\/maps\/embed)/;
  const rewriter = new HTMLRewriter()
    .on('script, style, object, embed, form, input, button, textarea, select, link, meta, base', {
      element(el) { el.remove(); },
    })
    .on('iframe', {
      element(el) { if (!allowedIframe.test(el.getAttribute('src') || '')) el.remove(); },
    })
    .on('*', {
      element(el) {
        const attrs = [...el.attributes];
        for (const [name, value] of attrs) {
          const n = name.toLowerCase();
          if (n.startsWith('on')) el.removeAttribute(name);
          else if ((n === 'href' || n === 'src' || n === 'xlink:href') && /^\s*(javascript|vbscript|data:text)/i.test(value)) {
            el.removeAttribute(name);
          }
        }
      },
    });
  const out = rewriter.transform(new Response(html || '', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
  return (await out.text()).trim();
}

function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'local';
}

async function requireUser(request, env) {
  const user = await currentUser(request, env);
  if (!user) throw new HttpError(401, 'Nejste přihlášeni.');
  return user;
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function wrap(fn) {
  return async (...args) => {
    try { return await fn(...args); } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      throw e;
    }
  };
}

/* ---------------------------------------------------------------- auth */

const login = wrap(async (request, env) => {
  const ip = clientIp(request);
  const now = Date.now();
  await env.DB.prepare(`DELETE FROM login_attempts WHERE at < ?`).bind(now - LOGIN_WINDOW_MS).run();
  const tries = await env.DB.prepare(`SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ?`).bind(ip).first();
  if (tries.n >= LOGIN_MAX_ATTEMPTS) {
    return json({ error: 'Příliš mnoho pokusů. Zkuste to znovu za 15 minut.' }, 429);
  }

  const body = (await readJson(request)) || {};
  const user = String(body.user || '').trim().toLowerCase();
  const pass = String(body.pass || '');
  const storedUser = (await getSetting(env, 'admin_user')) || 'francova';
  const storedHash = await getSetting(env, 'admin_hash');

  const passOk = await verifyPassword(pass, storedHash);
  if (user !== storedUser || !passOk) {
    await env.DB.prepare(`INSERT INTO login_attempts (ip, at) VALUES (?, ?)`).bind(ip, now).run();
    return json({ error: storedHash ? 'Špatné jméno nebo heslo.' : 'Heslo zatím není nastavené (viz README).' }, 401);
  }

  await env.DB.prepare(`DELETE FROM login_attempts WHERE ip = ?`).bind(ip).run();
  const token = await createSession(env, storedUser);
  return json({ user: storedUser }, 200, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) });
});

function logout() {
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
}

const me = wrap(async (request, env) => {
  const user = await requireUser(request, env);
  return json({ user });
});

const changePassword = wrap(async (request, env) => {
  await requireUser(request, env);
  const body = (await readJson(request)) || {};
  const current = String(body.current || '');
  const next = String(body.next || '');
  if (!(await verifyPassword(current, await getSetting(env, 'admin_hash')))) {
    throw new HttpError(400, 'Současné heslo nesouhlasí.');
  }
  if (next.length < 10) throw new HttpError(400, 'Nové heslo musí mít alespoň 10 znaků.');
  await setSetting(env, 'admin_hash', await makePasswordHash(next));
  // Nový tajný klíč = všechna ostatní přihlášení přestanou platit.
  await setSetting(env, 'session_secret', b64url(crypto.getRandomValues(new Uint8Array(32))));
  const token = await createSession(env, (await getSetting(env, 'admin_user')) || 'francova');
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) });
});

/* ---------------------------------------------------------------- posts */

const listPosts = wrap(async (request, env) => {
  const url = new URL(request.url);
  const wantAll = url.searchParams.get('all') === '1';
  const isAdmin = wantAll ? !!(await currentUser(request, env)) : false;
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '200', 10) || 200, 1), 500);

  const where = isAdmin ? '' : 'WHERE published = 1';
  const { results } = await env.DB.prepare(
    `SELECT id, slug, title, date, excerpt, cover, thumb, published, updated_at
     FROM posts ${where} ORDER BY date DESC, id DESC LIMIT ?`
  ).bind(limit).all();

  return json({ posts: results.map((p) => ({ ...p, published: !!p.published })) });
});

async function findPost(env, idOrSlug) {
  return env.DB.prepare(`SELECT * FROM posts WHERE id = ? OR slug = ?`).bind(idOrSlug, idOrSlug).first();
}

const getPost = wrap(async (request, env, id) => {
  const post = await findPost(env, id);
  if (!post) throw new HttpError(404, 'Článek nenalezen.');
  if (!post.published && !(await currentUser(request, env))) throw new HttpError(404, 'Článek nenalezen.');
  return json({ post: { ...post, published: !!post.published } });
});

async function uniqueSlug(env, base, ownId) {
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const row = await env.DB.prepare(`SELECT id FROM posts WHERE slug = ?`).bind(slug).first();
    if (!row || row.id === ownId) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

async function newId(env, date) {
  const prefix = date.replace(/-/g, '');
  const { results } = await env.DB.prepare(`SELECT id FROM posts WHERE id LIKE ?`).bind(prefix + '%').all();
  let n = 1;
  for (const r of results) {
    const tail = parseInt(String(r.id).slice(prefix.length), 10);
    if (!isNaN(tail) && tail >= n) n = tail + 1;
  }
  return prefix + String(n).padStart(2, '0');
}

const savePost = wrap(async (request, env, id) => {
  await requireUser(request, env);
  const body = await readJson(request);
  if (!body) throw new HttpError(400, 'Chybí data článku.');

  const title = String(body.title || '').trim();
  const date = String(body.date || '').trim();
  if (!title) throw new HttpError(400, 'Článek musí mít název.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(400, 'Neplatné datum.');

  const content = await sanitize(String(body.content || ''));
  const cover = String(body.cover || '').trim();
  if (cover && !/^(\/|https:\/\/)/.test(cover)) throw new HttpError(400, 'Neplatná adresa úvodního obrázku.');
  const excerpt = String(body.excerpt || '').trim() || makeExcerpt(content);
  const published = body.published === false ? 0 : 1;
  const thumb = cover || firstImage(content);

  let post;
  if (id) {
    const existing = await findPost(env, id);
    if (!existing) throw new HttpError(404, 'Článek nenalezen.');
    // Ochrana proti přepsání novější verze (např. otevřeno ve dvou oknech).
    if (body.updated_at && body.updated_at !== existing.updated_at && !body.force) {
      throw new HttpError(409, 'Článek mezitím někdo změnil (jiné okno nebo zařízení). Obnovte stránku, nebo uložte znovu a přepište ho.');
    }
    const slug = await uniqueSlug(env, slugify(title), existing.id);
    await env.DB.prepare(
      `UPDATE posts SET slug=?, title=?, date=?, excerpt=?, cover=?, content=?, published=?, thumb=?,
       updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?`
    ).bind(slug, title, date, excerpt, cover, content, published, thumb, existing.id).run();
    post = await findPost(env, existing.id);
  } else {
    const newPostId = await newId(env, date);
    const slug = await uniqueSlug(env, slugify(title), null);
    await env.DB.prepare(
      `INSERT INTO posts (id, slug, title, date, excerpt, cover, content, published, thumb) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(newPostId, slug, title, date, excerpt, cover, content, published, thumb).run();
    post = await findPost(env, newPostId);
  }

  await cleanupImages(env);
  return json({ post: { ...post, published: !!post.published } }, id ? 200 : 201);
});

const deletePost = wrap(async (request, env, id) => {
  await requireUser(request, env);
  const existing = await findPost(env, id);
  if (!existing) throw new HttpError(404, 'Článek nenalezen.');
  await env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(existing.id).run();
  await cleanupImages(env, true);
  return json({ ok: true });
});

/** Smaže obrázky, které nepoužívá žádný článek. Čerstvě nahrané nechá (článek ještě nemusí být uložený). */
async function cleanupImages(env, includeRecent = false) {
  const cutoff = new Date(Date.now() - (includeRecent ? 10 * 60 * 1000 : 6 * 3600 * 1000)).toISOString();
  await env.DB.prepare(
    `DELETE FROM images WHERE created_at < ? AND NOT EXISTS (
       SELECT 1 FROM posts p WHERE instr(p.content, images.id) > 0 OR instr(p.cover, images.id) > 0)`
  ).bind(cutoff).run();
}

/* ---------------------------------------------------------------- images */

const uploadImage = wrap(async (request, env) => {
  await requireUser(request, env);
  let form;
  try { form = await request.formData(); } catch (_) { throw new HttpError(400, 'Chybí soubor.'); }
  const file = form.get('file');
  if (!file || typeof file === 'string') throw new HttpError(400, 'Chybí soubor.');
  if (!IMAGE_TYPES[file.type]) throw new HttpError(400, 'Podporované formáty jsou JPG, PNG, WebP a GIF.');
  if (file.size > MAX_IMAGE_BYTES) {
    throw new HttpError(413, 'Obrázek je po zmenšení pořád větší než 1,9 MB. Zkuste menší soubor.');
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const id = crypto.randomUUID().replace(/-/g, '');
  const width = parseInt(form.get('width'), 10) || null;
  const height = parseInt(form.get('height'), 10) || null;
  const name = String(file.name || '').slice(0, 200);

  await env.DB.prepare(`INSERT INTO images (id, mime, size, width, height, name, data) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, file.type, data.byteLength, width, height, name, data).run();

  return json({ id, url: `/api/images/${id}`, location: `/api/images/${id}` }, 201);
});

async function serveImage(context, id) {
  const { request, env } = context;
  if (!/^[a-f0-9]{32}$/.test(id)) return new Response('Nenalezeno', { status: 404 });

  const cache = caches.default;
  const cacheKey = new Request(new URL(`/api/images/${id}`, request.url).toString());
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const row = await env.DB.prepare(`SELECT mime, data FROM images WHERE id = ?`).bind(id).first();
  if (!row) return new Response('Nenalezeno', { status: 404 });

  const bytes = row.data instanceof ArrayBuffer ? new Uint8Array(row.data) : new Uint8Array(row.data);
  const res = new Response(bytes, {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': `"${id}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
  context.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}

/* ---------------------------------------------------------------- project tracker */

function trackerItem(name) {
  return {
    id: crypto.randomUUID(), name, notes: '', status: 'TODO',
    completedAt: null, submittedAt: null, isPaused: false, pausedAt: null, pausedMs: 0,
  };
}

function trackerSection(name, items) {
  return { name, startDate: null, items: items.map(trackerItem) };
}

function cleanProject(p) {
  const { _id, __v, ...rest } = p || {};
  return rest;
}

const listProjects = wrap(async (request, env) => {
  await requireUser(request, env);
  const { results } = await env.DB.prepare(`SELECT data FROM tracker_projects ORDER BY created_at`).all();
  return json(results.map((r) => JSON.parse(r.data)));
});

// Veřejné: odkaz pro klienta (/project/:id) zobrazuje projekt jen pro čtení.
const getProject = wrap(async (env, id) => {
  const row = await env.DB.prepare(`SELECT data FROM tracker_projects WHERE id = ?`).bind(id).first();
  if (!row) throw new HttpError(404, 'Projekt nenalezen');
  return json(JSON.parse(row.data));
});

const createProject = wrap(async (request, env) => {
  await requireUser(request, env);
  const body = (await readJson(request)) || {};
  const name = String(body.name || '').trim();
  if (!name) throw new HttpError(400, 'Zadejte název projektu.');
  const id = b64url(crypto.getRandomValues(new Uint8Array(6))).replace(/[-_]/g, 'x').slice(0, 8).toLowerCase();
  const project = {
    id, name, startDate: String(body.startDate || ''), rozbor: '', projectCompletedAt: null,
    category: 'active', overenaDokumentaceText: '', overenaDokumentaceUrl: '',
    sections: [
      trackerSection('Projektování', ['Stavební část', 'Statika', 'PBŘ', 'Profese']),
      trackerSection('Stanoviska', ['JES', 'OPP', 'HS', 'HG']),
      trackerSection('Schvalování', ['Podání', 'Řízení', 'Povolení', 'Nabytí PM']),
    ],
  };
  await env.DB.prepare(`INSERT INTO tracker_projects (id, data) VALUES (?, ?)`).bind(id, JSON.stringify(project)).run();
  return json(project, 201);
});

const updateProject = wrap(async (request, env, id) => {
  await requireUser(request, env);
  const body = await readJson(request);
  if (!body || typeof body !== 'object') throw new HttpError(400, 'Chybí data projektu.');
  const project = { ...cleanProject(body), id };
  const r = await env.DB.prepare(
    `UPDATE tracker_projects SET data = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
  ).bind(JSON.stringify(project), id).run();
  if (!r.meta.changes) throw new HttpError(404, 'Projekt nenalezen');
  return json(project);
});

const deleteProject = wrap(async (request, env, id) => {
  await requireUser(request, env);
  const r = await env.DB.prepare(`DELETE FROM tracker_projects WHERE id = ?`).bind(id).run();
  if (!r.meta.changes) throw new HttpError(404, 'Projekt nenalezen');
  return json({ success: true, message: 'Projekt smazán' });
});

/** Jednorázové převzetí projektů z původního trackeru na Renderu (MongoDB). */
const importTracker = wrap(async (request, env) => {
  await requireUser(request, env);
  let res;
  try {
    res = await fetch(OLD_TRACKER_URL, { headers: { Accept: 'application/json' } });
  } catch (e) {
    throw new HttpError(502, 'Původní tracker neodpovídá. Zkuste to za minutu znovu (Render se probouzí).');
  }
  if (!res.ok) throw new HttpError(502, `Původní tracker vrátil chybu ${res.status}. Zkuste to za minutu znovu.`);
  const list = await res.json().catch(() => null);
  if (!Array.isArray(list)) throw new HttpError(502, 'Původní tracker nevrátil seznam projektů.');

  const stmts = list
    .filter((p) => p && p.id)
    .map((p) => env.DB.prepare(
      `INSERT INTO tracker_projects (id, data) VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')`
    ).bind(String(p.id), JSON.stringify(cleanProject(p))));
  if (stmts.length) await env.DB.batch(stmts);
  return json({ imported: stmts.length });
});
