// Upraveno pro web Nadi Francové: data jsou v Cloudflare D1, přihlášení přes administraci webu.
(() => {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (url, opts = {}) => {
        opts = { ...opts, credentials: 'same-origin', headers: { ...(opts.headers || {}), 'X-Requested-With': 'fetch' } };
        return nativeFetch(url, opts).then((res) => {
            if (res.status === 401 && !isClientView) showLoginView();
            return res;
        });
    };
})();

const pathParts = window.location.pathname.split('/');
const isClientView = pathParts[1] === 'project' && pathParts[2];
let isAdmin = false; let currentProject = null;
let allProjects = []; 
let currentFilter = 'active'; 

const formatDate = (dStr) => dStr ? new Date(dStr).toLocaleDateString('cs-CZ') : '';
const formatDateTime = (dStr) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute:'2-digit'});
};
const toDatetimeLocal = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

function getSpecialConfig(name) {
    if (['JES', 'OPP'].includes(name)) return { isSpecial: true, hasTimer: true, days: 60, hasVyzva: true };
    if (['HS', 'HG'].includes(name)) return { isSpecial: true, hasTimer: true, days: 30, hasVyzva: true };
    if (['Podání', 'Řízení'].includes(name)) return { isSpecial: true, hasTimer: true, days: 30, hasVyzva: false };
    if (['Povolení', 'Nabytí PM'].includes(name)) return { isSpecial: true, hasTimer: false, hasVyzva: false };
    return null;
}

window.onload = () => {
    const dateInput = document.getElementById('new-project-date');
    if(dateInput) dateInput.valueAsDate = new Date();
    if (isClientView) { document.getElementById('back-btn').style.display = 'none'; loadProject(pathParts[2]); } 
    else {
        fetch('/api/me').then((r) => {
            if (r.ok) { isAdmin = true; showAdminView(); } else { showLoginView(); }
        }).catch(() => showLoginView());
    }
};

async function login() {
    const user = document.getElementById('username').value, pass = document.getElementById('password').value;
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) });
    if (res.ok) { isAdmin = true; showAdminView(); } else { alert('Špatné heslo!'); }
}
function logout() { window.top.location.href = '/admin.html'; }
function showLoginView() { document.getElementById('login-view').style.display = 'block'; document.getElementById('admin-view').style.display = 'none'; document.getElementById('project-detail-view').style.display = 'none'; }
function showAdminView() { document.getElementById('login-view').style.display = 'none'; document.getElementById('admin-view').style.display = 'block'; document.getElementById('project-detail-view').style.display = 'none'; loadProjects(); }
function showProjectDetailView() { document.getElementById('login-view').style.display = 'none'; document.getElementById('admin-view').style.display = 'none'; document.getElementById('project-detail-view').style.display = 'block'; }

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active-filter'));
    document.getElementById('btn-filter-' + filter).classList.add('active-filter');
    renderProjectList();
}

async function loadProjects() {
    const res = await fetch('/api/tracker/projects'); 
    allProjects = await res.json();
    renderProjectList();
}

function renderProjectList() {
    const filtered = allProjects.filter(p => (p.category || 'active') === currentFilter);
    
    if (filtered.length === 0) {
        document.getElementById('project-list').innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 40px 0; background: rgba(255,255,255,0.4); border-radius: 12px; border: 1px dashed #cbd5e1;">V této sekci zatím žádné projekty nejsou.</div>';
        return;
    }

    document.getElementById('project-list').innerHTML = filtered.map(p => {
        const cat = p.category || 'active'; 
        return `
        <div class="glass card" style="display:flex; flex-direction:column; gap:8px;">
            <button class="delete-project-btn" onclick="deleteProject('${p.id}', event)">✕</button>
            <h3 style="margin: 0; color:#1e293b; padding-right: 25px;">${p.name}</h3>
            <div class="project-meta">Založen: ${formatDate(p.startDate)}</div>
            ${p.projectCompletedAt ? `<div style="color:#10b981; font-weight:bold;">Dokončeno: ${formatDate(p.projectCompletedAt)}</div>` : ''}
            <a href="/project/${p.id}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 13px;">Odkaz pro klienta ↗</a>
            
            <button onclick="loadProject('${p.id}')" style="margin-top: 10px; margin-bottom: 10px;">Otevřít projekt</button>
            
            <select class="project-category-select" onclick="event.stopPropagation()" onchange="changeProjectCategory('${p.id}', this.value, event)">
                <option value="active" ${cat === 'active' ? 'selected' : ''}>📂 Aktivní</option>
                <option value="permitted" ${cat === 'permitted' ? 'selected' : ''}>✅ Povolené</option>
                <option value="done" ${cat === 'done' ? 'selected' : ''}>🏁 Hotové</option>
            </select>
        </div>
    `}).join('');
}

async function changeProjectCategory(id, newCategory, event) {
    if(event) event.stopPropagation(); 
    const proj = allProjects.find(p => p.id === id);
    if(proj) {
        proj.category = newCategory;
        renderProjectList(); 
        await fetch(`/api/tracker/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(proj) });
    }
}

async function createProject() {
    const name = document.getElementById('new-project-name').value;
    const startDate = document.getElementById('new-project-date').value;
    if (!name) return alert("Zadej název");
    await fetch('/api/tracker/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, startDate }) });
    document.getElementById('new-project-name').value = ''; loadProjects();
}

async function loadProject(id) {
    const res = await fetch(`/api/tracker/projects/${id}`);
    if (!res.ok) return document.body.innerHTML = '<h2>Nenalezeno</h2>';
    currentProject = await res.json();
    
    // Zajištění kompatibility: Pokud starý projekt nemá "Nabytí PM", automaticky mu ho přidáme
    let schvSec = currentProject.sections.find(s => s.name === "Schvalování");
    if (schvSec && !schvSec.items.some(i => i.name === "Nabytí PM")) {
        schvSec.items.push({
            id: Math.random().toString(36).substring(2),
            name: "Nabytí PM", notes: "", status: "TODO", completedAt: null, submittedAt: null, isPaused: false, pausedAt: null, pausedMs: 0
        });
    }

    document.getElementById('project-title').innerText = currentProject.name;
    document.getElementById('edit-title-btn').style.display = isAdmin ? 'inline-block' : 'none';
    
    document.getElementById('edit-title-container').style.display = 'none';
    document.getElementById('title-display-wrapper').style.display = 'flex';

    document.getElementById('project-meta-date').innerText = currentProject.startDate ? `Začátek projektu: ${formatDate(currentProject.startDate)}` : '';
    renderPipeline(); showProjectDetailView();
}

function toggleEditTitle() {
    if (!isAdmin) return; 
    
    const wrapper = document.getElementById('title-display-wrapper');
    const container = document.getElementById('edit-title-container');
    const input = document.getElementById('edit-title-input');
    
    if (container.style.display === 'none') {
        wrapper.style.display = 'none';
        container.style.display = 'flex';
        input.value = currentProject.name;
        input.focus();
    } else {
        container.style.display = 'none';
        wrapper.style.display = 'flex';
    }
}

async function saveNewTitle() {
    if (!isAdmin) return;
    
    const newTitle = document.getElementById('edit-title-input').value.trim();
    if (!newTitle) return alert("Název nesmí být prázdný!");
    
    currentProject.name = newTitle;
    document.getElementById('project-title').innerText = newTitle;
    toggleEditTitle(); 
    
    await saveProject(false); 
    if (isAdmin) loadProjects(); 
}

async function saveRozborText(t) { currentProject.rozbor = t; await saveProject(false); }
async function updateSectionDate(s, v) { currentProject.sections[s].startDate = v; await saveProject(false); }

// Nové funkce pro Ověřenou dokumentaci
async function saveDocText(t) { currentProject.overenaDokumentaceText = t; await saveProject(false); }
async function saveDocUrl(u) { currentProject.overenaDokumentaceUrl = u; await saveProject(false); }

function getTimerHtml(item, isModal = false) {
    const conf = getSpecialConfig(item.name);
    if (!conf || !conf.hasTimer || item.status !== 'SUBMITTED' || !item.submittedAt) return '';

    const now = new Date();
    let elapsedMs = now.getTime() - new Date(item.submittedAt).getTime() - (item.pausedMs || 0);
    if (item.isPaused && item.pausedAt) elapsedMs -= (now.getTime() - new Date(item.pausedAt).getTime());

    const daysElapsed = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const daysLeft = conf.days - daysElapsed;

    const fontSize = isModal ? '14px' : '11px';
    if (item.isPaused) {
        return `<div style="color:#dc2626; font-weight:bold; font-size:${fontSize}; margin-top:4px;">⏸ Čas zastaven (Výzva) - zbývá cca ${daysLeft} dní</div>`;
    } else {
        return `<div style="color:#d97706; font-weight:bold; font-size:${fontSize}; margin-top:4px;">⏳ max ${daysLeft} dní do schválení</div>`;
    }
}

function renderPipeline() {
    const container = document.getElementById('project-pipeline');
    let globalValid = 0; let globalCompleted = 0;

    currentProject.sections.forEach(s => {
        let valid = s.items.filter(i => i.status !== 'NOT_NEEDED');
        globalValid += valid.length;
        globalCompleted += valid.filter(i => i.status === 'COMPLETED').length;
    });

    const isDone = (globalValid > 0 && globalValid === globalCompleted);

    let html = `
        <div class="glass card stage-column col-rozbor">
            <h3 style="margin:0 0 15px 0;">Rozbor a zadání</h3>
            ${isAdmin ? `<textarea style="flex:1; border:none; background:rgba(255,255,255,0.5);" onchange="saveRozborText(this.value)">${currentProject.rozbor || ''}</textarea>` 
                      : `<div style="font-size: 13px; white-space: pre-wrap; flex:1;">${currentProject.rozbor || '<i>Žádné informace</i>'}</div>`}
        </div>
    `;

    const sClasses = ["col-projektovani", "col-stanoviska", "col-schvalovani"];

    html += currentProject.sections.map((section, sIndex) => {
        let validItems = section.items.filter(i => i.status !== 'NOT_NEEDED');
        let sectionTotal = validItems.length;
        let sectionCompleted = validItems.filter(i => i.status === 'COMPLETED').length;

        let itemsHtml = section.items.map((item, iIndex) => {
            let rowClass = 'future'; let badgeChar = '';

            if (item.status === 'COMPLETED') { rowClass = 'done'; badgeChar = '✓'; }
            else if (item.status === 'IN_PROGRESS') { rowClass = 'active'; }
            else if (item.status === 'NOT_NEEDED') { rowClass = 'not-needed'; badgeChar = 'Ø'; }
            else if (item.status === 'SUBMITTED') { rowClass = item.isPaused ? 'paused' : 'submitted'; badgeChar = '📄'; }

            let dateText = item.status === 'COMPLETED' ? formatDateTime(item.completedAt) : '';
            if (item.status === 'SUBMITTED' && !item.isPaused && item.submittedAt) dateText = `Podáno: ${formatDate(item.submittedAt)}`;

            let timerHtml = getTimerHtml(item, false);

            return `
                <div class="task-row ${rowClass}" onclick="openModal(${sIndex}, ${iIndex})">
                    <div class="task-header"><span class="task-name">${item.name}</span>${badgeChar}</div>
                    ${dateText ? `<div class="task-date">${dateText}</div>` : ''}
                    ${timerHtml}
                </div>
            `;
        }).join('');

        let pct = sectionTotal === 0 ? 100 : Math.round((sectionCompleted / sectionTotal) * 100);
        let dateHtml = isAdmin ? `<input type="date" class="section-date-input" value="${section.startDate || ''}" onchange="updateSectionDate(${sIndex}, this.value)">` : (section.startDate ? `<div style="font-size:12px; margin-top:5px; font-weight:600;">Od: ${formatDate(section.startDate)}</div>` : '');

        return `
            <div class="glass card stage-column ${sClasses[sIndex]}">
                <h2 style="margin:0 0 5px 0; font-size:1.3em;">${section.name}</h2>
                ${dateHtml}
                <div class="progress-container">
                    <div class="progress-text"><span>Dokončeno:</span><span style="font-weight:bold;">${pct}%</span></div>
                    <div class="progress-track"><div class="progress-fill" style="width: ${pct}%"></div></div>
                </div>
                <div class="tasks-container">${itemsHtml}</div>
            </div>
        `;
    }).join('');

    // Nahrazení smajlíka za sekci Ověřená dokumentace s odkazem
    html += `
        <div class="glass card stage-column col-hotovo ${isDone ? 'all-done' : ''}">
            <h3 style="margin:0 0 15px 0;">Ověřená dokumentace</h3>
            ${isAdmin ? `
                <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
                    <label style="font-size:12px; font-weight:600; color:#475569; margin-bottom:-6px;">Zobrazovaný text</label>
                    <input type="text" placeholder="Např.: Disk Google" value="${currentProject.overenaDokumentaceText || ''}" onchange="saveDocText(this.value)" style="background:rgba(255,255,255,0.6); border:1px solid rgba(126, 34, 206, 0.4);">
                    
                    <label style="font-size:12px; font-weight:600; color:#475569; margin-bottom:-6px;">URL odkaz</label>
                    <input type="text" placeholder="Např.: https://drive.google.com/..." value="${currentProject.overenaDokumentaceUrl || ''}" onchange="saveDocUrl(this.value)" style="background:rgba(255,255,255,0.6); border:1px solid rgba(126, 34, 206, 0.4);">
                    
                    ${(currentProject.overenaDokumentaceText && currentProject.overenaDokumentaceUrl) ? `
                        <a href="${currentProject.overenaDokumentaceUrl}" target="_blank" class="doc-link-btn" style="margin-top:auto;">Zkusit odkaz ↗</a>
                    ` : ''}
                </div>
            ` : `
                <div style="display:flex; flex-direction:column; flex:1; justify-content:center; align-items:center;">
                    ${(currentProject.overenaDokumentaceText && currentProject.overenaDokumentaceUrl) ? `
                        <a href="${currentProject.overenaDokumentaceUrl}" target="_blank" class="doc-link-btn">${currentProject.overenaDokumentaceText} ↗</a>
                    ` : `
                        <div style="font-size: 13px; color: #64748b; font-style: italic; text-align: center;">Odkaz zatím nebyl přidán.</div>
                    `}
                </div>
            `}
        </div>
    `;
    container.innerHTML = html;
}

let currentModalItem = null; 
function openModal(sIndex, iIndex) {
    currentModalItem = { sIndex, iIndex };
    const item = currentProject.sections[sIndex].items[iIndex];
    const conf = getSpecialConfig(item.name);

    document.getElementById('modal-title').innerText = item.name;

    let badgeHtml = '';
    if (item.status === 'COMPLETED') badgeHtml = `<span class="status-badge status-done">✓ Schváleno / Dokončeno</span>`;
    else if (item.status === 'SUBMITTED') badgeHtml = `<span class="status-badge status-submitted">📄 Podáno</span>`;
    else if (item.status === 'IN_PROGRESS') badgeHtml = `<span class="status-badge status-progress">🔥 Pracuje se</span>`;
    else if (item.status === 'NOT_NEEDED') badgeHtml = `<span class="status-badge status-skipped">Ø Není potřeba</span>`;
    else badgeHtml = `<span class="status-badge status-todo">⏳ Čeká se na zahájení</span>`;

    document.getElementById('modal-status-badge').innerHTML = badgeHtml + getTimerHtml(item, true);

    let dateEditHtml = '';
    if (isAdmin) {
        if (item.status === 'COMPLETED') {
            dateEditHtml = `<div style="margin-bottom:15px;"><label style="font-size:12px;">Upravit datum dokončení/schválení:</label><br><input type="datetime-local" value="${toDatetimeLocal(item.completedAt)}" onchange="updateItemDate('completedAt', this.value)" style="background:#fff; border:1px solid #cbd5e1;"></div>`;
        } else if (item.status === 'SUBMITTED') {
            dateEditHtml = `<div style="margin-bottom:15px;"><label style="font-size:12px;">Upravit datum podání:</label><br><input type="datetime-local" value="${toDatetimeLocal(item.submittedAt)}" onchange="updateItemDate('submittedAt', this.value)" style="background:#fff; border:1px solid #cbd5e1;"></div>`;
        }
    }

    const bodyContainer = document.getElementById('modal-body');
    if (isAdmin) {
        bodyContainer.innerHTML = `${dateEditHtml}<textarea id="modal-notes" rows="6" placeholder="Poznámky...">${item.notes}</textarea>`;
    } else {
        bodyContainer.innerHTML = `<div style="font-size: 14px; white-space: pre-wrap; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">${item.notes || '<i>Zatím žádné poznámky...</i>'}</div>`;
    }

    const actionsContainer = document.getElementById('modal-actions');
    if (isAdmin) {
        let acts = `<div style="display: flex; gap: 8px; flex-wrap: wrap; width: 100%;">`;
        if (conf && conf.hasTimer) {
            acts += `<button onclick="setItemStatus('TODO')" class="btn-ghost" style="flex:1;">Zrušit (Čeká)</button>`;
            acts += `<button onclick="setItemStatus('IN_PROGRESS')" style="background:#dc2626; flex:1;">Pracuje se</button>`;
            if (item.status === 'SUBMITTED') {
                if (conf.hasVyzva) {
                    if (item.isPaused) acts += `<button onclick="togglePause()" style="background:#10b981; flex:1.5;">▶ Pokračovat</button>`;
                    else acts += `<button onclick="togglePause()" style="background:#ef4444; flex:1.5;">⏸ Výzva (Zastavit)</button>`;
                }
                acts += `<button onclick="setItemStatus('COMPLETED')" class="success" style="flex:1.5;">Schváleno</button>`;
            } else {
                acts += `<button onclick="setItemStatus('SUBMITTED')" style="background:#f59e0b; flex:1.5;">Podat</button>`;
            }
        } else {
            acts += `<button onclick="setItemStatus('TODO')" class="btn-ghost" style="flex:1;">Čeká</button>`;
            acts += `<button onclick="setItemStatus('NOT_NEEDED')" class="btn-ghost" style="flex:1;">Není potřeba</button>`;
            acts += `<button onclick="setItemStatus('IN_PROGRESS')" style="background:#dc2626; flex:1.5;">Pracuje se</button>`;
            acts += `<button onclick="setItemStatus('COMPLETED')" class="success" style="flex:1.5;">Hotovo</button>`;
        }
        acts += `</div>`;
        actionsContainer.innerHTML = acts;
    } else { actionsContainer.innerHTML = ''; }

    document.getElementById('item-modal').classList.add('active');
}

async function updateItemDate(field, val) {
    if(!val || !currentModalItem) return;
    const { sIndex, iIndex } = currentModalItem;
    currentProject.sections[sIndex].items[iIndex][field] = new Date(val).toISOString();
    await saveProject(false); 
}

async function togglePause() {
    if(!currentModalItem) return;
    const { sIndex, iIndex } = currentModalItem;
    const item = currentProject.sections[sIndex].items[iIndex];
    const now = new Date();

    if (item.isPaused) {
        item.isPaused = false;
        if(item.pausedAt) item.pausedMs = (item.pausedMs || 0) + (now.getTime() - new Date(item.pausedAt).getTime());
        item.pausedAt = null;
    } else {
        item.isPaused = true;
        item.pausedAt = now.toISOString();
    }
    await saveProject(); openModal(sIndex, iIndex);
}

function closeModal(event) {
    if(event && event.target !== document.getElementById('item-modal')) return;
    if (isAdmin && currentModalItem) {
        const { sIndex, iIndex } = currentModalItem;
        const currentNotes = document.getElementById('modal-notes')?.value;
        if (currentNotes !== undefined && currentProject.sections[sIndex].items[iIndex].notes !== currentNotes) {
            currentProject.sections[sIndex].items[iIndex].notes = currentNotes;
            saveProject(false); 
        }
        renderPipeline();
    }
    document.getElementById('item-modal').classList.remove('active');
    currentModalItem = null;
}

async function setItemStatus(newStatus) {
    if(!currentModalItem) return;
    const { sIndex, iIndex } = currentModalItem;
    const item = currentProject.sections[sIndex].items[iIndex];

    item.status = newStatus;
    item.notes = document.getElementById('modal-notes').value;

    if (newStatus === 'SUBMITTED') {
        if (!item.submittedAt) item.submittedAt = new Date().toISOString();
        item.isPaused = false; item.pausedAt = null;
    } else if (newStatus === 'COMPLETED') {
        item.completedAt = new Date().toISOString();
    } else {
        item.completedAt = null; item.submittedAt = null;
        item.isPaused = false; item.pausedAt = null; item.pausedMs = 0;
    }

    let tVal = 0; let cVal = 0;
    currentProject.sections.forEach(s => {
        let v = s.items.filter(i => i.status !== 'NOT_NEEDED');
        tVal += v.length; cVal += v.filter(i => i.status === 'COMPLETED').length;
    });

    if (tVal > 0 && tVal === cVal) {
        if (!currentProject.projectCompletedAt) currentProject.projectCompletedAt = new Date().toISOString();
    } else { currentProject.projectCompletedAt = null; }

    await saveProject();
    if (['COMPLETED', 'SUBMITTED'].includes(newStatus)) openModal(sIndex, iIndex); else closeModal();
}

async function saveProject(reRender = true) {
    await fetch(`/api/tracker/projects/${currentProject.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentProject) });
    if(reRender) renderPipeline(); 
}

async function deleteProject(id, event) {
    event.stopPropagation();
    if (confirm('Opravdu chcete tento projekt trvale smazat?')) {
        try {
            const response = await fetch(`/api/tracker/projects/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadProjects(); 
            } else {
                alert('Nepodařilo se smazat projekt.');
            }
        } catch (error) {
            console.error('Chyba:', error);
        }
    }
}
