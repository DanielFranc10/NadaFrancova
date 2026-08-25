const API_URL = "https://script.google.com/macros/s/AKfycbyeM7NNWBm-Pc75pVBEwpyqfXjqodJ_hyD-ufo50xbd9XQT0K1u6FIer77tWC4oTK7j/exec";

const GITHUB_TOKEN = "VLOZ_NOVY_TOKEN"; 
const GITHUB_USER = "DanielFranc10"; 
const GITHUB_REPO = "blog-fotky"; 

let quillEditor;

async function fetchBlogs() {
    try {
        const response = await fetch(API_URL + "?action=read&t=" + new Date().getTime());
        return await response.json();
    } catch (err) {
        return [];
    }
}

async function renderBlogGrid() {
    const container = document.getElementById('dynamic-blog-grid');
    if (!container) return;

    container.innerHTML = '<p style="grid-column: span 4; text-align: center;">Načítám data z databáze...</p>'; 
    const blogs = await fetchBlogs();
    container.innerHTML = ''; 

    if (!blogs || blogs.length === 0) {
        container.innerHTML = '<p style="grid-column: span 4; text-align: center;">Na webu zatím nejsou publikovány žádné články.</p>';
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
        initQuillEditor();
        renderAdminList();
    } else {
        loginSection.style.display = 'block';
        adminSection.style.display = 'none';
    }
}

function login() {
    if (document.getElementById('admin-user').value === 'francova' && document.getElementById('admin-pass').value === '654321') {
        sessionStorage.setItem('isLoggedIn', 'true'); checkLogin();
    } else alert('Špatné jméno nebo heslo!');
}

function logout() { sessionStorage.removeItem('isLoggedIn'); checkLogin(); }

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    
    document.getElementById('tab-' + tabId).style.display = 'block';
    event.target.classList.add('active-tab');
}

async function renderAdminList() {
    const list = document.getElementById('admin-post-list');
    if (!list) return;

    list.innerHTML = '<li>Načítám data...</li>';
    const blogs = await fetchBlogs();
    list.innerHTML = '';

    if (!blogs || blogs.length === 0) {
        list.innerHTML = '<li>Zatím žádné články.</li>';
        return;
    }

    blogs.forEach(blog => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; margin-bottom: 5px; border-radius: 6px; border: 1px solid #cbd5e1;";
        li.innerHTML = `
            <span><strong>${blog.title}</strong> (${blog.date})</span>
            <button class="delete-btn" onclick="deleteBlog(event, '${blog.id}')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Smazat</button>
        `;
        list.appendChild(li);
    });
}

async function deleteBlog(event, id) {
    if(confirm("Smazat článek z databáze?")) {
        event.target.innerText = "Mažu...";
        try {
            await fetch(API_URL + "?action=delete&id=" + id, { method: "POST", redirect: "follow" });
            renderAdminList(); 
        } catch (err) {
            alert("Chyba při mazání.");
        }
    }
}

function initQuillEditor() {
    if(quillEditor) return; 
    
    quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'], 
                    ['clean']
                ],
                handlers: {
                    image: uploadImageToGitHub 
                }
            }
        }
    });
}

function uploadImageToGitHub() {
    const range = quillEditor.getSelection(true);
    const index = range ? range.index : 0;

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = reader.result.split(',')[1];
            const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
            const fileName = `img_${Date.now()}_${safeName}`; 
            const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/blog-images/${fileName}`;

            try {
                alert("Nahrávám obrázek na GitHub. Vyčkejte na dokončení.");
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Upload obrázku: ${fileName}`,
                        content: base64Content
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/blog-images/${fileName}`;
                    quillEditor.insertEmbed(index, 'image', rawUrl);
                } else {
                    alert("Chyba GitHubu: " + data.message);
                }
            } catch (err) {
                alert("Nepodařilo se připojit k GitHub API.");
            }
        };
    };
}

async function addNewBlog(event) {
    event.preventDefault();
    const btn = document.getElementById('publish-btn');
    btn.innerText = "Odesílám do tabulky..."; btn.disabled = true;

    const title = document.getElementById('new-title').value;
    const date = document.getElementById('new-date').value;
    const excerpt = document.getElementById('new-excerpt').value;
    const contentHtml = quillEditor.root.innerHTML; 

    const dateObj = new Date(date);
    const months = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;

    const newBlog = {
        id: Date.now().toString(),
        title: title,
        date: formattedDate,
        excerpt: excerpt,
        image: "", 
        content: contentHtml 
    };

    try {
        await fetch(API_URL + "?action=add", {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            redirect: "follow",
            body: JSON.stringify(newBlog)
        });
        
        document.getElementById('add-blog-form').reset();
        quillEditor.setContents([]); 
        await renderAdminList();
        alert('Článek byl nahrán do databáze.');
    } catch (err) {
        alert("Chyba při odesílání do Google Tabulky.");
    }
    btn.innerText = "Publikovat článek"; btn.disabled = false;
}

window.seedDatabase = async function() {
    const originalBlogs = [
        { id: "1", title: "Vyplatí se nyní počkat na novelu stavebního zákona, nebo raději spěchat?", date: "28 května, 2026", excerpt: "Nový stavební zákon, který v základu platí od července 2024, čeká další velká revize...", image: "", content: "<p>Ačkoliv se v kuloárech mluví o zjednodušení, realita z pohledu běžného člověka je jiná.</p>" },
        { id: "2", title: "Dodatečné povolení stavby: Proč se nevyplatí čekat na výzvu z úřadu?", date: "18 dubna, 2026", excerpt: "Mnoho lidí žije v domnění, že pokud na svém pozemku postavili „jen“ kůlnu...", image: "", content: "<p>Mnoho lidí žije v domnění, že pokud na svém pozemku postavili „jen“ kůlnu, nic se neděje.</p>" },
        { id: "3", title: "Co přináší norma EN 17210?", date: "16 května, 2026", excerpt: "Když se řekne „bezbariérový přístup“, většina lidí si možná představí rampu...", image: "", content: "<p>Přístupnost se týká celé populace – například maminek s kočárky, lidí s dočasným zraněním.</p>" },
        { id: "4", title: "Bali – chrámová architektura (2)", date: "11 dubna, 2026", excerpt: "Balijská krajina je protkána tisíci chrámy, které tvoří duchovní kostru ostrova...", image: "", content: "<p>Balijská krajina je protkána tisíci chrámy, které tvoří duchovní kostru ostrova.</p>" },
        { id: "5", title: "Cesta k úspornému bydlení", date: "9 května, 2026", excerpt: "Způsob, jakým realizujeme stavby nejen pro bydlení, se za poslední čtyři desetiletí proměnil k nepoznání.", image: "", content: "<p>Způsob, jakým realizujeme stavby nejen pro bydlení, se za poslední čtyři desetiletí proměnil.</p>" },
        { id: "6", title: "13. novelizace stavebního zákona 2026", date: "23 dubna, 2026", excerpt: "Tento článek se zaměřuje na kritické srovnání nové podoby stavebního práva...", image: "", content: "<p>Tento článek se zaměřuje na kritické srovnání nové podoby stavebního práva.</p>" }
    ];

    for (let blog of originalBlogs) {
        await fetch(API_URL + "?action=add", { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, redirect: "follow", body: JSON.stringify(blog) });
    }
    alert("Původní články byly obnoveny. Obnov stránku.");
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dynamic-blog-grid')) renderBlogGrid();
    if (document.getElementById('dynamic-article')) renderSingleArticle();
    checkLogin();
});
