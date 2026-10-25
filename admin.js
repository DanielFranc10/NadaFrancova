// Administrace webu: přihlášení, správa článků (přidat / upravit / smazat), obrázky, Project Tracker.

const MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
const TRACKER_URL = '/tracker/';
const MAX_IMAGE_SIDE = 1920;
const MAX_UPLOAD_BYTES = 1_800_000;
const TINYMCE_LANG = 'https://cdn.jsdelivr.net/npm/tinymce-i18n@26.10.19/langs7/cs.js';

const $ = (id) => document.getElementById(id);

const state = {
    user: null,
    posts: [],
    editing: null,      // { id, updated_at } | null pro nový článek
    cover: '',
    dirty: false,
    saving: false,
    lastHash: '',
    editor: null,
    editorReady: null,
};

/* ------------------------------------------------------------ pomocné */

function formatDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? `${parseInt(m[3], 10)}. ${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}` : (iso || '');
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function today() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

let toastTimer;
function toast(message, isError = false) {
    const el = $('toast');
    el.textContent = message;
    el.classList.toggle('error', isError);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, isError ? 6000 : 3000);
}

async function api(path, { method = 'GET', body, form } = {}) {
    const opts = { method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
    if (method !== 'GET') opts.headers['X-Requested-With'] = 'fetch';
    if (form) opts.body = form;
    else if (body !== undefined) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    let res;
    try {
        res = await fetch(path, opts);
    } catch (_) {
        throw Object.assign(new Error('Nepodařilo se spojit se serverem. Zkontrolujte připojení k internetu.'), { status: 0 });
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/api/login' && path !== '/api/password') {
        showLogin();
        throw Object.assign(new Error('Přihlášení vypršelo. Přihlaste se prosím znovu.'), { status: 401 });
    }
    if (!res.ok) throw Object.assign(new Error(data.error || `Chyba ${res.status}`), { status: res.status });
    return data;
}

/* ------------------------------------------------------------ přihlášení */

function showLogin() {
    state.user = null;
    $('login-screen').hidden = false;
    $('admin-dashboard').hidden = true;
    $('admin-user-bar').hidden = true;
    setTimeout(() => $('admin-user').focus(), 50);
}

function showDashboard(user) {
    state.user = user;
    $('login-screen').hidden = true;
    $('admin-dashboard').hidden = false;
    $('admin-user-bar').hidden = false;
    $('admin-user-name').textContent = user;
    route();
}

async function checkSession() {
    try {
        const { user } = await api('/api/me');
        showDashboard(user);
    } catch (_) {
        showLogin();
    }
}

$('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('login-btn');
    $('login-error').textContent = '';
    btn.disabled = true;
    btn.textContent = 'Přihlašuji…';
    try {
        const { user } = await api('/api/login', {
            method: 'POST',
            body: { user: $('admin-user').value, pass: $('admin-pass').value },
        });
        $('admin-pass').value = '';
        showDashboard(user);
    } catch (err) {
        $('login-error').textContent = err.message;
    } finally {
        btn.disabled = false;
        btn.textContent = 'Přihlásit';
    }
});

$('btn-logout').addEventListener('click', async () => {
    if (state.dirty && !confirm('Máte neuložené změny. Opravdu se odhlásit?')) return;
    state.dirty = false;
    try { await api('/api/logout', { method: 'POST' }); } catch (_) {}
    location.hash = '';
    showLogin();
});

/* ------------------------------------------------------------ změna hesla */

$('btn-password').addEventListener('click', () => {
    $('password-form').reset();
    $('pw-error').textContent = '';
    $('password-dialog').showModal();
});
$('pw-cancel').addEventListener('click', () => $('password-dialog').close());
$('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const next = $('pw-next').value;
    if (next.length < 10) { $('pw-error').textContent = 'Nové heslo musí mít alespoň 10 znaků.'; return; }
    if (next !== $('pw-next2').value) { $('pw-error').textContent = 'Nová hesla se neshodují.'; return; }
    $('pw-submit').disabled = true;
    try {
        await api('/api/password', { method: 'POST', body: { current: $('pw-current').value, next } });
        $('password-dialog').close();
        toast('Heslo bylo změněno.');
    } catch (err) {
        $('pw-error').textContent = err.message;
    } finally {
        $('pw-submit').disabled = false;
    }
});

/* ------------------------------------------------------------ směrování */

function setTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active-tab', b.dataset.tab === tab));
}

function showView(id) {
    ['view-list', 'view-editor', 'view-tracker'].forEach((v) => { $(v).hidden = v !== id; });
}

function route() {
    if (!state.user) return;
    const hash = location.hash || '#/blog';

    // Odchod z editoru s neuloženými změnami
    if (state.dirty && state.lastHash.startsWith('#/blog/') && hash !== state.lastHash) {
        if (!confirm('Máte neuložené změny. Opravdu odejít bez uložení?')) {
            history.replaceState(null, '', state.lastHash);
            return;
        }
        state.dirty = false;
    }
    state.lastHash = hash;

    let m;
    if (hash === '#/tracker') {
        setTab('tracker');
        showView('view-tracker');
        const frame = $('tracker-frame');
        if (!frame.getAttribute('src')) frame.src = TRACKER_URL;
    } else if (hash === '#/blog/new') {
        setTab('blog');
        openEditor(null);
    } else if ((m = /^#\/blog\/edit\/(.+)$/.exec(hash))) {
        setTab('blog');
        openEditor(decodeURIComponent(m[1]));
    } else {
        setTab('blog');
        showView('view-list');
        loadList();
    }
}

window.addEventListener('hashchange', route);

window.addEventListener('beforeunload', (e) => {
    if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
});

/* ------------------------------------------------------------ seznam článků */

async function loadList() {
    const list = $('admin-post-list');
    list.innerHTML = '<li class="empty-state">Načítám články…</li>';
    try {
        const { posts } = await api('/api/posts?all=1');
        state.posts = posts;
        renderList();
    } catch (err) {
        list.innerHTML = `<li class="empty-state">${escapeHtml(err.message)}</li>`;
    }
}

function renderList() {
    const list = $('admin-post-list');
    if (!state.posts.length) {
        list.innerHTML = '<li class="empty-state">Zatím tu nejsou žádné články. Začněte tlačítkem „Nový článek“.</li>';
        return;
    }
    list.innerHTML = state.posts.map((p) => {
        const thumb = p.thumb
            ? `<img class="thumb" src="${escapeHtml(p.thumb)}" alt="" loading="lazy">`
            : `<img class="thumb is-placeholder" src="nahled.png" alt="" loading="lazy">`;
        const badge = p.published ? '<span class="badge">Publikováno</span>' : '<span class="badge draft">Koncept</span>';
        const editHref = `#/blog/edit/${encodeURIComponent(p.id)}`;
        return `
            <li class="admin-list-item">
                <a href="${editHref}">${thumb}</a>
                <div class="info">
                    <a class="title" href="${editHref}">${escapeHtml(p.title)}</a>
                    <div class="sub">${badge}<span>${formatDate(p.date)}</span></div>
                </div>
                <div class="actions">
                    <a class="btn btn-ghost btn-sm" href="${editHref}">Upravit</a>
                    <a class="btn btn-ghost btn-sm" href="clanek.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">Zobrazit</a>
                    <button type="button" class="btn btn-danger-ghost btn-sm" data-delete="${escapeHtml(p.id)}">Smazat</button>
                </div>
            </li>`;
    }).join('');
}

$('admin-post-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete]');
    if (btn) deletePost(btn.dataset.delete, btn);
});

async function deletePost(id, btn) {
    const post = state.posts.find((p) => p.id === id) || { title: 'tento článek' };
    if (!confirm(`Opravdu smazat článek „${post.title}“?\n\nTuto akci nelze vrátit.`)) return false;
    if (btn) { btn.disabled = true; btn.textContent = 'Mažu…'; }
    try {
        await api(`/api/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
        localStorage.removeItem(draftKey(id));
        state.posts = state.posts.filter((p) => p.id !== id);
        renderList();
        toast('Článek byl smazán.');
        return true;
    } catch (err) {
        toast(err.message, true);
        if (btn) { btn.disabled = false; btn.textContent = 'Smazat'; }
        return false;
    }
}

/* ------------------------------------------------------------ obrázky */

function loadImageElement(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Tento soubor se nepodařilo otevřít jako obrázek.')); };
        img.src = url;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Zmenší fotku na max. 1920 px a zkomprimuje ji, aby se vešla do databáze. */
async function prepareImage(file) {
    if (file.type === 'image/gif' && file.size <= MAX_UPLOAD_BYTES) {
        return { blob: file, width: null, height: null, name: file.name };
    }
    const img = await loadImageElement(file);
    let { naturalWidth: w, naturalHeight: h } = img;
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(w, h));
    w = Math.round(w * scale);
    h = Math.round(h * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // PNG s průhledností → WebP (zachová průhlednost), ostatní → JPEG
    const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
    if (!keepAlpha) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img, 0, 0, w, h);

    // Malé obrázky, které není třeba zmenšovat, necháme v původní podobě
    if (scale === 1 && file.size <= 600_000 && /^image\/(jpeg|png|webp)$/.test(file.type)) {
        return { blob: file, width: w, height: h, name: file.name };
    }

    const type = keepAlpha ? 'image/webp' : 'image/jpeg';
    let quality = 0.86;
    let blob = await canvasToBlob(canvas, type, quality);
    while (blob && blob.size > MAX_UPLOAD_BYTES && quality > 0.45) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, type, quality);
    }
    if (!blob || blob.size > MAX_UPLOAD_BYTES) throw new Error('Obrázek je příliš velký i po zmenšení.');
    const ext = type === 'image/webp' ? 'webp' : 'jpg';
    return { blob, width: w, height: h, name: (file.name || 'obrazek').replace(/\.[^.]+$/, '') + '.' + ext };
}

async function uploadImage(file) {
    const { blob, width, height, name } = await prepareImage(file);
    const form = new FormData();
    form.append('file', blob, name);
    if (width) form.append('width', width);
    if (height) form.append('height', height);
    const { url } = await api('/api/images', { method: 'POST', form });
    return url;
}

/* ------------------------------------------------------------ úvodní obrázek */

function setCover(url) {
    state.cover = url || '';
    const box = $('cover-preview');
    box.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="">` : '<span>Bez obrázku</span>';
    $('btn-cover-remove').hidden = !url;
}

$('f-cover-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    $('cover-preview').innerHTML = '<span>Nahrávám…</span>';
    try {
        setCover(await uploadImage(file));
        markDirty();
    } catch (err) {
        setCover(state.cover);
        toast(err.message, true);
    }
});

$('btn-cover-remove').addEventListener('click', () => { setCover(''); markDirty(); });

/* ------------------------------------------------------------ editor */

function initEditor() {
    if (state.editorReady) return state.editorReady;
    state.editorReady = new Promise((resolve, reject) => {
        const start = () => {
            if (!window.tinymce) { setTimeout(start, 50); return; }
            tinymce.init({
                selector: '#f-content',
                license_key: 'gpl',
                language: 'cs',
                language_url: TINYMCE_LANG,
                height: 680,
                menubar: false,
                toolbar_mode: 'wrap',
                branding: false,
                promotion: false,
                plugins: 'lists advlist link image table autolink media code fullscreen wordcount quickbars searchreplace',
                toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table blockquote | removeformat | searchreplace code fullscreen',
                block_formats: 'Odstavec=p; Nadpis=h2; Podnadpis=h3',
                quickbars_selection_toolbar: 'bold italic | h2 h3 | link blockquote',
                quickbars_insert_toolbar: false,
                contextmenu: 'link image table',
                content_style: `
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
                    body { font-family: Montserrat, sans-serif; color: #33322e; line-height: 1.8; max-width: 800px; margin: 20px auto; padding: 0 20px; font-size: 16px; }
                    h2 { font-size: 1.45rem; line-height: 1.35; margin: 2rem 0 .8rem; }
                    h3 { font-size: 1.2rem; margin: 1.6rem 0 .6rem; }
                    img { max-width: 100%; height: auto; border-radius: 8px; }
                    blockquote { margin: 1.5rem 0; padding: 4px 0 4px 20px; border-left: 3px solid #33322e; color: #5a5753; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #dfdcd2; padding: 8px 10px; }
                    th { background: #ebe8dc; }
                    figure.image { margin: 24px 0; display: table; }
                    figure.image figcaption { font-size: .85rem; color: #5a5753; }`,
                relative_urls: false,
                remove_script_host: true,
                convert_urls: true,
                image_caption: true,
                image_dimensions: false,
                image_description: true,
                image_title: false,
                image_advtab: false,
                automatic_uploads: true,
                paste_data_images: true,
                file_picker_types: 'image',
                images_file_types: 'jpg,jpeg,png,webp,gif,heic',
                images_upload_handler: async (blobInfo) => {
                    try {
                        return await uploadImage(blobInfo.blob());
                    } catch (err) {
                        throw { message: err.message, remove: true };
                    }
                },
                link_default_target: '_blank',
                link_assume_external_targets: 'https',
                table_default_attributes: {},
                table_default_styles: { width: '100%' },
                table_class_list: [{ title: 'Výchozí', value: '' }],
                invalid_elements: 'script,style,form,input,button,object,embed',
                setup(editor) {
                    editor.on('input change undo redo SetContent', (e) => {
                        if (e.type === 'setcontent' && !e.selection) return;
                        markDirty();
                    });
                    editor.addShortcut('meta+s', 'Uložit', () => savePost());
                },
                init_instance_callback(editor) {
                    state.editor = editor;
                    resolve(editor);
                },
            }).catch(reject);
        };
        start();
    });
    return state.editorReady;
}

function draftKey(id) { return `nf_draft_${id || 'new'}`; }

function collectForm() {
    return {
        title: $('f-title').value.trim(),
        date: $('f-date').value,
        excerpt: $('f-excerpt').value.trim(),
        cover: state.cover,
        published: $('f-published').checked,
        content: state.editor ? state.editor.getContent() : '',
    };
}

function fillForm(data) {
    $('f-title').value = data.title || '';
    $('f-date').value = data.date || today();
    $('f-excerpt').value = data.excerpt || '';
    $('f-published').checked = data.published !== false;
    setCover(data.cover || '');
    if (state.editor) {
        state.editor.setContent(data.content || '');
        state.editor.undoManager.clear();
        state.editor.setDirty(false);
    }
}

function setSaveState() {
    const el = $('save-state');
    if (state.saving) { el.textContent = 'Ukládám…'; el.className = 'save-state'; return; }
    if (state.dirty) { el.textContent = 'Neuložené změny'; el.className = 'save-state dirty'; return; }
    el.textContent = state.editing ? 'Uloženo' : '';
    el.className = 'save-state';
}

let draftTimer;
function markDirty() {
    if (state.loadingEditor) return;
    state.dirty = true;
    setSaveState();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
        try {
            localStorage.setItem(draftKey(state.editing && state.editing.id), JSON.stringify({ ...collectForm(), savedAt: Date.now() }));
        } catch (_) { /* plné úložiště nevadí */ }
    }, 800);
}

['f-title', 'f-date', 'f-excerpt'].forEach((id) => $(id).addEventListener('input', markDirty));
$('f-published').addEventListener('change', markDirty);

function offerDraft(id, serverUpdatedAt) {
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(draftKey(id)) || 'null'); } catch (_) {}
    const banner = $('draft-banner');
    if (!draft || (serverUpdatedAt && draft.savedAt <= Date.parse(serverUpdatedAt))) {
        banner.hidden = true;
        return;
    }
    $('draft-banner-text').textContent =
        `Našla se neuložená verze z ${new Date(draft.savedAt).toLocaleString('cs-CZ')} (např. po zavření okna).`;
    banner.hidden = false;
    $('draft-restore').onclick = () => {
        state.loadingEditor = true;
        fillForm(draft);
        state.loadingEditor = false;
        banner.hidden = true;
        markDirty();
    };
    $('draft-discard').onclick = () => {
        localStorage.removeItem(draftKey(id));
        banner.hidden = true;
    };
}

async function openEditor(id) {
    showView('view-editor');
    state.dirty = false;
    state.editing = null;
    state.loadingEditor = true;
    $('btn-delete').hidden = true;
    $('btn-preview').hidden = true;
    $('draft-banner').hidden = true;
    $('save-state').textContent = 'Načítám…';

    try {
        await initEditor();
    } catch (err) {
        toast('Editor se nepodařilo načíst. Zkontrolujte připojení a obnovte stránku.', true);
        return;
    }

    try {
        if (id) {
            const { post } = await api(`/api/posts/${encodeURIComponent(id)}`);
            state.editing = { id: post.id, updated_at: post.updated_at };
            fillForm(post);
            $('btn-delete').hidden = false;
            $('btn-preview').hidden = false;
            $('btn-preview').href = `clanek.html?id=${encodeURIComponent(post.id)}`;
            offerDraft(post.id, post.updated_at);
        } else {
            fillForm({ date: today(), published: true });
            offerDraft(null, null);
            setTimeout(() => $('f-title').focus(), 50);
        }
    } catch (err) {
        toast(err.message, true);
        location.hash = '#/blog';
        return;
    } finally {
        state.loadingEditor = false;
    }
    state.dirty = false;
    setSaveState();
}

async function savePost(force = false) {
    if (state.saving) return;
    const data = collectForm();
    if (!data.title) { toast('Doplňte název článku.', true); $('f-title').focus(); return; }
    if (!data.date) { toast('Doplňte datum.', true); $('f-date').focus(); return; }
    if (state.editor && state.editor.getBody().querySelector('img[src^="blob:"], img[src^="data:"]')) {
        toast('Počkejte, až se dokončí nahrávání obrázků.', true);
        return;
    }

    state.saving = true;
    setSaveState();
    document.querySelectorAll('#btn-save, #post-form [type="submit"]').forEach((b) => { b.disabled = true; });
    try {
        const isNew = !state.editing;
        const path = isNew ? '/api/posts' : `/api/posts/${encodeURIComponent(state.editing.id)}`;
        const { post } = await api(path, {
            method: isNew ? 'POST' : 'PUT',
            body: { ...data, updated_at: state.editing && state.editing.updated_at, force },
        });
        localStorage.removeItem(draftKey(isNew ? null : state.editing.id));
        state.editing = { id: post.id, updated_at: post.updated_at };
        state.dirty = false;
        $('f-excerpt').value = post.excerpt;
        $('btn-delete').hidden = false;
        $('btn-preview').hidden = false;
        $('btn-preview').href = `clanek.html?id=${encodeURIComponent(post.id)}`;
        if (isNew) {
            const hash = `#/blog/edit/${encodeURIComponent(post.id)}`;
            state.lastHash = hash;
            history.replaceState(null, '', hash);
        }
        toast(post.published ? 'Článek je uložený a publikovaný.' : 'Uloženo jako koncept.');
    } catch (err) {
        if (err.status === 409 && confirm(err.message + '\n\nChcete ho přesto přepsat svou verzí?')) {
            state.saving = false;
            return savePost(true);
        }
        toast(err.message, true);
    } finally {
        state.saving = false;
        setSaveState();
        document.querySelectorAll('#btn-save, #post-form [type="submit"]').forEach((b) => { b.disabled = false; });
    }
}

$('btn-save').addEventListener('click', () => savePost());
$('post-form').addEventListener('submit', (e) => { e.preventDefault(); savePost(); });

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !$('view-editor').hidden) {
        e.preventDefault();
        savePost();
    }
});

$('btn-delete').addEventListener('click', async () => {
    if (!state.editing) return;
    if (!state.posts.length) state.posts = [{ id: state.editing.id, title: $('f-title').value }];
    const ok = await deletePost(state.editing.id, $('btn-delete'));
    if (ok) {
        state.dirty = false;
        location.hash = '#/blog';
    }
});

/* ------------------------------------------------------------ tracker */

$('btn-tracker-import').addEventListener('click', async () => {
    if (!confirm('Načíst projekty z původního trackeru (onrender.com)?\n\nProjekty se stejným ID se přepíšou verzí ze starého trackeru. První načtení může trvat až minutu.')) return;
    const btn = $('btn-tracker-import');
    btn.disabled = true;
    btn.textContent = 'Načítám… (až minuta)';
    try {
        const { imported } = await api('/api/tracker/import', { method: 'POST' });
        toast(`Převzato projektů: ${imported}`);
        $('tracker-frame').contentWindow.location.reload();
    } catch (err) {
        toast(err.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Převzít projekty ze starého trackeru';
    }
});

/* ------------------------------------------------------------ start */

checkSession();
