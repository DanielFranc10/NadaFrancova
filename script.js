// TVOJE UNIKÁTNÍ ADRESA Z GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbyeM7NNWBm-Pc75pVBEwpyqfXjqodJ_hyD-ufo50xbd9XQT0K1u6FIer77tWC4oTK7j/exec";

// Funkce pro stažení článků z tabulky
async function fetchBlogs() {
    try {
        const response = await fetch(API_URL + "?action=read");
        return await response.json();
    } catch (err) {
        console.error("Chyba při načítání dat z Google Tabulky:", err);
        return [];
    }
}

// --- Vykreslení Mřížky (blog.html) ---
async function renderBlogGrid() {
    const container = document.getElementById('dynamic-blog-grid');
    if (!container) return;

    container.innerHTML = '<p>Načítám články...</p>'; // Loading state
    const blogs = await fetchBlogs();
    container.innerHTML = ''; 

    if (blogs.length === 0) {
        container.innerHTML = '<p>Zatím zde nejsou žádné články.</p>';
        return;
    }

    let currentColumn = document.createElement('div');

    blogs.forEach((blog, index) => {
        if (index > 0 && index % 2 === 0) {
            container.appendChild(currentColumn);
            currentColumn = document.createElement('div');
        }

        const article = document.createElement('article');
        article.className = 'post-card';
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

// --- Vykreslení detailu (clanek.html) ---
async function renderSingleArticle() {
    const container = document.getElementById('dynamic-article');
    if (!container) return;

    container.innerHTML = '<p>Načítám článek...</p>';
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
        container.innerHTML = `<h1>Článek nenalezen</h1><p>Tento článek neexistuje nebo byl smazán.</p><a href="blog.html">Zpět na blog</a>`;
    }
}

// --- Administrace ---
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

    list.innerHTML = '<li>Načítám články ze serveru...</li>';
    const blogs = await fetchBlogs();
    list.innerHTML = '';

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
    if(confirm("Opravdu chcete tento článek trvale smazat? Zmizí i z tabulky.")) {
        const btn = event.target;
        btn.innerText = "Mažu...";
        btn.disabled = true;

        try {
            await fetch(API_URL + "?action=delete&id=" + id, { method: "POST" });
            await renderAdminList(); // Překreslí seznam
        } catch (err) {
            alert("Chyba při mazání!");
            btn.innerText = "Smazat";
            btn.disabled = false;
        }
    }
}

async function addNewBlog(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]');
    btn.innerText = "Publikuji...";
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
        // Odešle data do Google Tabulky
        await fetch(API_URL + "?action=add", {
            method: "POST",
            body: JSON.stringify(newBlog)
        });

        document.getElementById('add-blog-form').reset();
        await renderAdminList();
        alert('Článek byl úspěšně zapsán do tabulky a publikován na web!');
    } catch (err) {
        alert("Chyba při odesílání do tabulky!");
    }

    btn.innerText = "Publikovat článek";
    btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    renderBlogGrid();
    renderSingleArticle();
    checkLogin();
});