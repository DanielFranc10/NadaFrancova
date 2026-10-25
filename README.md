# Web Ing. arch. Nadi Francové, Ph.D.

Statický web na Cloudflare Pages + blog s administrací + Project Tracker. Články, fotky i projekty trackeru se ukládají do Cloudflare D1 databáze `nadafrancova-blog`. Google tabulka, Apps Script, GitHub repo `blog-fotky`, Render ani MongoDB už nejsou potřeba.

## Struktura

| Soubor | Co dělá |
|---|---|
| `index.html`, `blog.html`, `clanek.html`, `o-mne.html`, `sluzby.html`, `reference.html` | veřejné stránky |
| `style.css`, `script.js` | vzhled a načítání článků |
| `admin.html`, `admin.css`, `admin.js` | administrace (blog editor, změna hesla, Project Tracker) |
| `functions/api/[[path]].js` | serverové API (přihlášení, články, obrázky, projekty trackeru) – Cloudflare Pages Function |
| `functions/project/[id].js` | odkaz pro klienta `/project/<id>` (tracker jen pro čtení) |
| `tracker/` | Project Tracker (původní aplikace upravená na D1 a přihlášení z administrace) |
| `data/seed-posts.json` | původní články; použijí se jen jednou, když je databáze prázdná |
| `_routes.json` | funkce běží jen na `/api/*` a `/project/*`, zbytek webu je statický (zdarma) |
| `_headers` | bezpečnostní hlavičky |

## Nasazení (jednorázově)

1. Nahraj obsah této složky do GitHub repa webu (nahraď staré soubory, `udrzba.js` už se nepoužívá).
2. Cloudflare dashboard → **Workers & Pages** → projekt webu → **Settings** → **Bindings** → **Add** → **D1 database**
   - Variable name: `DB`
   - D1 database: `nadafrancova-blog`
   - Ulož. Nastav pro **Production** (a klidně i Preview).
3. Spusť nové nasazení (nový commit, nebo **Deployments → Retry deployment**). Binding se projeví až po novém nasazení.
4. Build settings zůstávají: Framework preset *None*, Build command prázdný, Build output directory `/`.

Když `/api/posts` vrací „Chybí propojení s databází“, chybí krok 2–3.

## Administrace

- Adresa: `/admin.html` (nebo klik na © v patičce).
- Jméno `francova`, heslo bylo předáno zvlášť. Po prvním přihlášení ho změň tlačítkem **Změnit heslo**.
- Po 8 špatných pokusech se přihlášení na 15 minut zablokuje.
- Články: přidat, upravit, smazat, uložit jako koncept (není vidět na webu).
- Fotky: tlačítko obrázku v liště editoru, přetažení nebo Ctrl+V. Velké fotky se před nahráním samy zmenší na max. 1920 px.
- Neuložená rozepsaná verze se průběžně ukládá v prohlížeči a po zavření okna jde obnovit.
- Ctrl+S uloží článek.

## Project Tracker

- V administraci záložka **Project Tracker** (nebo přímo `/tracker/`, funguje jen přihlášeným).
- Klientský odkaz má tvar `https://<web>/project/<id>` a ukazuje projekt jen pro čtení.
- Převzetí dat ze starého trackeru: v záložce tlačítko **Převzít projekty ze starého trackeru**. Stáhne projekty z `project-tracker-esni.onrender.com` a uloží je do D1. Stačí jednou; opakování přepíše projekty se stejným ID.
- Po převzetí můžeš službu na Renderu vypnout. Heslo k MongoDB bylo veřejně v kódu původního repa, takže ho v MongoDB Atlas změň nebo databázi smaž.

## Lokální spuštění

```bash
npx wrangler pages dev . --d1 DB=local
```

Lokální databáze je oddělená od ostré; články se do ní nahrají ze `data/seed-posts.json`. Heslo lokálně není nastavené (vlož si ho do tabulky `settings`, klíč `admin_hash`).

## Limity (bezplatný tarif)

D1: 5 GB, 5 milionů čtení denně. Jeden obrázek max. 1,9 MB (editor fotky zmenšuje automaticky).
