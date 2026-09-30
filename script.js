const API_URL = "/api/blogs";

let quillEditor;
let allBlogs = [];
let currentPage = 1;
const blogsPerPage = 6;
let editingBlogId = null;

const DEFAULT_BLOGS = [
    {
        id: "2026052801",
        title: "Vyplatí se nyní počkat na novelu stavebního zákona, nebo raději spěchat?",
        date: "28. května 2026",
        excerpt: "Nový stavební zákon, který v základu platí od července 2024, čeká další velká revize. Sněmovní tisk č. 67, označovaný jako [...]",
        content: `
<p>Nový stavební zákon, který v základu platí od července 2024, čeká další velká revize. Sněmovní tisk č. 67, označovaný jako 13. novelizace, má přinést poměrně zásadní překopání pravidel pro drobné a jednoduché stavby na soukromých pozemcích. Ačkoliv se v kuloárech mluví o zjednodušení, realita z pohledu běžného člověka (drobného stavebníka) je jiná. Podívejme se věcně na to, jaké změny se chystají, kde se skrývají legislativní zádrhely a kdy se vám vyplatí podat žádost hned a kdy naopak počkat na nová pravidla 13. novely stavebního zákona.</p>

<h2>Na co se vyplatí počkat? Velkorysejší limity pro zahradní stavby</h2>
<p>Nejvýraznější rozdíl mezi současným stavem a chystanou novelou pocítí lidé, kteří chtějí na zahradě stavět kůlnu, dílnu nebo doplňkový objekt k rodinnému domu.</p>
<p>Dnešní realita je taková, že bez jakéhokoliv povolení můžete u domu postavit doplňkovou stavbu pouze do 40 m² zastavěné plochy a 5 m výšky, s jedním nadzemním podlažím, podsklepenou max. do 3 metrů, minimálně 2 m od hranic pozemku (nutnou podmínkou je také soulad s územně plánovací dokumentací a obecnými stavebními předpisy).</p>
<p>Chystaná novela posouvá plošný limit až na 60 m² zastavěné plochy a nově se k jednomu nadzemnímu podlaží výslovně povoluje i podkroví. Přiznejme si, že to už skýtá mnohem více možností.</p>
<p><strong>Praktický dopad:</strong> Pokud plánujete stavbu většího zahradního domku s podkrovní trucovnou nebo prostorné dvojgaráže (která se do 40 m² vejde jen těžko a současný zákon ji navíc z drobných staveb vyjímal), dnes byste museli projít kompletním povolovacím procesem. V tomto případě se jednoznačně vyplatí s realizací počkat. Pohlídejte si ovšem i nezbytné výše uvedené soulady. To že je stavba dle stavebního zákona možná ve volném režimu ještě neznamená, že nenarazíte na jiný právní předpis, kde bude nutné splnit požadavky jiné vyhlášky nebo zákona (typicky když se staví na pozemku, na který zasahuje nějaké ochranné pásmo).</p>
<p>U skleníků a zapuštěných bazénů se naopak nic nemění, tam limit zůstává na 40 m² s dvoumetrovým odstupem, takže zde na termín účinnosti novely brát ohled nemusíte.</p>

<h2>S čím naopak pospíchat? Pozor na přísnější digitální diktát</h2>
<p>Zatímco v rozměrech staveb novela polevuje, v byrokracii a formě podání naopak přitvrzuje. To s sebou nese rizika pro lidi, kteří si chtějí vyřizovat povolení sami a „po staru“.</p>
<p>Dnešní realita je taková, že žádost o povolení stavby (např. rodinného domu) si můžete podat buď elektronicky, nebo stále ještě klasicky v papírové podobě na podatelně úřadu.</p>
<p>Chystaná novela má zavést striktní digitální úkon. Pokud je součástí podání dokumentace pro povolení záměru (což u rodinného domu je vždy), nebo pokud máte automaticky zřízenou datovou schránku, papírování již nebude možné. Vše bude muset jít výhradně digitálně přes Portál stavebníka.</p>
<p><strong>Praktický dopad:</strong> Pokud nejste technicky zdatní, Portál stavebníka vám k srdci nepřirostl a chcete si dokumentaci na úřad donést osobně v deskách, podávejte žádost hned. Po účinnosti novely vás úřad s papírovým formulářem bez milosti odmítne.</p>

<h2>Skryté zádrhely: Sliby vs. realita</h2>
<p>Novela sice láká na to, že pro rodinné domy (jednoduché stavby) nebude povinná dokumentace pro provádění stavby (postačí ta pro povolení), a že při nečinnosti úřadu dostanete zpět správní poplatek. To zní lákavě, ale má to háček. Bez prováděcí dokumentace se dům staví těžko, stavební firmy ji pro nacenění a realizaci detaily stejně často vyžadují, takže úspora peněz za projekt může být v praxi spíše iluzorní. Navíc tlak na vracení poplatků při nedodržení lhůt může vést k tomu, že úředníci raději vaši žádost před vypršením lhůty formálně přeruší kvůli sebemenší chybě, jen aby o peníze nepřišli.</p>

<h2>Kdy je nyní lepší podat žádost?</h2>
<p>Navrhovaná účinnost novely byla původně plánována na 1. července 2026, ale legislativní proces se protahuje, takže reálnější je spíše srpen či září. Tady je tady shrnutí obou východisek, zda čekat nebo mít naspěch:</p>
<ul>
<li><strong>PODAT ŽÁDOST HNED</strong> se vyplatí, pokud stavíte klasický rodinný dům, máte připravený projekt a preferujete papírovou komunikaci s úřadem. Na nic nečekejte, dokud platí přechodná ustanovení umožňující využít starší typy dokumentace.</li>
<li><strong>POČKAT JE LEPŠÍ</strong>, pokud máte v plánu garáž, větší kůlnu, dílnu nebo zahradní domek s podkrovím v rozmezí 40 až 60 m². Zde vám pár měsíců čekání ušetří tisíce korun za projekt, správní poplatky a hlavně měsíce čekání na schválení úřadem.</li>
</ul>
<p>Ušetříte přesně 5 000 Kč. Pokud byste takovou stavbu povolovali dnes, úřad ji posoudí jako jednoduchou stavbu a vyvstane povinnost zaplatit správní poplatek za vydání povolení v hodnotě 5 000 Kč. Po novelizaci ST 67 se tyto objekty stanou drobnými stavbami, které žádné povolení nevyžadují, a poplatek tak bude nulový.</p>
<p>Ušetříte minimálně 30 až 90 dní čistého času na úřadech. Zákonná lhůta pro vydání rozhodnutí u jednoduché stavby je 30 dní. V praxi se však toto řízení velmi často protahuje. Pokud úřad nařídí ústní jednání nebo se jedná o složitější případ, může lhůtu usnesením prodloužit o dalších 30 dní. V případě, že je v řízení velký počet účastníků (např. více sousedů), může úřad lhůtu prodloužit dokonce až o 60 dní. K tomu je nutné připočítat čas na samotnou přípravu a podání žádosti.</p>
<p>Po nabytí účinnosti novelizace ST 67 se pro stavby v rozmezí 40 až 60 m² celý tento úřední proces zcela maže. Stavba se stane drobnou stavbou, což znamená, že nemusíte na úřad posílat vůbec nic a můžete začít stavět ihned. Ušetříte tak dny a měsíce čekání, které byste jinak strávili čekáním na oficiální papír od stavebního úřadu.</p>
`
    },
    {
        id: "2026051601",
        title: "Co přináší norma EN 17210?",
        date: "16. května 2026",
        excerpt: "Když se řekne „bezbariérový přístup“, většina lidí si možná představí rampu pro vozíčkáře. Tento pojem je však mnohem obsáhlejší. Pojďme se podívat, jak se jím zabývá norma EN 17210 s názvem Přístu",
        content: `
<p>Když se řekne „bezbariérový přístup“, většina lidí si možná představí rampu pro vozíčkáře. Tento pojem je však mnohem obsáhlejší. Pojďme se podívat, jak se jím zabývá norma EN 17210 s názvem Přístupnost a využitelnost zastavěného prostředí – Funkční požadavky, jejíž účinnost platí od 09/2021.</p>
<p>Přístupnost se ale týká celé populace – například maminek s kočárky, lidí, kteří si zlomili nohu na lyžích a chodí dočasně o berlích, i našich prarodičů, kterým už neslouží zrak nebo hůře chodí.</p>
<p>Evropa (a s ní i Česko) proto přichází s novým přístupem, jak přístupnost prostředí řešit. Už nepůjde o to „splnit povinná procenta“, ale o skutečné usnadnění života. Zde jsou ty nejdůležitější změny, pojďme se na ně podívat.</p>

<h2>FLEXIBILITA MÍSTO STRNULOSTI</h2>
<p>Doposud se přístupnost staveb (třeba úřadů nebo nových bytovek) řešila tak, že se v zákoně či vyhlášce napsalo: „rampa musí mít sklon XY a dveře šířku XY.“ Jenže stavební právo se mění tak rychle, že tyto paragrafy často zastarávaly dříve, než se dům vůbec postavil.</p>
<p>Nový systém využívá výlučný odkaz na evropskou normu EN 17210. To znamená, že zákon pouze řekne: „Stavba musí být přístupná,“ a konkrétní technické detaily se převezmou z této normy, kterou neustále aktualizují špičkoví odborníci z celé Evropy. Výsledek? Modernější stavby, které reagují na skutečné potřeby lidí, ne na zastaralé odstavce v zákoně či národní normě.</p>

<h2>Princip „DesignU pro všechny“ (Design for All)</h2>
<p>Tohle je filozofický posun, který pocítíme všichni. Starý přístup dělal z přístupnosti „něco navíc“, často i něco velmi nákladného. Například se postavil bytový dům a k němu se složitě dodělávala plošina. Nová norma prosazuje, aby se vše již od začátku navrhovalo tak, aby to mohl pohodlně používat úplně každý bez nutnosti speciálních úprav. Je to ostatně i ekonomičtější řešení.</p>
<p>Představte si to jako automatické otevírání dveří v supermarketu. Nemusíte tlačit do dveří, vyvíjet sílu k otevření, průchod je plynulý. Dnes to můžeme ocenit všichni, když jdeme s plnými taškami s nákupem. A přesně takto se mají nově navrhovat např. veřejné prostory, chodníky či interiéry.</p>

<h2>Přístupnost jako řetězec: Když chybí jeden článek, padá celek</h2>
<p>Nová pravidla zavádějí pojem „řetězec přístupnosti“. Co to znamená? Že vám nepomůže sebekrásnější bezbariérový úřad, pokud k němu vede chodník s vysokými obrubníky, nebo pokud na parkovišti chybí vyhrazené místo.</p>
<p>Norma se dívá na celou cestu uživatele jako na jeden celek:</p>
<ul>
<li>Jak vystoupíte z auta nebo autobusu,</li>
<li>jak projdete prostranstvím před budovou,</li>
<li>jak projdete hlavními dveřmi a najdete správné patro,</li>
<li>a zda na místě zvládnete sami bez cizí pomoci vyřídit to, co potřebujete.</li>
</ul>

<h2>Myslí se i na duševní pohodu a orientaci</h2>
<p>Staré předpisy řešily hlavně centimetry pro invalidní vozíky. Nová evropská norma myslí i na lidi s rozmanitými hendikepy – například na seniory s počínající demencí, lidi s autismem nebo ty, kteří mají slabý zrak či sluch.</p>
<p>Velký důraz se proto klade na logické uspořádání prostor, čitelné navigační systémy, správné osvětlení (které neoslňuje) a dobrou akustiku. Cílem je, aby se člověk v budově necítil ztracený, zmatený nebo ve stresu.</p>

<h2>OD GLOBÁLNÍHO K LOKÁLNÍMU</h2>
<p>V makro měřítku je tedy nejvýše položený a také nejvšeobecnější filosofií Design pro všechny (Design for all). Dále následuje ČSN EN 17210 (Evropský funkční standard), poté lokální česká norma – konkrétně ČSN 73 4001.</p>
<p>Evropská norma (EN 17210) záměrně neříká, že rampa musí mít sklon přesně 8,33 %. Místo toho definuje funkční požadavek: „Sklon rampy musí být takový, aby umožnil samostatný a bezpečný pohyb osobě na invalidním vozíku nebo osobě s berlemi.“</p>
<p>Česká norma (73 4001) pak tento funkční požadavek vezme a pro české projektanty ho přetaví do konkrétního čísla: „Maximální podélný sklon rampy je 1:12 (8,33 %).“</p>

<h2>SHRNUTÍ</h2>
<p>Zavedení této evropské normy do praxe tedy znamená, že se z přístupnosti stává standardem, nikoliv luxusem či otravnou povinností pro investory. Očekává se, že stavby, které podle ní vzniknou, budou jednodušší na používání pro děti, unavené rodiče, lidi s nákupem i seniory. Je to krok směrem k urbanizovanému prostředí, která nás v našem každodenním životě nebude omezovat, ale naopak nám život usnadní.</p>
<p>Filozofie Design for all je mi osobně velmi blízká. Moje vlastní zkušenost z různých životních fází a situací potvrzuje, že pokud se při návrhu prostředí nezohlední potřeby různých potencionálních uživatelů, dříve či později na to doplatíme. To, co se při projektování jeví jako detail, se v určité situaci může proměnit v nepříjemnou či dokonce nepřekonatelnou bariéru.</p>
`
    },
    {
        id: "2026050901",
        title: "Cesta k úspornému bydlení",
        date: "9. května 2026",
        excerpt: "Způsob, jakým ji realizujeme stavby nejen pro bydlení, se za poslední čtyři desetiletí proměnil k nepoznání. Zatímco v 80. letech minulého století byla energetická náročnost budov spíše teoretickým",
        content: `
<p>Způsob, jakým ji realizujeme stavby nejen pro bydlení, se za poslední čtyři desetiletí proměnil k nepoznání. Zatímco v 80. letech minulého století byla energetická náročnost budov spíše teoretickým pojmem a hlavní roli hrála tloušťka zdi, dnes se nacházíme v éře budov s téměř nulovou spotřebou energie, digitálních stavebních deníků či dynamicky se měnících požárních norem. Tento vývoj není jen o materiálech, ale o celkové filozofii, jakou k našemu vystavěnému prostředí přistupujeme.</p>

<h2>Evoluce zateplování: Od HERAKLITU k hi-tech izolacím</h2>
<p>Pohled do historie nás vrací k materiálům, které dnes působí jako technický skanzen, přesto tvořily základ našeho nízkoenergetického snažení. Mezi první izolanty patřil Heraklit, dřevovláknitá deska s cementovým pojivem, která se v kombinaci s polystyrenem prodávala pod názvem Lignopor. Tyto sendviče, populární v 70. a 80. letech, sloužily jako adhezní můstky pro tehdejší omítky, protože polystyren tehdy nebylo možné přímo omítat. Teprve po roce 1990 nastoupily moderní certifikované systems ETICS, které umožnily nanášet tenkovrstvé omítky přímo na izolant.</p>
<p>Spolu s materiály se dramaticky měnily i tloušťky izolantů. V 90. letech se zateplovalo „pětkou“ nebo „osmičkou“ polystyrenu, což dnes působí úsměvně. Dnešní standardy pro rodinné i panelové domy se pohybují mezi 16 až 22 centimetry izolace. S touto tloušťkou se ale do hry dostává požární bezpečnost. U budov s požární výškou nad 22,5 metru již polystyren nesmí být použit a nastupuje minerální vata. U nižších domů se pak musí vytvářet požární pásy z nehořlavé vaty nad okny, aby se plameny nešířily do vyšších pater.</p>

<h2>Tepelná technika a komfort uvnitř domu</h2>
<p>Změna součinitelů prostupu tepla (U) je rovněž fascinující. Pokud srovnáme obvodovou stěnu z roku 1980 s dnešním standardem, zjistíme, že historická konstrukce propouští zhruba pětkrát více tepla. Zatímco v roce 1980 byla hodnota U u stěny kolem 1,20 W/m2K, dnes cílíme na hodnoty mezi 0,18 až 0,25 W/m2K. Podobně přísné jsou nároky na střechy či na podlahy na terénu. V interiéru navrhujeme teploty kolem 20 °C pro obývací pokoje a 24 °C pro koupelny, to už je standard naší generace, ale ještě mnozí z našich rodičů pamatují drsnější časy, kdy se ráno mohli probudit do velmi mrazivého rána pod zavalitou péřovou duchnou. Také díky těsným obálkám domů je dnes nezbytností zřizovat nucené větrání s rekuperací, aby v domě zůstal čerstvý vzduch a to ideálně bez zbytečných tepelných ztrát.</p>

<h2>K pasivnímu standardU</h2>
<p>V 80. letech se tepelná izolace prakticky neřešila. Standardem byla plná cihla nebo plynosilikát a hlavní roli hrála tloušťka zdiva, nikoliv jeho izolační schopnosti. Zlom přišel s postupným zpřísňováním norem (zejména řady ČSN 73 0540), které reagovaly na energetické krize a snahu o udržitelnost.</p>
<p>Zde je srovnání vývoje součinitele prostupu tepla U [W/m2K]. Čím nižší je hodnota U, tím lépe konstrukce izoluje.</p>
<p>Konstrukce | Stav kolem r. 1980 | Požadavek r. 2002 | Dnešní standard (U rec)<br>
Obvodová stěna | ~ 1,20 | 0,38 | 0,18 – 0,25<br>
Plochá střecha | ~ 0,80 | 0,24 | 0,11 – 0,16<br>
Podlaha na terénu | ~ 1,10 | 0,45 | 0,22 – 0,30</p>

<h2>Klíčové milníky</h2>
<ul>
<li><strong>80. léta:</strong> Izolace byla minimální, často se používal jen škvárobeton nebo vzduchové mezery.</li>
<li><strong>Po roce 2000:</strong> Nástup masivního zateplování polystyrenem a minerální vatou. Normy začaly rozlišovat hodnoty „požadované“ a „doporučené“.</li>
<li><strong>Současnost:</strong> Dnešní legislativa (vyhláška o energetické náročnosti budov) nás fakticky směřuje k hodnotám, které byly dříve považovány za nadstandardní nebo pasivní.</li>
</ul>

<h2>Teplota v interiéru: Od přetápění k efektivitě</h2>
<p>Zatímco obálka budovy se dramaticky změnila, naše vnímání tepelné pohody v interiéru zůstává relativně stabilní, ovšem s větším důrazem na regulaci. Výpočtové vnitřní teploty pro navrhování otopných soustav se v čase příliš neměnily, ale změnila se přesnost, s jakou s nimi pracujeme.</p>
<p>Standardní návrhové teploty dle ČSN:</p>
<ul>
<li>Obývací pokoj: 20 °C (v praxi uživatelé často nastavují 22 °C).</li>
<li>Ložnice: 18–20 °C (v moderních domech je díky těsné obálce těžší udržet ložnici výrazně chladnější než zbytek domu bez větrání).</li>
<li>Koupelna: 24 °C (požadavek na vyšší komfort při hygieně).</li>
</ul>
<p>Změna v přístupu: Dříve se „topilo na plno“ a teplota se regulovala okny. Dnes je standardem zónová regulace a systémy nuceného větrání s rekuperací tepla, které udržují stabilní teplotu i kvalitu vzduchu (CO2) bez zbytečných ztrát.</p>

<h2>Trendy do budoucna: Co nás čeká?</h2>
<p>Směr, kterým se tepelná technika ubírá, je jasně definován evropskou strategií a technologickým pokrokem:</p>
<ul>
<li><strong>Uhlíková neutralita:</strong> Nebude se řešit jen to, kolik energie dům spotřebuje při provozu, ale kolik emisí CO2 vzniklo při výrobě samotných izolací a cihel (tzv. svázaná energie).</li>
<li><strong>Ochrana proti přehřívání:</strong> S postupující klimatickou změnou se těžiště norem přesouvá ze „zimního vytápění“ na „letní chlazení“. Požadavky na stínění a tepelnou stabilitu v létě budou přísnější.</li>
<li><strong>Aktivní obálky:</strong> Fasády, které teplo nejen drží, ale i vyrábějí (integrovaná fotovoltaika) nebo dynamicky mění své vlastnosti podle slunečního svitu.</li>
<li><strong>Přírodní materiály:</strong> Návrat k izolacím na bázi dřevovlákna, konopí nebo slámy, které mají vynikající fázový posun (vhodné právě proti letnímu přehřívání).</li>
</ul>
<p>Závěr: Pokud srovnáme dům z roku 1980 a 2026, zjistíme, že dnešní stavba má zhruba 5× menší tepelnou ztrátu. To, co bylo dříve považováno za sci-fi, je dnes zákonným minimem pro získání stavebního povolení.</p>
`
    },async function fetchBlogs() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            let combined = data && data.length > 0 ? data : [];
            
            DEFAULT_BLOGS.forEach(db => {
                if (!combined.find(cb => cb.id === db.id)) {
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
            <div>
                <button style="background:#3b82f6; margin-right:5px;" onclick="editBlog('${blog.id}')">Upravit</button>
                <button onclick="deleteBlog(event, '${blog.id}')">Smazat</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function editBlog(id) {
    const blog = allBlogs.find(b => b.id === id);
    if (!blog) return;
    
    editingBlogId = blog.id;
    document.getElementById('new-title').value = blog.title;
    document.getElementById('new-excerpt').value = blog.excerpt;
    document.getElementById('new-date').required = false;
    document.getElementById('new-date').value = "";
    quillEditor.root.innerHTML = blog.content;
    
    document.getElementById('publish-btn').innerText = "Uložit změny";
    document.getElementById('cancel-edit-btn').style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editingBlogId = null;
    document.getElementById('add-blog-form').reset();
    quillEditor.setContents([]);
    document.getElementById('new-date').required = true;
    document.getElementById('publish-btn').innerText = "Publikovat článek";
    document.getElementById('cancel-edit-btn').style.display = "none";
}

async function deleteBlog(event, id) {
    if(confirm("Smazat článek z databáze?")) {
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
    const dateInput = document.getElementById('new-date').value;
    const excerpt = document.getElementById('new-excerpt').value;
    const contentHtml = quillEditor.root.innerHTML; 

    const months = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
    let formattedDate = "";

    if (editingBlogId) {
        const originalBlog = allBlogs.find(b => b.id === editingBlogId);
        if (dateInput) {
            const dateObj = new Date(dateInput);
            formattedDate = `${dateObj.getDate()}. ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        } else {
            formattedDate = originalBlog.date;
        }
    } else {
        const dateObj = new Date(dateInput);
        formattedDate = `${dateObj.getDate()}. ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }

    const newBlog = {
        id: editingBlogId || Date.now().toString(),
        title: title,
        date: formattedDate,
        excerpt: excerpt,
        content: contentHtml 
    };

    const actionType = editingBlogId ? "edit" : "add";

    try {
        await fetch(API_URL, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ action: actionType, blog: newBlog }) 
        });
        cancelEdit(); 
        await renderAdminList();
        alert(editingBlogId ? 'Článek úspěšně upraven.' : 'Článek úspěšně publikován.');
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
