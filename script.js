// Veřejná část webu: výpis článků a zobrazení jednoho článku.
// Data se načítají z /api/posts (Cloudflare Pages Function + D1).

const MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const PLACEHOLDER_IMG = 'nahled.png';

function formatDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return iso || '';
    return `${parseInt(m[3], 10)}. ${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function api(path) {
    const res = await fetch(path, { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const err = new Error(data.error || `Chyba ${res.status}`);
        err.status = res.status;
        throw err;
    }
    return data;
}

function postUrl(post) {
    return `clanek.html?id=${encodeURIComponent(post.id)}`;
}

function cardHtml(post) {
    const url = postUrl(post);
    const img = post.thumb
        ? `<img src="${escapeHtml(post.thumb)}" class="blog-card-img" alt="" loading="lazy">`
        : `<img src="${PLACEHOLDER_IMG}" class="blog-card-img is-placeholder" alt="" loading="lazy">`;
    return `
        <article class="post-card">
            <a href="${url}" tabindex="-1" aria-hidden="true">${img}</a>
            <div class="post-card-content">
                <div class="blog-category"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></div>
                <h3><a href="${url}">${escapeHtml(post.title)}</a></h3>
                <p>${escapeHtml(post.excerpt)}</p>
            </div>
        </article>`;
}

async function renderBlogGrid() {
    const container = document.getElementById('dynamic-blog-grid');
    if (!container) return;

    const limit = parseInt(container.dataset.limit || '0', 10);
    container.className = 'three-col-grid';
    container.innerHTML = '<p class="blog-status">Načítám články…</p>';

    try {
        const { posts } = await api('/api/posts' + (limit ? `?limit=${limit + 1}` : ''));
        if (!posts.length) {
            container.innerHTML = '<p class="blog-status">Zatím nejsou publikovány žádné články.</p>';
            return;
        }
        const shown = limit ? posts.slice(0, limit) : posts;
        container.innerHTML = shown.map(cardHtml).join('');

        const more = document.getElementById('blog-more');
        if (more) more.hidden = !(limit && posts.length > limit);
    } catch (err) {
        container.innerHTML = '<p class="blog-status">Články se nepodařilo načíst. Zkuste stránku obnovit.</p>';
        console.error(err);
    }
}

function wrapTables(root) {
    root.querySelectorAll('table').forEach((t) => {
        if (t.parentElement.classList.contains('table-wrap')) return;
        const w = document.createElement('div');
        w.className = 'table-wrap';
        t.parentNode.insertBefore(w, t);
        w.appendChild(t);
    });
}

function setMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

async function renderSingleArticle() {
    const container = document.getElementById('dynamic-article');
    if (!container) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const back = '<a href="blog.html" class="back-link">← Zpět na blog</a>';

    if (!id) {
        container.innerHTML = `${back}<h1>Článek nenalezen</h1><p>Odkaz neobsahuje žádný článek.</p>`;
        return;
    }

    container.innerHTML = '<p class="blog-status" style="text-align:left">Otevírám článek…</p>';

    try {
        const { post } = await api(`/api/posts/${encodeURIComponent(id)}`);
        document.title = `${post.title} | Ing. arch. Naďa Francová, Ph.D.`;
        setMeta('description', post.excerpt || '');

        const cover = post.cover ? `<img src="${escapeHtml(post.cover)}" alt="" class="article-cover">` : '';
        const draft = post.published ? '' : ' · <strong>koncept (vidíte jen vy)</strong>';
        container.innerHTML = `
            ${back}
            <h1>${escapeHtml(post.title)}</h1>
            <div class="meta">Naďa Francová · <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>${draft}</div>
            ${cover}
            <div class="article-body">${post.content}</div>
        `;
        wrapTables(container);
    } catch (err) {
        container.innerHTML = err.status === 404
            ? `${back}<h1>Článek nenalezen</h1><p>Tento článek neexistuje nebo byl stažen.</p>`
            : `${back}<h1>Článek se nepodařilo načíst</h1><p>Zkuste stránku obnovit.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderBlogGrid();
    renderSingleArticle();
});
