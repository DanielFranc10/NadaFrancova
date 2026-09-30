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
        content: `<p>Nový stavební zákon, který v základu platí od července 2024, čeká další velká revize. Sněmovní tisk č. 67, označovaný jako 13. novelizace, má přinést poměrně zásadní překopání pravidel pro drobné a jednoduché stavby na soukromých pozemcích. Ačkoliv se v kuloárech mluví o zjednodušení, realita z pohledu běžného člověka (drobného stavebníka) je jiná. Podívejme se věcně na to, jaké změny se chystají, kde se skrývají legislativní zádrhely a kdy se vám vyplatí podat žádost hned a kdy naopak počkat na nová pravidla 13. novely stavebního zákona.</p>

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
<p>Po nabytí účinnosti novelizace ST 67 se pro stavby v rozmezí 40 až 60 m² celý tento úřední proces zcela maže. Stavba se stane drobnou stavbou, což znamená, že nemusíte na úřad posílat vůbec nic a můžete začít stavět ihned. Ušetříte tak dny a měsíce čekání, které byste jinak strávili čekáním na oficiální papír od stavebního úřadu.</p>`
    },
    {
        id: "2026051601",
        title: "Co přináší norma EN 17210?",
        date: "16. května 2026",
        excerpt: "Když se řekne „bezbariérový přístup“, většina lidí si možná představí rampu pro vozíčkáře. Tento pojem je však mnohem obsáhlejší. Pojďme [...]",
        content: `<p>Když se řekne „bezbariérový přístup“, většina lidí si možná představí rampu pro vozíčkáře. Tento pojem je však mnohem obsáhlejší. Pojďme se podívat, jak se jím zabývá norma EN 17210 s názvem Přístupnost a využitelnost zastavěného prostředí – Funkční požadavky, jejíž účinnost platí od 09/2021.</p>
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
<p>Filozofie Design for all je mi osobně velmi blízká. Moje vlastní zkušenost z různých životních fází a situací potvrzuje, že pokud se při návrhu prostředí nezohlední potřeby různých potencionálních uživatelů, dříve či později na to doplatíme. To, co se při projektování jeví jako detail, se v určité situaci může proměnit v nepříjemnou či dokonce nepřekonatelnou bariéru.</p>`
    },
    {
        id: "2026050901",
        title: "Cesta k úspornému bydlení",
        date: "9. května 2026",
        excerpt: "Způsob, jakým ji realizujeme stavby nejen pro bydlení, se za poslední čtyři desetiletí proměnil k nepoznání. Zatímco v 80. letech [...]",
        content: `<p>Způsob, jakým ji realizujeme stavby nejen pro bydlení, se za poslední čtyři desetiletí proměnil k nepoznání. Zatímco v 80. letech minulého století byla energetická náročnost budov spíše teoretickým pojmem a hlavní roli hrála tloušťka zdi, dnes se nacházíme v éře budov s téměř nulovou spotřebou energie, digitálních stavebních deníků či dynamicky se měnících požárních norem. Tento vývoj není jen o materiálech, ale o celkové filozofii, jakou k našemu vystavěnému prostředí přistupujeme.</p>

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
<p>Závěr: Pokud srovnáme dům z roku 1980 a 2026, zjistíme, že dnešní stavba má zhruba 5× menší tepelnou ztrátu. To, co bylo dříve považováno za sci-fi, je dnes zákonným minimem pro získání stavebního povolení.</p>`
    },
    {
        id: "2026042301",
        title: "13. novelizace stavebního zákona 2026",
        date: "23. dubna 2026",
        excerpt: "Tento článek se zaměřuje na kritické srovnání nové podoby stavebního práva s důrazem na dopady 13. novelizace, která do procesu [...]",
        content: `<p>Tento článek se zaměřuje na kritické srovnání nové podoby stavebního práva s důrazem na dopady 13. novelizace, která do procesu vstoupila velmi specifickým způsobem.</p>

<h2>Legislativní smršť a „poslanecký bypass“</h2>
<p>Stávající stavební zákon (č. 283/2021 Sb.) provází od jeho přijetí neustálá řada změn, avšak aktuální 13. novelizace je v odborných kruzích vnímána jako bezprecedentní. Na rozdíl od běžného legislativního procesu totiž nevzešla z vládní dílny jako komplexní koncepce, ale vznikla formou poslaneckého návrhu (sněmovní tisk 67/0). Tímto krokem de facto „přeskočila“ standardní mezirezortní připomínkové řízení, které slouží k odfiltrování technických chyb. Podle odborných zápisů ČKAIT a memoranda profesních komor byla tato změna šita horkou jehlou bez dostatečné odborné diskuse. Výsledkem je stav, kdy 13. novela zavádí do systému dočasné „bypassy“ platné až do konce roku 2030, což vnáší značnou nejistotu do práce úřadů i plánů stavebníků.</p>

<h2>Běžný stavebník: Menší kontrola, ale i vyšší riziko</h2>
<p>Pro občana, který plánuje stavbu rodinného domu nebo rekreačního objektu, přináší novela na první pohled úlevu v podobě menší administrativy, která však může být dvousečnou zbraní. Dochází k výraznému rozvolnění u jednoduchých staveb – zákon u nich v některých případech přestává vyžadovat povinnou kolaudaci a snižuje nároky na technické parametry. To sice může zrychlit cestu k nastěhování, ale profesní komory varují před hazardem s bezpečností. Stavebník se ocitá v situaci, kdy nad jeho domem chybí finální kontrola úřadem a veškerá odpovědnost za vady nebo budoucí havárie padá výhradně na něj a jím najaté osoby. Zároveň se omezují práva sousedů na podávání námitek, což sice může omezit obstrukce, ale také to znamená, že se občan bude hůře bránit, pokud v jeho těsné blízkosti vyroste záměr, který mu zhorší kvalitu bydlení.</p>

<h2>Drobné stavby a nová definice garáže</h2>
<p>Významnou kapitolou jsou drobné stavby, které novela vyjímá z nutnosti jakéhokoliv povolování. Do této kategorie nově spadají stavby do 40 m² zastavěné plochy a do 5 m výšky, pokud splňují podmínky umístění na pozemku rodinného domu nebo stavby pro rodinnou rekreaci. Klíčovou změnou je definice garáže – pokud garáž splňuje výše uvedené rozměry, je nově považována za drobnou stavbu. V praxi to znamená, že takovou garáž lze postavit zcela bez stavebního povolení i bez ohlášení, což je značný posun. Nicméně i u těchto „volných“ staveb zůstává povinnost dodržet odstupové vzdálenosti (zpravidla 2 metry od hranice pozemku), pokud stavebník nezíská výjimku nebo souhlas souseda.</p>

<h2>Projektanti v pasti administrativního chaosu</h2>
<p>Pro profesi projektantů a architektů znamená aktuální stav především obrovský nárůst administrativní nejistoty. Ačkoliv se mluví o „jednom razítku“, realita se komplikuje zaváděním nových typů dokumentací a procesů, u nichž chybí jasná metodika. Novela navíc umožňuje, aby některé specifické části projektování (např. posuzování akceleračních oblastí) zpracovávaly do konce roku 2026 i osoby bez příslušné autorizace, pokud mají odpovídající vysokoškolské vzdělání. ČKAIT to vnímá jako přímé ohrožení odborné úrovně výstavby. Projektant je nyní nucen kličkovat mezi přechodnými ustanoveními a nést plnou odpovědnost za soulad s neustále se měnícími pravidly, aniž by měl jistotu, jak budou jednotlivé stavební úřady novou legislativu v přechodném období vykládat.</p>

<h2>Digitalizace: Systém bez jasného řádu</h2>
<p>Původní vize plné digitalizace stavebního řízení naráží s 13. novelizací na tvrdou realitu a faktické rozmělnění původních ambicí. Ačkoliv je Portál stavebníka zákonem zaveden, digitalizace v aktuálním podání ČKAIT a dalších odborníků působí spíše jako krok zpět. Jedním z největších problémů je nejednoznačnost v tom, kdy má být dokumentace do systému vlastně nahrána. Zákon sice s digitálním úložištěm počítá, ale chybí jasná metodika a termíny, což vnáší chaos do komunikace mezi projektantem, stavebníkem a úřadem. Namísto slibovaného zrychlení a transparentnosti se tak digitalizace stává dalším administrativním břemenem, které je navíc komplikováno tlakem na zápis sítí do digitálních map – přičemž platí tvrdé pravidlo, že co v systému nebude, jako by neexistovalo.</p>`
    },
    {
        id: "2026041801",
        title: "Dodatečné povolení stavby: Proč se nevyplatí čekat na výzvu z úřadu?",
        date: "18. dubna 2026",
        excerpt: "Mnoho lidí žije v domnění, že pokud na svém pozemku postavili „jen“ kůlnu, garáž nebo pergolu bez papírů, nic se [...]",
        content: `<p>Mnoho lidí žije v domnění, že pokud na svém pozemku postavili „jen“ kůlnu, garáž nebo pergolu bez papírů, nic se neděje. Opak je pravdou. Stavební úřady dnes pravidelně porovnávají stav v terénu s katastrem nemovitostí za pomoci ortofotomap (leteckých snímků). Pokud zjistí nesoulad, zahájí řízení o odstranění stavby. V ten moment začíná závod s časem. Nejde jenom o to, sehnat projektanta, který bude mít zrovna čas se vám věnovat, počítejte i s lhůtami pro různá vyjádření, které nejsou v řádů dnů, ale spíš týdnů či v horším případě v rádu měsíců.</p>

<h2>Příklady, které vás mohou nepříjemně překvapit:</h2>
<ul>
<li><strong>Drobné stavby v nesouladu:</strong> I když stavba nevyžaduje povolení, musí splňovat regulativy územního plánu obce a obecné požadavky na výstavbu – například dodržet kvótu pro maximální zastavěnost či odstup od hranice pozemku (zpravidla 2 metry). Pokud stojí blíže bez souhlasu souseda a v místě tato situace není obvyklá, může to znamenat problém.</li>
<li><strong>Nepovolený vjezd:</strong> Připojení pozemku na komunikaci podléhá schválení. Nelegální sjezd může být bezpečnostním rizikem a to i když si myslíte, že vás opravňuje dlouhodobé využívání takovéto situace.</li>
<li><strong>Stavba neevidovaná v katastru:</strong> Stavby, které nejsou evidovány v katastru nemovitostí a nemají povolení, jsou úředně „neviditelné“, dokud je neodhalí letecký snímek nebo kontrola.</li>
</ul>

<h2>Když přijde výzva: Řízení o odstranění stavby</h2>
<p>Jakmile úřad zjistí černou stavbu, zahájí z moci úřední Řízení o odstranění stavby. Vy sice máte právo požádat o její dodatečné povolení, ale lhůta pro doložení všech podkladů je velmi omezená. A to může být velmi stresující situace, obzvlášť pokud ještě to vztahu vstupujete s bankou nebo jiným obdobným subjektem, který si může také diktovat termíny či pravidla hry.</p>
<p>Kritický moment: Sehnat v šibeničním termínu projektanta, který vypracuje dokumentaci skutečného provedení, je dnes téměř nemožné. Projektanti jsou vytížení na měsíce dopředu. Kromě toho, je často nutné jednat ještě s dotčenými orgány a to, že stavba již stojí, nemusí znamenat, že splňuje požadavky, které na ní jsou kladeny. Může se tedy stát, že vám chybí vsak dešťové vody, střecha má nepovolený tvar nebo nově umístěným otvorem zasahujete požárně nebezpečným prostorem na pozemek souseda. A teď co s tím…?</p>

<h2>Legislativní labyrint a lhůty</h2>
<p>Dodatečné povolení není jen o výkresu. Musíte splnit stejné podmínky jako u novostavby, což zahrnuje:</p>
<ul>
<li><strong>Stanoviska dotčených orgánů:</strong> Například Jednotné environmentální závazné stanovisko (JES) má zákonnou lhůtu na vyjádření 60 dnů. Pokud do hry vstoupí odbor památkové péče nebo ochrana přírody, čas se dál natahuje.</li>
<li><strong>Nové standardy:</strong> I 10 let starou kůlnu musíte dnes posoudit podle aktuální legislativy. To se týká hlavně likvidace srážkových vod (vsakování na vlastním pozemku). Může se stát, že kvůli povolení staré stavby budete muset na zahradě vybudovat vsakovací jímku.</li>
<li><strong>Zemědělský půdní fond (ZPF):</strong> Pokud stavba stojí na půdě chráněné ZPF, musíte zpětně požádat o její vynětí, což znamená další úřad a poplatky.</li>
</ul>

<h2>Cesta k nápravě: Geometrický plán a katastr nemovitostí</h2>
<p>Pokud se vám podaří doložit všechny dokumenty (přičemž stanoviska a vyjádření musí být souhlasná) a úřad vydá dodatečné povolení, proces nekončí:</p>
<ol>
<li><strong>Geodetické zaměření:</strong> Pro stavbu musí geodet vypracovat geometrický plán.</li>
<li><strong>Kolaudace:</strong> Předložíte zaměření a další potřebné doklady k vydání kolaudačního rozhodnutí.</li>
<li><strong>Zápis do Katastru nemovitostí (KN):</strong> S kolaudačním souhlasem a geometrickým plánem podáte žádost na katastrální úřad.</li>
</ol>
<p>Teprve v momentě, kdy je stavba řádně zapsána v katastru, máte vyhráno a vaše nemovitost je právně „čistá“. Během tohoto procesu se připravte ještě na průběžné placení správních poplatků (jak pro činnost stavebního úřadu tak katastru nemovitostí).</p>

<h2>Moje rada na závěr</h2>
<p>Pokud máte nějakou stavbu „načerno“, nečekejte, až vám do schránky dorazí výzva. Pokud víte o takových nesrovnalostech, rovnou to začněte řešit v klidu a s předstihem. Vyhnete se tak stresu z termínů i riziku nařízení demolice.</p>`
    },
    {
        id: "2026041101",
        title: "Bali – chrámová architektura (2)",
        date: "11. dubna 2026",
        excerpt: "Balijská krajina je protkána tisíci chrámy, které tvoří duchovní kostru ostrova. Zatímco minule jsme prozkoumali obecné principy, dnes se zaměříme [...]",
        content: `<p>Balijská krajina je protkána tisíci chrámy, které tvoří duchovní kostru ostrova. Zatímco minule jsme prozkoumali obecné principy, dnes se zaměříme na to, jak je organizována víra v rámci celé komunity a jak rozpoznat svatyně, které potkáváte na každém kroku.</p>

<h2>Kahyangan Tiga: Tři pilíře balijské vesnice</h2>
<p>Každá tradiční balijská vesnice (desa adat) je duchovně ukotvena systémem tří hlavních chrámů, souhrnně nazývaných Kahyangan Tiga. Tento systém zavedl v 11. století mudrc Mpu Kuturan a jeho účelem je sjednotit vesnici a zajistit rovnováhu mezi světem bohů, lidí a silami rozkladu.</p>

<h3>Pura Puseh (Chrám původu)</h3>
<ul>
<li><strong>Charakteristika:</strong> Je zasvěcen bohu Višnuovi a zakladatelům vesnice. Představuje symbolické spojení s předky.</li>
<li><strong>Umístění:</strong> Nachází se v nejčistší části vesnice, směrem k horám (Kaja).</li>
<li><strong>Význam:</strong> Je to „hlava“ vesnice, kde se uctívá zrod a kořeny komunity.</li>
</ul>

<h3>Pura Desa (Chrám vesnice)</h3>
<ul>
<li><strong>Charakteristika:</strong> Hlavní chrám zasvěcený bohu Brahmovi. Je centrem oficiálního náboženského života a setkávání obyvatel.</li>
<li><strong>Umístění:</strong> Stojí uprostřed vesnice v neutrální zóně (Madya).</li>
<li><strong>Význam:</strong> Představuje „trup“ vesnice, místo pro každodenní rituály a správu věcí veřejných.</li>
</ul>

<h3>Pura Dalem (Chrám mrtvých)</h3>
<ul>
<li><strong>Charakteristika:</strong> Zasvěcen bohu Šivovi nebo bohyni Durze. V jeho blízkosti se vždy nachází hřbitov a kremační místa.</li>
<li><strong>Umístění:</strong> Nachází se v nejníže položené a „nečisté“ části vesnice směrem k moři (Kelod).</li>
<li><strong>Význam:</strong> Představuje „nohy“ vesnice a je spojen s procesem transformace, smrti a reinkarnace.</li>
</ul>

<h2>Architektura a vstup do posvátna</h2>
<p>Balijský chrám nepoznáte podle jedné uzavřené budovy, ale podle systému tří nádvoří (Tri Mandala), která se hierarchicky zvedají a vedou věřícího od profánního k posvátnému:</p>
<ul>
<li><strong>Nista Mandala:</strong> Vnější nádvoří pro veřejná shromáždění a přípravy.</li>
<li><strong>Madya Mandala:</strong> Střední část, kde probíhají obětní tance a rituální přípravy.</li>
<li><strong>Utama Mandala:</strong> Nejvnitřnější a nejposvátnější dvůr s věžemi Meru.</li>
</ul>

<h2>Kdo smí vstoupit?</h2>
<p>Chrámy jsou otevřeny věřícím v tradičním oděvu (nezbytný je sarong a šerpa kolem pasu). Vstup je zakázán ženám během menstruace a osobám v hlubokém zármutku (např. krátce po úmrtí v rodině), neboť jsou považováni za rituálně nečisté (sebel).</p>

<h2>Rituály a posvátný tanec</h2>
<p>Život v chrámu vrcholí během oslav výročí založení chrámu, zvaných Odalan. Kromě nekonečných procesí s obětinami jsou součástí rituálů i posvátné tance.</p>
<ul>
<li><strong>Kecak (Opičí tanec):</strong> I když je dnes často předváděn pro turisty, jeho kořeny sahají k rituálu Sanghyang, při kterém sbor mužů rytmickým skandováním „cak-cak-cak“ vyvolává stav transu k odehnání zlých sil.</li>
<li><strong>Barong a Rangda:</strong> Dramatický tanec znázorňující věčný boj mezi dobrem (Barong) a zlem (Rangda), který končí rituálním transem bojovníků s dýkami kris.</li>
</ul>

<h2>Duchové na každém rohu</h2>
<p>Kromě velkých veřejných chrámů prostupuje duchovno i soukromý prostor. Každý rodinný areál má svůj vlastní rodinný chrám (Sanggah nebo Mrajan), umístěný vždy v nejposvátnějším rohu pozemku směrem k horám.</p>
<p>Duchovní svět Balijců se neomezuje jen na stavby. Posvátná jsou i určitá místa v krajině, prameny nebo staré stromy (např. banyány), které jsou často ovinuty černobílou látkou saput poleng, symbolizující rovnováhu vesmíru. Před započetím jakékoli stavby se také provádí rituál Ngruwak Tanah, kterým se žádá bohyně země o povolení narušit půdu.</p>
<p>Příště se podíváme na to, jak vypadá život uvnitř rodinného areálu a proč má každá budova v něm své pevně dané místo.</p>`
    },
    {
        id: "2026041001",
        title: "Bali – promlouvající architektura (1)",
        date: "10. dubna 2026",
        excerpt: "Existuje mnoho architektonických směrů, které kladou důraz na estetiku, funkci, harmonii či jsou podřízeny vyšším řádům...",
        content: `<p>Existuje mnoho architektonických směrů, které kladou důraz na estetiku, funkci, harmonii či jsou podřízeny vyšším řádům, ale na mě osobně nejvíce zapůsobila architektura balijská. Jeví se mi, že je významově naplněná až „po okraj“.</p>
<p>Nepřestává mne fascinovat a cítím z ní neobyčejný klid a harmonii, která pramení z hlubokého pocitu pokory člověka a propojení s duchovním světem i přírodou. Pojďme si některé principy poodhalit a porozumět tomuto cizokrajnému architektonickému jazyku více…</p>

<h2>Duchovní kořeny a vlivy</h2>
<p>Balijská architektura je neodmyslitelně spjata s tzv. „balijským hinduismem„. Klíčovým prvkem je snaha o dosažení rovnováhy mezi božskými silami, lidmi a přírodou. Design byl v historii ovlivněn především hinduistickým učením z Indie a obdobím říše Majapahit. Na rozdíl od jiných částí Indonésie, Balijci nestaví domy na kůlech, ale na pevných základech.</p>

<h2>Asta Kosala Kosali: doslovně – „dům na míru“</h2>
<p>Asta Kosala Kosali je tradiční soubor pravidel pro uspořádání a stavbu domů a svatyní. Tento systém, často přirovnávaný k čínskému feng-shui, se nezakládá na metrech, ale na tělesných proporcích majitele.</p>
<ul>
<li>Samotný výběr „vzorové osoby“ je dán tradicí (hlava rodiny), ale kněz může zasáhnout, pokud jde o specifické kasty. Například existují pravidla, která zakazují stavět dům větší, než odpovídá kastovnímu postavení dané osoby.</li>
<li>Jednotky jako hasta (loket ke konečku prstu) nebo depa (rozpětí paží) zajišťují, že dům je v dokonalém souladu s mikrokosmem svého obyvatele.</li>
<li>Stavitel, zvaný Undagi, není jen řemeslník, ale interpret těchto posvátných pravidel, který musí rozumět i nehmotným silám (niskala).</li>
</ul>

<h2>Orientace a posvátná osa</h2>
<p>Organizace prostoru se řídí osou Kaja-Kelod (je to lokální orientace, myšleno např. pro Ubud, který se nachází v jižní části ostrova).</p>
<ul>
<li>Kaja směřuje k horám (k hoře Agung), což je říše bohů a předků (nejčistší zóna – Utama).</li>
<li>Kelod směřuje k moři, které je vnímáno jako místo rozkladu a nečistých sil (Nista).</li>
</ul>
<p>Z tohoto důvodu je rodinný chrám vždy umístěn v severovýchodním rohu areálu (Kaja-Kangin), tedy směrem k hoře a vycházejícímu slunci.</p>

<h2>Rozeklaná brána (Gapura Bentar)</h2>
<p>Ikonickým symbolem balijské architektury je rozeklaná brána, známá jako Gapura Bentar.</p>
<ul>
<li>Skládá se ze dvou zrcadlových struktur, které vypadají jako hora rozdělená vpůli.</li>
<li>Tento tvar symbolizuje posvátnou horu Meru (Sumeru) a představuje přechod z profánního vnějšího světa do posvátného vnitřního prostoru.</li>
<li>Přímo za bránou se často nachází zástěna Aling-aling, která nutí návštěvníka změnit směr; věří se, že zlí duchové neumí zatáčet a tato bariéra jim zabrání ve vstupu.</li>
</ul>

<h2>Stupňovité chrámy (Meru)</h2>
<p>Dalším fascinujícím prvkem jsou věžovité svatyně s doškovými střechami zvanými Meru.</p>
<ul>
<li><strong>Význam:</strong> Symbolizují horu Sumeru, střed vesmíru v hinduistické kosmologii.</li>
<li><strong>Počet pater:</strong> Meru mají vždy lichý počet pater (1 až 11). Počet odráží status božstva nebo předka, kterému je svatyně zasvěcena.</li>
<li><strong>Zasvěcení:</strong> Nejvyšší Meru s 11 patry jsou obvykle zasvěceny nejvyšším bohům (jako je Šiva) nebo královským předkům, zatímco nižší počty pater (např. 3 nebo 5) patří méně významným božstvům.</li>
</ul>
<p>Zajímavé jsou i samotné rodinné areály, které obsahují o rodinné chrámy, o těch ale napíšu zase příště.</p>`
    },
    {
        id: "2026040901",
        title: "Plánujete stavět či kupovat pozemek pro určitý záměr?",
        date: "9. dubna 2026",
        excerpt: "Koupě parcely je pro většinu z nás životní investicí. Aby se však váš sen o bydlení neproměnil v noční můru...",
        content: `<p>Koupě parcely je pro většinu z nás životní investicí. Aby se však váš sen o bydlení neproměnil v noční můru, vyplatí se věnovat pár hodin vlastní rešerši ještě předtím, než podepíšete kupní smlouvu nebo postavíte například pergolu nebo garáž.</p>

<h2>1. Kdy je třeba projekt a povolení?</h2>
<p>Stavební zákon prošel v posledních letech velkými změnami. Dnes se běžně můžete jako potencionální stavebník setkat s následujícími situacemi:</p>
<ul>
<li><strong>Volný režim (bez projektu a povolení):</strong> Týká se tzv. drobných staveb. Jejich přesný výčet najdete přímo v příloze č. 1 nového stavebního zákona. Jde například o velmi malé kůlny nebo bazény za dodržení určitých podmínek. Pozor: I tyto stavby musí být v souladu s územním plánem, obecnými požadavky na výstavbu a specifickými požadavky, pokud leží pozemek v ochranném pásmu (např. památkové zóny nebo železničních drah)!</li>
<li><strong>Jednoduché stavby:</strong> Sem patří většina rodinných domů. Zde už potřebujete projektovou dokumentaci pro povolení záměru.</li>
<li><strong>Prováděcí dokumentace:</strong> U vybraných jednoduchých staveb je nyní zákonná povinnost mít i prováděcí projekt, podle kterého probíhá stavba záměru. Toto se týká staveb pro bydlení a rekreaci.</li>
</ul>

<h2>2. Zkontrolujte si nejprve katastr a územní plán obce</h2>
<p>Než cokoliv zásadního podniknete, doporučuji si prověřit dvě zásadní věci, což jde velmi dobře i online:</p>
<ul>
<li><strong>Nahlížení do katastru nemovitostí (KN):</strong> Podívejte se, zda na pozemku neváznou věcná břemena nebo ochranná pásma (elektřina, plyn, vodovod, ale i les nebo dráha). Ta mohou výrazně omezit plochu, kde smíte stavět. Také uvidíte, zda pozemek náleží do zemědělského půdního fondu (ZPF).</li>
<li><strong>Územní plán (ÚP):</strong> Najděte si patřičnou webovou stránku obce a dle aktuální verze územního plánu si zjistěte, do jaké funkční plochy váš pozemek patří (např. BI – bydlení individuální). ÚP definuje, co je přípustné (např. bydlení), podmíněně přípustné (např. dílna) a co nepřípustné (např. hospodářská stavba). Dále může územní plán obsahovat další regulativy. Je např. maximální výška domu, sklon střechy, procento zastavěné plochy atd.</li>
</ul>

<h2>3. Co už nechte na specialistovi, ale ptejte se na to</h2>
<p>Existují ještě další technické zapeklitosti, které však již laik nevyřeší, ale měl by o nich vědět:</p>
<ul>
<li><strong>Sjezd a doprava:</strong> Je pozemek oficiálně napojen na komunikaci? Je v místech možnost parkování nebo lze v dostatečné kapacitě řešit v rámci vlastního pozemku?</li>
<li><strong>Likvidace dešťových vod:</strong> Likvidaci srážkových vodě je nyní nutné vyřešit na vlastním pozemku. Pouze pokud by se to prokázalo jako technicky nemožné, dá se zvažovat jiné řešení. Standardně se tato situace řeší návrhem akumulace a vsaku. A pozor, likvidace srážkových vod musí být vyřešena po celý průběh roku, tedy i v zimě, kdy mrzne!</li>
<li><strong>Zemědělský půdní fond (ZPF):</strong> Pokud je pozemek veden jako pole nebo zahrada, bude nutné vyjmout zastavěnou plochu stavbou ze ZPF, což znamená další posudek navíc.</li>
</ul>

<h2>4. Vhodná je písemná informace o požadavcích ze strany úřadů</h2>
<p>Nejste si jistí? Raději nehádejte. Máte dvě možnosti:</p>
<ul>
<li><strong>Konzultace:</strong> Zajděte si nebo zavolejte na stavební úřad a neformálně se zeptejte.</li>
<li><strong>Žádost o předběžnou informaci:</strong> Toto je oficiální nástroj. Úřad vám písemně sdělí, za jakých podmínek lze stavět a které orgány (hasiči, hygiena atd.) se k tomu budou vyjadřovat. Stejně tak můžete oslovit přímo dotčené orgány. Toto se vyplatí u problematických nebo u složitějších projects.</li>
</ul>

<h2>5. Jak vypadá povolovací proces v kostce?</h2>
<p>Pokud už máte jasno, postup je standardně následující:</p>
<ol>
<li>Zpracování projektu architektem/projektantem.</li>
<li>Žádost o stanoviska DOSS (dotčené orgány státní správy – např. životní prostředí, památkáři).</li>
<li>Zapracování připomínek těchto orgánů do projektu.</li>
<li>Podání žádosti o povolení záměru na stavební úřad.</li>
</ol>
<p>A poslední rada na závěr: Celý proces je poměrně spletitý a řešit věci zpětně jako dodatečné povolení je vždy rizikovější a stresující. Dobrá rešerše provedená na začátku záměru je tedy polovina úspěchu!</p>`
    },
    {
        id: "2026040601",
        title: "Projekt není jen výkres: Co všechno se děje, než „padne“ razítko?",
        date: "6. dubna 2026",
        excerpt: "Mnoho investorů si představuje, že cesta k vlastní stavbě je přímočará: architekt/projektant nakreslí jejich vizi, dá na ni razítko...",
        content: `<p><strong>Nejde jen o výkres</strong></p>
<p>Mnoho investorů si představuje, že cesta k vlastní stavbě je přímočará: architekt/projektant nakreslí jejich vizi, dá na ni razítko a tím je hotovo. Realita je ale mnohem komplexnější proces, kde samotné kreslení tvoří jen špičku ledovce. Co všechno musí odborník prověřit, než může vůbec podat žádost o povolení?</p>

<h2>1. Zásadní je územní plán</h2>
<p>Prvním krokem projektanta není překreslování skic od stavebníka, ale důkladná analýza, zda je záměr v souladu s územním plánem. Projektant musí např. zjistit:</p>
<ul>
<li>zda je daný záměr v dané lokalitě vůbec přípustný</li>
<li>jaké jsou regulativy funkční plochy nebo zástavby (např. maximální zastavěnost, výška hřebene, tvar střechy nebo odstupové vzdálenosti); pokud záměr není v souladu, je potřeba zjistit, jak je nutné jej upravit, aby soulad naplnil</li>
</ul>

<h2>2. Průchod labyrintem předpisů</h2>
<p>I když je stavba v souladu s územním plánem, musí splňovat mnoho dalších předpisů. např. obecné požadavky na výstavbu a další technické vyhlášky. Projektant tedy dále prověřuje např.:</p>
<ul>
<li>existenci ochranných pásem: Inženýrské sítě, dráhy, lesy či památkové zóny</li>
<li>výskyty sítí: např. vedení kanalizace, vodovodu, plynu, elektrického vedení a spojů</li>
<li>a uplatňuje požadavky závazných technických norem: bezpečnost, požární ochrana, hygienické limity aj.</li>
</ul>

<h2>3. Jednání s „dotčenými orgány“ (DOSS)</h2>
<p>Když má projekt jasné obrysy, přichází klíčová fáze – získání stanovisek např. od hasičů, hygieny, památkářů či správců sítí. Časově a často i obsahově nejnáročnější bývají památkáři a to z toho důvodu, že spolu postupně komunikují jednotlivé struktury tohoto orgánu. Konkrétně – městský odbor památkové péče dotazuje Národní památkový ústav, ten se vyjadřuje, následně městský odbor zaujímá své stanovisko s přihlédnutím k vyjádření NPÚ a vydává stanovisko své. Proces je to zhruba na 60 dní plus.</p>
<p>Proč toto nedělá stavební úřad? Stavební zákon sice umožňuje, aby si úřad stanoviska vyžádal sám, ale v praxi je to cesta k průtahům. Pokud tuto agendu řeší přímo architekt/projektant, je proces mnohem rychlejší a efektivnější.</p>

<h2>4. Umění kompromisu a garance kvality</h2>
<p>Často se stává, že úřady mají specifické požadavky a architekt či projektant zde musí působit jako mediátor. Musí najít kompromis, zapracovat připomínky do dokumentace a upravit návrh tak, aby výsledné stanovisko bylo kladné.</p>
<p>Teprve po tomto cyklu úprav je možné podat žádost o povolení záměru. Architekt či projektant přitom celou dobu garantuje, že stavba vyhovuje všem závazným normám a vyhláškám.</p>

<h2>Odpovědnost se zárukou</h2>
<p>Povolení stavby není jen administrativní formalita, ale odborně náročná činnost. Architekt či projektant tedy není jen „kreslič“, ale především odborný průvodce, který nese odpovědnost za to, že váš záměr projde schvalovacím procesem bez komplikací.</p>`
    },
    {
        id: "2019111001",
        title: "Tvorba vizualizací a zákresů",
        date: "10. listopadu 2019",
        excerpt: "Pro pro vaši představu vytvořím zákres pergoly, zimní zahrady nebo markýzy do fotografie nebo její 3D model včetně nejbližšího okolí...",
        content: `<p>Pro pro vaši představu vytvořím zákres pergoly, zimní zahrady nebo markýzy do fotografie nebo její 3D model včetně nejbližšího okolí. V druhé variantě je možné výrobek vidět z ptačí perspektivy.</p>`
    }
];

async function fetchBlogs() {
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
                <button style="background:#3b82f6; margin-right:5px; padding: 5px 10px; border-radius: 4px; color: white; border: none; cursor: pointer;" onclick="editBlog('${blog.id}')">Upravit</button>
                <button style="padding: 5px 10px; border-radius: 4px; color: white; background: #ef4444; border: none; cursor: pointer;" onclick="deleteBlog(event, '${blog.id}')">Smazat</button>
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
