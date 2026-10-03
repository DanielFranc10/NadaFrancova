const API_URL = "https://script.google.com/macros/s/AKfycbyeM7NNWBm-Pc75pVBEwpyqfXjqodJ_hyD-ufo50xbd9XQT0K1u6FIer77tWC4oTK7j/exec";

// --- NAČÍTÁNÍ DAT ---
async function fetchBlogs() {
    try {
        const response = await fetch(API_URL + "?action=read&t=" + new Date().getTime());
        return await response.json();
    } catch (err) {
        return [];
    }
}

// --- VYKRESLENÍ PRO INDEX.HTML (4 sloupce, BEZ FOTEK) ---
async function renderIndexGrid() {
    const container = document.getElementById('index-blog-grid');
    if (!container) return;

    container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Načítám data z databáze...</p>';
    const blogs = await fetchBlogs();
    container.innerHTML = '';

    if (!blogs || blogs.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Zatím nejsou publikovány žádné články.</p>';
        return;
    }

    let currentColumn = document.createElement('div');
    
    // Na indexu skládáme články do sloupců po dvou
    blogs.forEach((blog, index) => {
        if (index > 0 && index % 2 === 0) {
            container.appendChild(currentColumn);
            currentColumn = document.createElement('div');
        }

        const article = document.createElement('article');
        article.className = 'post-card index-card';
        article.innerHTML = `
            <h3><a href="clanek.html?id=${blog.id}">${blog.title}</a></h3>
            <p>${blog.excerpt}</p>
            <time>${blog.date}</time>
        `;
        currentColumn.appendChild(article);
    });
    
    if (currentColumn.hasChildNodes()) {
        container.appendChild(currentColumn);
    }
}

// --- VYKRESLENÍ PRO BLOG.HTML (Mřížka 3x2, S FOTKOU A STRÁNKOVÁNÍM) ---
const POSTS_PER_PAGE = 6;

async function renderBlogGrid(page = 1) {
    const container = document.getElementById('dynamic-blog-grid');
    const pagination = document.getElementById('pagination-controls');
    if (!container) return;

    if (page === 1) container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Načítám data z databáze...</p>'; 
    
    const blogs = await fetchBlogs();
    
    if (!blogs || blogs.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Zatím nejsou publikovány žádné články.</p>';
        if (pagination) pagination.innerHTML = '';
        return;
    }

    // Logika stránkování
    const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const currentBlogs = blogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

    container.innerHTML = ''; 

    // Vykreslení článků pro aktuální stránku
    currentBlogs.forEach((blog) => {
        const article = document.createElement('article');
        article.className = 'post-card';
        let imageHtml = blog.image ? `<img src="${blog.image}" alt="Náhled" class="blog-thumb">` : '';
        article.innerHTML = `
            ${imageHtml}
            <h3 style="margin-top:0;"><a href="clanek.html?id=${blog.id}">${blog.title}</a></h3>
            <p>${blog.excerpt}</p>
            <time>${blog.date}</time>
        `;
        container.appendChild(article);
    });

    // Vykreslení tlačítek stránkování dole
    if (pagination) {
        let pagHtml = '';
        for(let i = 1; i <= totalPages; i++) {
            pagHtml += `<button onclick="renderBlogGrid(${i})" class="${i === page ? 'active-page' : ''}">${i}</button>`;
        }
        if (page < totalPages) {
            pagHtml += `<button onclick="renderBlogGrid(${page + 1})">Následující</button>`;
        }
        pagination.innerHTML = pagHtml;
    }
}

// --- DETAIL ČLÁNKU ---
async function renderSingleArticle() {
    const container = document.getElementById('dynamic-article');
    if (!container) return;

    container.innerHTML = '<p>Otevírám článek...</p>';
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    const blogs = await fetchBlogs();
    const blog = blogs.find(b => b.id.toString() === blogId.toString());

    if (blog) {
        document.title = `${blog.title} | Blog`;
        let imageHtml = blog.image ? `<img src="${blog.image}" alt="${blog.title}" style="width:100%; max-height:400px; object-fit:cover; margin: 2rem 0; border-radius: 4px;">` : '';
        container.innerHTML = `
            <h1>${blog.title}</h1>
            <div class="meta">Napsal administrator / ${blog.date}</div>
            ${imageHtml}
            ${blog.content}
        `;
    } else {
        container.innerHTML = `<h1>Článek nenalezen</h1><p>Tento článek neexistuje nebo byl stažen.</p><a href="blog.html">← Zpět na blog</a>`;
    }
}

function insertImageToContent() {
    const url = prompt("Vlož URL adresu obrázku (např. https://...):");
    if (url) {
        const textarea = document.getElementById('new-content');
        const imgTag = `\n<img src="${url}" alt="Obrázek k článku" style="width:100%; height:auto; margin: 1.5rem 0; border-radius: 4px;">\n`;
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, startPos) + imgTag + textarea.value.substring(endPos, textarea.value.length);
        textarea.focus();
        textarea.selectionStart = startPos + imgTag.length;
        textarea.selectionEnd = startPos + imgTag.length;
    }
}

// --- ADMINISTRACE A PŘIHLAŠOVÁNÍ ---
function checkLogin() {
    const adminSection = document.getElementById('admin-dashboard');
    const loginSection = document.getElementById('login-screen');
    if (!adminSection || !loginSection) return;

    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        renderAdminList();
    } else {
        loginSection.style.display = 'block';
        adminSection.style.display = 'none';
    }
}

function login() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    if (user === 'francova' && pass === '654321') {
        sessionStorage.setItem('isLoggedIn', 'true');
        checkLogin();
    } else {
        alert('Špatné jméno nebo heslo!');
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    checkLogin();
}

async function renderAdminList() {
    const list = document.getElementById('admin-post-list');
    if (!list) return;

    list.innerHTML = '<li>Načítám data z Google serveru...</li>';
    const blogs = await fetchBlogs();
    list.innerHTML = '';

    if (!blogs || blogs.length === 0) {
        list.innerHTML = '<li>Tabulka je zatím prázdná.</li>';
        return;
    }

    blogs.forEach(blog => {
        const li = document.createElement('li');
        li.className = 'admin-post-item';
        li.innerHTML = `
            <span>${blog.title}</span>
            <button class="delete-btn" onclick="deleteBlog(event, '${blog.id}')">Smazat</button>
        `;
        list.appendChild(li);
    });
}

async function deleteBlog(event, id) {
    if(confirm("Smazat článek? Provede se okamžitě i v tabulce.")) {
        const btn = event.target;
        btn.innerText = "Mažu...";
        btn.disabled = true;

        try {
            await fetch(API_URL + "?action=delete", { 
                method: "POST", 
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                redirect: "follow",
                body: JSON.stringify({ id: id })
            });
            await renderAdminList(); 
        } catch (err) {
            alert("Chyba připojení k tabulce!");
            btn.innerText = "Smazat";
            btn.disabled = false;
        }
    }
}

async function addNewBlog(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    btn.innerText = "Zpracovávám a odesílám data na Disk...";
    btn.disabled = true;

    const title = document.getElementById('new-title').value;
    const date = document.getElementById('new-date').value;
    const excerpt = document.getElementById('new-excerpt').value;
    const content = document.getElementById('new-content').value;
    const fileInput = document.getElementById('new-image-file');
    
    let imageBase64 = null;
    let imageName = null;

    const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if(file.size > 3145728) {
            alert("Soubor je příliš velký! Maximální velikost je 3 MB.");
            btn.innerText = "Publikovat článek";
            btn.disabled = false;
            return;
        }
        imageBase64 = await getBase64(file);
        imageName = file.name;
    }

    const dateObj = new Date(date);
    const months = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;

    const newBlog = {
        id: Date.now().toString(),
        title: title,
        date: formattedDate,
        excerpt: excerpt,
        imageBase64: imageBase64,
        imageName: imageName,
        content: content.replace(/\n/g, '<br>') 
    };

    try {
        await fetch(API_URL + "?action=add", {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            redirect: "follow",
            body: JSON.stringify(newBlog)
        });
        
        document.getElementById('add-blog-form').reset();
        await renderAdminList();
        alert('Článek úspěšně nahrán na web!');
    } catch (err) {
        alert("Něco se pokazilo, zkontrolujte konzoli.");
    }

    btn.innerText = "Publikovat článek";
    btn.disabled = false;
}

// --- PROJECT TRACKER LOGIKA ---
async function fetchProjects() {
    try {
        const response = await fetch(API_URL + "?action=readProjects&t=" + Date.now());
        return await response.json();
    } catch (err) { return []; }
}

async function renderTracker() {
    const board = document.getElementById('kanban-board');
    if (!board) return;

    board.innerHTML = '<p>Načítám projekty...</p>';
    const projects = await fetchProjects();
    
    const columns = { "Poptávka": "", "Studie": "", "Povolení": "", "Realizace": "", "Hotovo": "" };

    projects.forEach(p => {
        const card = `
            <div class="tracker-card">
                <h4>${p.name}</h4>
                <p><strong>Klient:</strong> ${p.client}</p>
                <p><strong>Deadline:</strong> ${p.deadline}</p>
                <select onchange="updateStatus('${p.id}', this.value)">
                    <option value="Poptávka" ${p.status === 'Poptávka' ? 'selected' : ''}>Poptávka</option>
                    <option value="Studie" ${p.status === 'Studie' ? 'selected' : ''}>Studie</option>
                    <option value="Povolení" ${p.status === 'Povolení' ? 'selected' : ''}>Stavební povolení</option>
                    <option value="Realizace" ${p.status === 'Realizace' ? 'selected' : ''}>Realizace</option>
                    <option value="Hotovo" ${p.status === 'Hotovo' ? 'selected' : ''}>Hotovo</option>
                </select>
            </div>
        `;
        if (columns[p.status] !== undefined) columns[p.status] += card;
    });

    board.innerHTML = Object.keys(columns).map(col => `
        <div class="kanban-col">
            <h3>${col}</h3>
            ${columns[col]}
        </div>
    `).join('');
}

async function addNewProject(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button');
    btn.innerText = "Ukládám...";
    btn.disabled = true;

    const newProject = {
        id: Date.now().toString(),
        name: document.getElementById('proj-name').value,
        client: document.getElementById('proj-client').value,
        deadline: document.getElementById('proj-deadline').value,
        status: "Poptávka"
    };

    await fetch(API_URL + "?action=addProject", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        redirect: "follow",
        body: JSON.stringify(newProject)
    });

    document.getElementById('add-project-form').reset();
    await renderTracker();
    btn.innerText = "Přidat projekt";
    btn.disabled = false;
}

async function updateStatus(id, newStatus) {
    await fetch(`${API_URL}?action=updateProjectStatus&id=${id}&status=${newStatus}`, { method: "POST", redirect: "follow" });
    renderTracker();
}

// INICIALIZACE - Rozpozná, co má na jaké stránce načíst
document.addEventListener('DOMContentLoaded', () => {
    renderIndexGrid();
    renderBlogGrid();
    renderSingleArticle();
    checkLogin();
    
    if(typeof renderTracker === 'function') {
        renderTracker();
    }
});
