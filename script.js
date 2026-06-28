const API_URL = "https://script.google.com/macros/s/AKfycbyeM7NNWBm-Pc75pVBEwpyqfXjqodJ_hyD-ufo50xbd9XQT0K1u6FIer77tWC4oTK7j/exec";

let currentPage = 1;
const blogsPerPage = 6;

async function fetchBlogs() {
    try {
        const response = await fetch(API_URL + "?action=read&t=" + new Date().getTime());
        return await response.json();
    } catch (err) {
        console.error("Chyba při načítání:", err);
        return [];
    }
}

async function renderBlogGrid(page = 1) {
    currentPage = page;
    const container = document.getElementById('dynamic-blog-grid');
    const pagination = document.getElementById('pagination-container');
    if (!container) return;

    container.innerHTML = '<p style="grid-column: span 3; text-align: center;">Načítám data z databáze...</p>'; 
    const blogs = await fetchBlogs();
    container.innerHTML = ''; 

    if (!blogs || blogs.length === 0) {
        container.innerHTML = '<p style="grid-column: span 3; text-align: center;">Zatím nejsou publikovány žádné články.</p>';
        if (pagination) pagination.innerHTML = '';
        return;
    }

    const start = (currentPage - 1) * blogsPerPage;
    const end = start + blogsPerPage;
    const currentBlogs = blogs.slice(start, end);

    currentBlogs.forEach((blog) => {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.innerHTML = `
            <h3><a href="clanek.html?id=${blog.id}">${blog.title}</a></h3>
            <p>${blog.excerpt}</p>
            <time>${blog.date}</time>
        `;
        container.appendChild(article);
    });

    renderPagination(blogs.length);
}

function renderPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / blogsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => renderBlogGrid(i);
        paginationContainer.appendChild(btn);
    }
}

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

    list.innerHTML = '<li>Načítám data...</li>';
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
            await fetch(API_URL + "?action=delete&id=" + id, { method: "POST", redirect: "follow" });
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
    btn.innerText = "Odesílám...";
    btn.disabled = true;

    const title = document.getElementById('new-title').value;
    const date = document.getElementById('new-date').value;
    const excerpt = document.getElementById('new-excerpt').value;
    const image = document.getElementById('new-image').value;
    const content = document.getElementById('new-content').value;

    const dateObj = new Date(date);
    const months = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;

    const newBlog = {
        id: Date.now().toString(),
        title: title,
        date: formattedDate,
        excerpt: excerpt,
        image: image,
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
        alert('Publikováno!');
    } catch (err) {
        alert("Chyba.");
    }

    btn.innerText = "Publikovat článek";
    btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    renderBlogGrid();
    renderSingleArticle();
    checkLogin();
});
