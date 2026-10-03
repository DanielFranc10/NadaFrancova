const API_URL = "https://script.google.com/macros/s/AKfycbyeM7NNWBm-Pc75pVBEwpyqfXjqodJ_hyD-ufo50xbd9XQT0K1u6FIer77tWC4oTK7j/exec";

let editingBlogId = null;
let currentOldImage = "";

// --- NAČÍTÁNÍ DAT ---
async function fetchBlogs() {
    try {
        const response = await fetch(API_URL + "?action=read&t=" + new Date().getTime());
        return await response.json();
    } catch (err) {
        return [];
    }
}

// --- VYKRESLENÍ PRO INDEX.HTML (Pouze 3 nejnovější) ---
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

    const latestBlogs = blogs.slice(0, 3); // JEN 3 NEJNOVĚJŠÍ
    
    latestBlogs.forEach((blog) => {
        const article = document.createElement('article');
        article.className = 'post-card index-card';
        article.innerHTML = `
            <h3><a href="clanek.html?id=${blog.id}">${blog.title}</a></h3>
            <p>${blog.excerpt}</p>
            <time>${blog.date}</time>
        `;
        container.appendChild(article);
    });
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

    const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const currentBlogs = blogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

    container.innerHTML = ''; 

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

// --- ADMINISTRACE LOGIKA ---
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
            <div>
                <button class="edit-btn" onclick="editBlog('${blog.id}')">Upravit</button>
                <button class="delete-btn" onclick="deleteBlog(event, '${blog.id}')">Smazat</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// --- EDITACE ČLÁNKU ---
async function editBlog(id) {
    const blogs = await fetchBlogs();
    const blog = blogs.find(b => b.id.toString() === id.toString());
    
    if (blog) {
        editingBlogId = blog.id;
        currentOldImage = blog.image || "";
        
        document.getElementById('new-title').value = blog.title;
        document.getElementById('new-excerpt').value = blog.excerpt;
        document.getElementById('new-content').value = blog.content.replace(/<br>/g, '\n');
        
        const btn = document.querySelector('#add-blog-form button[type="submit"]');
        btn.innerText = "Uložit změny (Upravit)";
        btn.style.background = "#4CAF50"; // Zelená barva pro editaci
        
        window.scrollTo({ top: document.getElementById('add-blog-form').offsetTop - 50, behavior: 'smooth' });
    }
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
    const originalText = btn.innerText;
    btn.innerText = "Zpracovávám a odesílám data na Disk...";
    btn.disabled = true;

    const title = document.getElementById('new-title').value;
    const dateInput = document.getElementById('new-date').value;
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
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }
        imageBase64 = await getBase64(file);
        imageName = file.name;
    }

    // Formátování data
    let formattedDate = "";
    if (dateInput) {
        const dateObj = new Date(dateInput);
        const months = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
        formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
    } else {
        formattedDate = "Neuvedeno";
    }

    const payloadData = {
        id: editingBlogId ? editingBlogId : Date.now().toString(),
        title: title,
        date: formattedDate,
        excerpt: excerpt,
        image: editingBlogId ? currentOldImage : "", // Pokud edituji a nenahraji novou, zachová se stará
        imageBase64: imageBase64,
        imageName: imageName,
        content: content.replace(/\n/g, '<br>') 
    };

    const actionUrl = editingBlogId ? "?action=update" : "?action=add";

    try {
        await fetch(API_URL + actionUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            redirect: "follow",
            body: JSON.stringify(payloadData)
        });
        
        document.getElementById('add-blog-form').reset();
        
        // Reset formuláře po úspěšné editaci
        editingBlogId = null;
        currentOldImage = "";
        btn.style.background = "var(--text-main)";
        
        await renderAdminList();
        alert('Data úspěšně uložena!');
    } catch (err) {
        alert("Něco se pokazilo, zkontrolujte konzoli.");
    }

    btn.innerText = "Publikovat článek";
    btn.disabled = false;
}

// INICIALIZACE - Rozpozná, co má na jaké stránce načíst
document.addEventListener('DOMContentLoaded', () => {
    renderIndexGrid();
    renderBlogGrid();
    renderSingleArticle();
    checkLogin();
});
