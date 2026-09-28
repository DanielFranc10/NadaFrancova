const API_URL = "/api/blogs";

let quillEditor;
let allBlogs = []; 
let currentPage = 1;
const blogsPerPage = 6; 

const DEFAULT_BLOGS = [
    {
        id: "2026041001",
        title: "Bali - promlouvající architektura (1)",
        date: "10 dubna, 2026",
        excerpt: "Existuje mnoho architektonických směrů, které kladou důraz na estetiku, funkci, harmonii či jsou podřízeny vyšším řádům...",
        content: `<p>Existuje mnoho architektonických směrů, které kladou důraz na estetiku, funkci, harmonii či jsou podřízeny vyšším řádům, ale na mě osobně nejvíce zapůsobila architektura balijská. Jeví se mi, že je významově naplněná až „po okraj“.</p>
        <p>Nepřestává mne fascinovat a cítím z ní neobyčejný klid a harmonii, která pramení z hlubokého pocitu pokory člověka a propojení s duchovním světem i přírodou.</p>
        <h2>Duchovní kořeny a vlivy</h2>
        <p>Balijská architektura je neodmyslitelně spjata s tzv. „balijským hinduismem„. Klíčovým prvkem je snaha o dosažení rovnováhy mezi božskými silami, lidmi a přírodou. Design byl v historii ovlivněn především hinduistickým učením z Indie a obdobím říše Majapahit.</p>
        <h2>Rozeklaná brána (Gapura Bentar)</h2>
        <p>Ikonickým symbolem balijské architektury je rozeklaná brána, známá jako Gapura Bentar. Skládá se ze dvou zrcadlových struktur, které vypadají jako hora rozdělená vpůli. Tento tvar symbolizuje posvátnou horu Meru (Sumeru) a představuje přechod z profánního vnějšího světa do posvátného vnitřního prostoru.</p>`
    },
    {
        id: "2026040901",
        title: "Plánujete stavět či kupovat pozemek pro určitý záměr?",
        date: "9 dubna, 2026",
        excerpt: "Koupě parcely je pro většinu z nás životní investicí. Aby se však váš sen o bydlení neproměnil v noční můru, vyplatí se věnovat pár hodin vlastní rešerši...",
        content: `<p>Koupě parcely je pro většinu z nás životní investicí. Aby se však váš sen o bydlení neproměnil v noční můru, vyplatí se věnovat pár hodin vlastní rešerši ještě předtím, než podepíšete kupní smlouvu nebo postavíte například pergolu nebo garáž.</p>
        <h2>1. Kdy je třeba projekt a povolení?</h2>
        <p>Stavební zákon prošel v posledních letech velkými změnami. Jde například o velmi malé kůlny nebo bazény za dodržení určitých podmínek. Pozor: I tyto stavby musí být v souladu s územním plánem a obecnými požadavky na výstavbu!</p>
        <h2>2. Zkontrolujte si katastr a územní plán</h2>
        <p>Podívejte se, zda na pozemku neváznou věcná břemena nebo ochranná pásma. Ta mohou výrazně omezit plochu, kde smíte stavět. Najděte si webovou stránku obce a zjistěte si, do jaké funkční plochy váš pozemek patří.</p>`
    },
    {
        id: "2026040601",
        title: "Projekt není jen výkres: Co všechno se děje, než „padne“ razítko?",
        date: "6 dubna, 2026",
        excerpt: "Mnoho investorů si představuje, že cesta k vlastní stavbě je přímočará: architekt/projektant nakreslí jejich vizi, dá na ni razítko...",
        content: `<p><strong>Nejde jen o výkres</strong></p>
        <p>Mnoho investorů si představuje, že cesta k vlastní stavbě je přímočará: architekt/projektant nakreslí jejich vizi, dá na ni razítko a tím je hotovo. Realita je ale mnohem komplexnější proces, kde samotné kreslení tvoří jen špičku ledovce.</p>
        <h2>Zásadní je územní plán</h2>
        <p>Prvním krokem projektanta není překreslování skic od stavebníka, ale důkladná analýza, zda je záměr v souladu s územním plánem. Projektant musí např. zjistit, zda je daný záměr v lokalitě přípustný.</p>
        <h2>Jednání s „dotčenými orgány“</h2>
        <p>Když má projekt jasné obrysy, přichází klíčová fáze – získání stanovisek např. od hasičů, hygieny či památkářů. Povolení stavby není jen administrativní formalita, ale odborně náročná činnost.</p>`
    },
    {
        id: "2019111001",
        title: "Tvorba vizualizací a zákresů",
        date: "10 listopadu, 2019",
        excerpt: "Pro vaši představu vytvořím zákres pergoly, zimní zahrady nebo markýzy do fotografie nebo její 3D model včetně nejbližšího okolí...",
        content: `<p>Pro vaši představu vytvořím zákres pergoly, zimní zahrady nebo markýzy do fotografie nebo její 3D model včetně nejbližšího okolí. V druhé variantě je možné výrobek vidět z ptačí perspektivy.</p>`
    }
];

async function fetchBlogs() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            let combined = data && data.length > 0 ? data : [];
            
            DEFAULT_BLOGS.forEach(db => {
                if (!combined.find(cb => cb.id == db.id)) {
                    combined.push(db);
                }
            });
            return combined;
        }
    } catch (err) {
        console.warn("Nacitam vychozi clanky.");
    }
    return DEFAULT_BLOGS;
}

async function renderBlogGrid() {
    const container = document.getElementById('dynamic-blog-grid');
    if (!container) return;

    if (allBlogs.length === 0) {
        allBlogs = await fetchBlogs();
    }

    allBlogs.sort((a, b) => Number(b.id) - Number(a.id));
    container.innerHTML = ''; 
    container.className = 'three-col-grid';

    const paginationControls = document.getElementById('pagination-controls');
    const isHomePage = !paginationControls;

    let displayBlogs = [];
    if (isHomePage) {
        displayBlogs = allBlogs.slice(0, blogsPerPage);
    } else {
        const startIndex = (currentPage - 1) * blogsPerPage;
        displayBlogs = allBlogs.slice(startIndex, startIndex + blogsPerPage);
    }

    displayBlogs.forEach((blog) => {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.innerHTML = `
            <div class="post-card-content">
                <div class="blog-category">Architektura</div>
                <h3><a href="clanek.html?id=${blog.id}">${blog.title}</a></h3>
                <div class="blog-meta">${blog.date}</div>
                <p>${blog.excerpt}</p>
            </div>
        `;
        container.appendChild(article);
    });

    if (!isHomePage) renderPagination();
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(allBlogs.length / blogsPerPage);
    
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        btn.onclick = () => {
            currentPage = i;
            document.getElementById('dynamic-blog-grid').innerHTML = '';
            renderBlogGrid();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        paginationContainer.appendChild(btn);
    }
}

async function renderSingleArticle() {
    const container = document.getElementById('dynamic-article');
    if (!container) return;

    container.innerHTML = '<p>Otevírám článek...</p>';
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');
    
    allBlogs = await fetchBlogs();
    const blog = allBlogs.find(b => b.id.toString() === blogId.toString());

    if (blog) {
        document.title = `${blog.title} | Blog`;
        container.innerHTML = `
            <h1>${blog.title}</h1>
            <div class="meta">${blog.date}</div>
            <div class="article-content">${blog.content}</div>
        `;
    } else {
        container.innerHTML = `<h1>Článek nenalezen</h1><p>Neexistuje nebo byl stažen.</p><a href="blog.html">← Zpět na blog</a>`;
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
    } else alert('Špatné heslo!');
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
    allBlogs = await fetchBlogs();
    allBlogs.sort((a, b) => Number(b.id) - Number(a.id));
    list.innerHTML = '';

    if (!allBlogs || allBlogs.length === 0) {
        list.innerHTML = '<li>Zatím žádné články.</li>';
        return;
    }

    allBlogs.forEach(blog => {
        const li = document.createElement('li');
        li.className = 'admin-list-item';
        li.innerHTML = `
            <span><strong>${blog.title}</strong> (${blog.date})</span>
            <button onclick="deleteBlog(event, '${blog.id}')">Smazat</button>
        `;
        list.appendChild(li);
    });
}

async function deleteBlog(event, id) {
    if(confirm("Smazat článek z databáze? Výchozí články v kódu smazat nelze.")) {
        event.target.innerText = "Mažu...";
        try {
            await fetch(API_URL, { 
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", id: id })
            });
            await renderAdminList(); 
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
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'], 
                ['clean']
            ]
        }
    });
}

async function addNewBlog(event) {
    event.preventDefault();
    const btn = document.getElementById('publish-btn');
    btn.innerText = "Odesílám..."; btn.disabled = true;

    const title = document.getElementById('new-title').value;
    const date = document.getElementById('new-date').value;
    const excerpt = document.getElementById('new-excerpt').value;
    const contentHtml = quillEditor.root.innerHTML; 

    const dateObj = new Date(date);
    const months = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
    const newId = Date.now().toString();

    const newBlog = {
        id: newId,
        title: title,
        date: formattedDate,
        excerpt: excerpt,
        content: contentHtml 
    };

    try {
        await fetch(API_URL, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ action: "add", blog: newBlog }) 
        });
        document.getElementById('add-blog-form').reset();
        quillEditor.setContents([]); 
        await renderAdminList();
        alert('Článek úspěšně publikován.');
    } catch (err) {
        alert("Chyba připojení na API.");
    }
    btn.innerText = "Publikovat článek"; btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dynamic-blog-grid')) renderBlogGrid();
    if (document.getElementById('dynamic-article')) renderSingleArticle();
    checkLogin();
});
