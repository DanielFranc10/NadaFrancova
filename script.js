const API_URL = "https://script.google.com/macros/s/AKfycbyeM7NNWBm-Pc75pVBEwpyqfXjqodJ_hyD-ufo50xbd9XQT0K1u6FIer77tWC4oTK7j/exec";

async function fetchBlogs() {
    try {
        const response = await fetch(API_URL + "?action=read&t=" + new Date().getTime());
        return await response.json();
    } catch (err) {
        console.error("Chyba DB:", err); return [];
    }
}

// 1. Pro Úvodní stránku (4 sloupce pod menu, čistý text)
async function renderIndexGrid() {
    const container = document.getElementById('index-blog-grid');
    if (!container) return;

    container.innerHTML = '<p style="grid-column: span 4;">Načítám články...</p>'; 
    const blogs = await fetchBlogs();
    container.innerHTML = ''; 

    if (blogs.length === 0) return;

    const recentBlogs = blogs.slice(0, 4); // Jen 4 články
    recentBlogs.forEach(blog => {
        const article = document.createElement('article');
        article.className = 'snippet-card';
        article.innerHTML = `
            <h3><a href="clanek.html?id=${blog.id}">${blog.title}</a></h3>
            <p>${blog.excerpt}</p>
            <time>${blog.date}</time>
        `;
        container.appendChild(article);
    });
}

// 2. Pro stránku Blog (3 sloupce, fotky, karty)
async function renderBlogPageGrid() {
    const container = document.getElementById('full-blog-grid');
    if (!container) return;

    container.innerHTML = '<p style="grid-column: span 3; text-align: center;">Načítám články...</p>'; 
    const blogs = await fetchBlogs();
    container.innerHTML = ''; 

    blogs.forEach(blog => {
        const article = document.createElement('article');
        article.className = 'full-card';
        let imgHtml = blog.image ? `<img src="${blog.image}" alt="">` : '';
        article.innerHTML = `
            ${imgHtml}
            <div class="full-card-content">
                <span class="cat-tag">Uncategorized</span>
                <h3><a href="clanek.html?id=${blog.id}">${blog.title}</a></h3>
                <div class="meta">administrator / ${blog.date}</div>
                <p>${blog.excerpt}</p>
            </div>
        `;
        container.appendChild(article);
    });
}

// 3. Detail článku
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
        let imgHtml = blog.image ? `<img src="${blog.image}" style="width:100%; max-height:400px; object-fit:cover; margin-bottom: 2rem;">` : '';
        container.innerHTML = `
            <h1>${blog.title}</h1>
            <div class="meta">Napsal administrator / ${blog.date}</div>
            ${imgHtml}
            <div class="page-text">${blog.content}</div>
        `;
    } else {
        container.innerHTML = `<h1>Nenalezeno</h1><a href="blog.html">Zpět</a>`;
    }
}

// 4. Admin
function checkLogin() {
    const adminS = document.getElementById('admin-dashboard');
    const loginS = document.getElementById('login-screen');
    if (!adminS) return;
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        loginS.style.display = 'none'; adminS.style.display = 'block'; renderAdminList();
    } else {
        loginS.style.display = 'block'; adminS.style.display = 'none';
    }
}
function login() {
    if (document.getElementById('admin-user').value === 'francova' && document.getElementById('admin-pass').value === '654321') {
        sessionStorage.setItem('isLoggedIn', 'true'); checkLogin();
    } else alert('Chyba!');
}
function logout() { sessionStorage.removeItem('isLoggedIn'); checkLogin(); }

async function renderAdminList() {
    const list = document.getElementById('admin-post-list');
    list.innerHTML = '<li>Načítám...</li>';
    const blogs = await fetchBlogs();
    list.innerHTML = '';
    blogs.forEach(b => {
        list.innerHTML += `<li class="admin-post-item"><span>${b.title}</span><button class="delete-btn" onclick="deleteBlog(event, '${b.id}')">Smazat</button></li>`;
    });
}
async function deleteBlog(e, id) {
    if(confirm("Smazat?")) {
        e.target.innerText = "Mažu...";
        await fetch(API_URL + "?action=delete&id=" + id, { method: "POST", redirect: "follow" });
        renderAdminList(); 
    }
}
async function addNewBlog(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.innerText = "Odesílám...";
    const dateObj = new Date(document.getElementById('new-date').value);
    const months = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
    const obj = {
        id: Date.now().toString(),
        title: document.getElementById('new-title').value,
        date: `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`,
        excerpt: document.getElementById('new-excerpt').value,
        image: document.getElementById('new-image').value,
        content: document.getElementById('new-content').value.replace(/\n/g, '<br>')
    };
    await fetch(API_URL + "?action=add", { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, redirect: "follow", body: JSON.stringify(obj) });
    document.getElementById('add-blog-form').reset(); renderAdminList(); btn.innerText = "Publikovat";
}

document.addEventListener('DOMContentLoaded', () => {
    renderIndexGrid();
    renderBlogPageGrid();
    renderSingleArticle();
    checkLogin();
});
