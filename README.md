# Aplikace pro hledání chyb v informačních systémech

[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Webová výuková aplikace pro procvičování práce s informačními systémy. Student v ní prochází připravený systém, hledá chybné komponenty, ověřuje data v databázi a podle zadání opravuje HTML, CSS, JavaScript nebo SQL. Učitel může systémy nahrávat, upravovat, vytvářet úkoly a exportovat hotový balíček pro studenty.

Projekt je klientská Nuxt aplikace. Databáze běží v prohlížeči přes `sql.js`, stav systému se ukládá lokálně do IndexedDB a výukové systémy je možné distribuovat jako ZIP soubory nebo jako rozbalené složky v `public/systems`.

## Obsah

- [Funkce](#funkce)
- [Technologie](#technologie)
- [Rychlý start](#rychlý-start)
- [Režimy aplikace](#režimy-aplikace)
- [Konfigurace](#konfigurace)
- [Struktura projektu](#struktura-projektu)
- [Formát výukového systému](#formát-výukového-systému)
- [Vývoj komponent a úkolů](#vývoj-komponent-a-úkolů)
- [Testování a kvalita](#testování-a-kvalita)
- [Nasazení](#nasazení)
- [Dokumentace](#dokumentace)
- [Licence](#licence)
- [Kontakt](#kontakt)

## Funkce

- Učitelský a studentský režim řízený proměnnou prostředí.
- Import výukového systému ze ZIP souboru.
- Automatické načtení předpřipravených systémů z `public/systems/manifest.json`.
- Lokální perzistence systémů, postupu a nastavení přes IndexedDB a Pinia persisted state.
- Editor komponent s bloky pro HTML, CSS, JS, SQL, `js_click` a `sql_click`.
- Návrhář úkolů s aktivitami typu oprava, výběr komponenty a výběr odpovědi.
- Více způsobů dokončení úkolu: okamžité dokončení, kontrola textové odpovědi, výběr možností, kontrola databázové změny a kontrola proměnných.
- Viditelnost stránek podle vybraného úkolu a úrovně.
- Integrovaný náhled databázových tabulek a volitelné spouštění SQL dotazů.
- Export upraveného systému zpět do ZIP balíčku.
- Lokalizace do češtiny a angličtiny.

## Technologie

- [Nuxt 4](https://nuxt.com/) a Vue 3 jako aplikační framework.
- TypeScript pro aplikační logiku a modely.
- [Nuxt UI](https://ui.nuxt.com/) a Tailwind CSS 4 pro rozhraní.
- Pinia a `pinia-plugin-persistedstate` pro stav aplikace.
- `sql.js` pro SQLite databázi přímo v prohlížeči.
- Dexie/IndexedDB pro lokální ukládání systémů.
- JSZip pro import a export systémů.
- Monaco editor pro úpravu kódu.
- Vitest, Cypress a Playwright pro testování.

## Rychlý start

Požadavky:

- Node.js 20 nebo novější.
- npm.
- Git.

Instalace:

```bash
git clone https://github.com/sol239/information-system-learning-app.git
cd information-system-learning-app
npm install
```

Vytvořte `.env` podle režimu, který chcete spustit:

```env
NUXT_PUBLIC_APP_MODE=TEACHER
NUXT_APP_BASE_URL=/information-system-learning-app
```

Spuštění vývojového serveru:

```bash
npm run dev
```

Výchozí adresa aplikace je:

```text
http://localhost:3000/information-system-learning-app
```

Pokud Nuxt použije jiný port, přesnou adresu vypíše terminál.

## Režimy aplikace

### Učitelský režim

```env
NUXT_PUBLIC_APP_MODE=TEACHER
```

Učitel může spravovat systémy, vybírat komponenty, vytvářet a upravovat úkoly, zobrazit systém pohledem studenta, resetovat systém a exportovat hotový ZIP balíček.

### Studentský režim

```env
NUXT_PUBLIC_APP_MODE=STUDENT
```

Student pracuje pouze s připravenými úkoly a stránkami, které jsou pro aktuální úkol dostupné. Upravitelné části komponent závisí na konfiguraci aplikace a konkrétního úkolu.

## Konfigurace

Konfigurace je načítána v `nuxt.config.ts` přes runtime config.

| Proměnná | Výchozí hodnota | Význam |
| --- | --- | --- |
| `NUXT_PUBLIC_APP_MODE` | prázdná hodnota | `TEACHER` zapne učitelský režim. Jiná hodnota spouští studentský pohled. |
| `NUXT_PUBLIC_HTML_AVAILABLE` | `true` | Zobrazí editor HTML. |
| `NUXT_PUBLIC_CSS_AVAILABLE` | `true` | Zobrazí editor CSS. |
| `NUXT_PUBLIC_JS_AVAILABLE` | `true` | Zobrazí editor JS. |
| `NUXT_PUBLIC_SQL_AVAILABLE` | `true` | Zobrazí editor SQL. |
| `NUXT_PUBLIC_JS_CLICK_AVAILABLE` | `false` | Povolí editor JS akcí po kliknutí. |
| `NUXT_PUBLIC_SQL_CLICK_AVAILABLE` | `true` | Povolí editor SQL akcí po kliknutí. |
| `NUXT_APP_BASE_URL` | `/information-system-learning-app` | Base URL pro lokální běh a statické nasazení, typicky název GitHub Pages repozitáře. |

## Struktura projektu

```text
app/
  components/          Vue komponenty aplikace, editorů, task panelů a ukázkového systému
  composables/         Sdílená aplikační logika pro načítání, přípravu a synchronizaci systému
  core/                Zpracování HTML, SQL, JS a mapování databázových tabulek
  middleware/          Globální i routovací pravidla pro inicializaci, režimy a viditelnost stránek
  model/               Doménový model systému, komponent, úkolů, aktivit a dokončení
  pages/               Nuxt stránky aplikace a systémové routy
  plugins/             Inicializace komponent a synchronizační pluginy
  stores/              Pinia stores pro systémy, komponenty, zvýraznění a globální nastavení
  utils/               Práce s ZIPy, IndexedDB, sql.js, exportem a databází
docs/
  cs/                  Česká učitelská dokumentace a šablona prázdného systému
  en/                  Anglická dokumentace
public/
  systems/             Předpřipravené systémy dostupné v aplikaci
tests/
  vitest/              Unit a integrační testy
  cypress/             Cypress konfigurace, fixtures a uložené screenshoty
```

## Formát výukového systému

Výukový systém je ZIP soubor nebo složka v `public/systems`. Minimální struktura:

```text
my-system/
  config.json
  create_schema.sql
```

### `config.json`

Obsahuje metadata systemu, seznam stranek, ukoly, pocet urovni a aktualni postup. Stranky se identifikuji pomoci `route`; jejich Vue implementace je soucasti aplikace v `app/pages/systems/[id]`.

```json
{
  "id": "my-system",
  "name": "Můj informační systém",
  "language": "cs",
  "description": "Krátký popis systému.",
  "pages": [
    {
      "name": "Přehled",
      "route": "/prehled",
      "description": "Hlavní přehled.",
      "icon": "i-heroicons-home"
    }
  ],
  "tasks": [],
  "mistakesCount": 0,
  "currentLevel": 1,
  "levelCount": 1
}
```

### `create_schema.sql`

SQL skript pro vytvoření a naplnění SQLite databáze. Aplikace z něj vytvoří databázi přes `sql.js`.





Předpřipravený příklad najdete v `public/systems/skolni-tabor-palava`. Prázdná šablona je v `docs/cs/empty-system-template`.

## Vývoj komponent a úkolů

Komponenty jsou definované modelem `Component` a vykreslované přes `ComponentWrapper`. Zjednodušený tok vykreslení:

```text
SQL dotazy komponenty
  -> sqlVariables
  -> sloučení s generalVariables a jsVariables
  -> nahrazení proměnných v HTML/CSS
  -> vykreslení komponenty ve stránce systému
```

Úkoly jsou reprezentované třídou `Task`. Každý úkol má aktivitu, typ dokončení, bodování, viditelné stránky, chybové komponenty a volitelně povolené spouštění SQL dotazů.

Detailní návod pro tvorbu komponent je v [Component Authoring Guide](docs/component-authoring-guide.md). Uživatelský návod pro učitele je v [docs/cs/teacher.md](docs/cs/teacher.md).

## Testování a kvalita

Unit a integrační testy:

```bash
npm test
```

Jednorázové spuštění Vitestu:

```bash
npx vitest run
```

Playwright:

```bash
npx playwright test
```

Cypress:

```bash
npx cypress open
```

Konfigurace Cypressu očekává aplikaci na `http://localhost:4000/information-system-learning-app`. Pokud chcete testovat přes tento port, spusťte Nuxt například takto:

```bash
npx nuxt dev --port 4000
```

Build pro produkci:

```bash
npm run build
```

Statické vygenerování:

```bash
npm run generate
```

Náhled buildu:

```bash
npm run preview
```

## Nasazení

Repozitář obsahuje workflow `.github/workflows/deploy.yml` pro GitHub Pages. Workflow:

1. nainstaluje závislosti,
2. převezme repository variables jako Nuxt proměnné prostředí,
3. spustí `npx nuxt build --preset github_pages`,
4. publikuje `.output/public` na GitHub Pages.

Pro GitHub Pages nastavte v repository variables alespoň:

```env
NUXT_PUBLIC_APP_MODE=STUDENT
NUXT_APP_BASE_URL=/nazev-repozitare
```

Pro učitelskou a studentskou verzi lze použít dva samostatné repozitáře, nebo jeden repozitář s přepínáním `NUXT_PUBLIC_APP_MODE` a opětovným spuštěním workflow.

## Dokumentace

- [Učitelská příručka](docs/cs/teacher.md)
- [Krátká učitelská příručka](docs/cs/teacher-short.md)
- [English teacher guide](docs/en/teacher.md)
- [Component Authoring Guide](docs/component-authoring-guide.md)
- [Šablona prázdného systému](docs/cs/empty-system-template)

## Licence

Projekt je licencovaný pod [GNU General Public License v3.0](LICENSE).

## Kontakt

Dotazy a připomínky: [david.valek17@gmail.com](mailto:david.valek17@gmail.com)
