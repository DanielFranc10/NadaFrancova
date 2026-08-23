const API_URL = "https://script.google.com/macros/s/AKfycbyeM7NNWBm-Pc75pVBEwpyqfXjqodJ_hyD-ufo50xbd9XQT0K1u6FIer77tWC4oTK7j/exec";

// --- NASTAVENÍ GITHUB (Pro ukládání obrázků) ---
// Vygeneruj si Personal Access Token na GitHubu (s právem 'repo')
const GITHUB_TOKEN = "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"; 
const GITHUB_USER = "DanielFranc10"; 
const GITHUB_REPO = "blog-fotky"; 
// -----------------------------------------------

let quillEditor; // Globální proměnná pro editor

// --- KOMUNIKACE S GOOGLE TABULKOU ---
async function fetchBlogs() {
    try {
        const response = await fetch(API_URL + "?action=read&t=" + new Date().getTime());
        return await response.json();
    } catch (err) {
        console.error("Chyba:", err); return [];
    }
}

// (Tady zůstávají beze změny funkce renderBlogGrid() a renderSingleArticle() z minula)
// ... Ponech ty, co už máš pro vykreslení mřížky a detailu článku na webu ...
async function renderBlogGrid() { /* tvůj kód */ }
async function renderSingleArticle() { /* tvůj kód */ }

// --- ADMINISTRACE A ZÁLOŽKY ---
function checkLogin() {
    const adminSection = document.getElementById('admin-dashboard');
    const loginSection = document.getElementById('login-screen');
    if (!adminSection || !loginSection) return;

    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        initQuillEditor(); // Spustí editor
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

async function renderAdminList() { /* tvůj kód pro seznam a mazání z minula... */ }
async function deleteBlog(event, id) { /* tvůj kód pro mazání z minula... */ }

// --- INICIALIZACE EDITORU A NAHRÁVÁNÍ NA GITHUB ---
function initQuillEditor() {
    if(quillEditor) return; // Aby se nespustil dvakrát
    
    quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'], // Tlačítko pro obrázek
                    ['clean']
                ],
                handlers: {
                    image: uploadImageToGitHub // Vlastní funkce pro obrázek
                }
            }
        }
    });
}

function uploadImageToGitHub() {
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
            const fileName = `img_${Date.now()}.png`; // Unikátní název
            const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/blog-images/${fileName}`;

            try {
                alert("Nahrávám obrázek na GitHub, prosím čekej...");
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Nahrán obrázek do blogu: ${fileName}`,
                        content: base64Content
                    })
                });

                if (response.ok) {
                    // Po úspěšném nahrání vygenerujeme Raw odkaz a vložíme do editoru
                    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/blog-images/${fileName}`;
                    const range = quillEditor.getSelection();
                    quillEditor.insertEmbed(range.index, 'image', rawUrl);
                } else {
                    const errorData = await response.json();
                    alert("Chyba GitHubu: " + errorData.message);
                }
            } catch (err) {
                alert("Nepodařilo se připojit k GitHubu.");
            }
        };
    };
}

// --- ODESLÁNÍ HOTOVÉHO ČLÁNKU DO GOOGLE TABULEK ---
async function addNewBlog(event) {
    event.preventDefault();
    const btn = document.getElementById('publish-btn');
    btn.innerText = "Odesílám do tabulky..."; btn.disabled = true;

    const title = document.getElementById('new-title').value;
    const date = document.getElementById('new-date').value;
    const excerpt = document.getElementById('new-excerpt').value;
    
    // Zde vytáhneme finální zformátovaný HTML kód z WordPress-like editoru
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
        quillEditor.setContents([]); // Vyčistí editor
        await renderAdminList();
        alert('Článek z editoru byl úspěšně nahrán!');
    } catch (err) {
        alert("Něco se pokazilo při odesílání.");
    }
    btn.innerText = "Publikovat článek"; btn.disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    // (Zde si volej své renderBlogGrid atd.)
    checkLogin();
});
