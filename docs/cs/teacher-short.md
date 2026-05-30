# Stručná příručka pro učitele

Tato aplikace slouží k procvičování práce s informačními systémy na konkrétních úkolech. Učitel může připravit nebo upravit ukázkový systém, nastavit v něm chyby, otázky a kontroly splnění a studenti potom ve studentské verzi hledají problémy, opravují komponenty, pracují s daty a odpovídají na zadané otázky.

Tento návod popisuje nejjednodušší způsob použití aplikace: učitel vezme předpřipravený systém, upraví nebo vytvoří úkoly a potom nasadí studentskou verzi aplikace, kterou pošle studentům. Není potřeba vytvářet celý informační systém od začátku, typický postup je upravit připravený systém `Školní tábor Pálava` podle vlastní výuky.

## 1) Základní myšlenka

Aplikace má dvě verze:

- `STUDENT`: studentská verze, ve které studenti úkoly řeší. Webovou aplikaci se studentskou verzí si můžete vyzkoušet zde: https://zeverou.github.io/information-system-learning-app-student
- `TEACHER`: učitelská verze, ve které připravujete systém a úkoly a zároveň se z ní lze přepnout do studentské verze a zpět. Webovou aplikaci s učitelskou verzí si můžete vyzkoušet zde: https://zeverou.github.io/information-system-learning-app-teacher

## 2) Nasazení studentské a učitelské verze

### Nasazení přes GitHub Pages

Nejjednodušší způsob, jak nasadit studentskou a učitelskou verzi, je použít GitHub Pages. Pro rychlé nasazení stačí použít fork repozitáře s aplikací:

1. Přihlaste se na GitHub a otevřete repozitář aplikace: https://github.com/sol239/information-system-learning-app

2. Klikněte na tlačítko `Fork` a vytvořte kopii repozitáře pod svým GitHub účtem. Repozitář nechte veřejný (`public`), aby šel jednoduše publikovat přes GitHub Pages.

3. V novém forku přejděte do `Settings` -> `Pages` a v části `Source` vyberte `GitHub Actions`.

4. V nastavení repozitáře přejděte do `Secrets and variables` -> `Actions` -> `Variables` a vytvořte dvě proměnné:
   - `NUXT_PUBLIC_APP_MODE` s hodnotou `TEACHER` pro učitelskou verzi, nebo `STUDENT` pro studentskou verzi,
   - `NUXT_APP_BASE_URL` s hodnotou `/<nazev-repozitare>`, například `/information-system-learning-app`.

5. Spusťte nasazení ručně v záložce `Actions`. Otevřete workflow `deploy.yml`, klikněte na `Run workflow`, vyberte větev `main` a potvrďte spuštění.

6. Po dokončení nasazení bude aplikace dostupná na adrese:

```text
https://<vase-github-uzivatelske-jmeno>.github.io/<nazev-repozitare>/
```

Pokud chcete mít studentskou i učitelskou verzi dostupnou současně, je potřeba mít dva samostatné repozitáře, například `information-system-learning-app-teacher` a `information-system-learning-app-student`. GitHub neumožňuje vytvořit dva forky stejného repozitáře pod jedním účtem. V jednom repozitáři nastavte `NUXT_PUBLIC_APP_MODE` na `TEACHER`, ve druhém na `STUDENT`.

Pokud používáte jen jeden repozitář, můžete mezi verzemi přepínat změnou proměnné `NUXT_PUBLIC_APP_MODE`. Po každé změně je potřeba znovu spustit workflow `deploy.yml` přes `Run workflow`.

Podrobnější návod k nasazení je v dokumentu [`teacher.md`](./teacher.md).



## 3) Jak fungují úkoly

Každý úkol má dvě části: **Aktivitu** a **Dokončení**.

**Aktivita** je první část úkolu. Student zde typicky hledá problém, vybírá správné vysvětlení nebo opravuje komponentu systému.

Typy aktivit:

- `Výběr komponent`: student označí komponenty, které podle něj způsobují problém.
- `Vybrat možnost`: student vybere správnou odpověď nebo vysvětlení.
- `Oprava komponent`: student upraví chybnou komponentu, například její HTML, CSS, JavaScript nebo SQL.

**Dokončení** je druhá část úkolu. Kontroluje, zda student opravdu splnil cíl úkolu, například něco zjistil, správně odpověděl nebo změnil stav databáze.

Typy dokončení:

- `Po dokončení aktivity`: úkol skončí po splnění aktivity.
- `Po aktualizaci databáze`: aplikace ověří stav databáze pomocí SQL dotazu.
- `Výběr možností`: student vybere správné možnosti.
- `Napsat správně`: student napíše přesnou odpověď.

Při tvorbě úkolu je důležité napsat studentovi jasné zadání, nastavit správnou kontrolu a přidat zpětnou vazbu, aby po vyřešení věděl, co bylo cílem.

Podrobnější návod k tvorbě a fungování úkolů je v dokumentu [`teacher.md`](./teacher.md).

## 4) Úprava předpřipraveného systému

Po otevření učitelské verze přejděte na stránku se systémy. Zde můžete přidat systém a vybrat předpřipravený systém `Školní tábor Pálava`. Tento systém je připravený jako ukázka a dá se upravit pro vlastní výuku.

Po vstupu do systému uvidíte vlevo samotný informační systém a vpravo učitelské ovládání. Pro úpravu úkolů použijte tlačítko `Návrhář`, které otevře stránku `/designer`.

Na stránce návrháře můžete:

- upravit existující úkoly,
- vytvořit nový úkol,
- smazat nepotřebné úkoly,
- nastavit úrovně úkolů,
- vybrat stránky, které student při úkolu uvidí,
- nastavit bodování, zpětnou vazbu a kontroly splnění.

Hotový systém si můžete stáhnout jako `.zip` pomocí tlačítka `Stáhnout systém`. Tento ZIP lze později znovu nahrát nebo použít jako připravený systém pro studentskou verzi.

Předpřipravený systém `Školní tábor Pálava` obsahuje tyto ukázkové úkoly:

- `Nejstarší účastník`: student má určit věk nejstaršího účastníka.
- `Množství různých jídel v systému`: student má najít komponentu, která chybně zobrazuje počet jídel v systému.
- `Alergeny účastníka`: student má opravit alergeny účastnice Denisy Kolmanové tak, aby obsahovaly sezam i mléko.
- `Barva štítku alergenů`: student má opravit barvu štítku podle toho, zda má účastník uvedený alergen.
- `Seřazení účastníků podle příjmení`: student má seřadit účastníky podle příjmení.
- `Délka turnusu`: student má určit, kolik dní trvá srpnový turnus.
- `Naplnění turnusu`: student má zjistit, kdy má turnus dostat stav `SKORO PLNO`.
- `Jméno vedoucího`: student má upravit jméno vedoucího na `Tomáš Garrigue Masaryk`.

## 5) Nahrání systému

Pokud chcete, aby byl upravený systém dostupný jako předpřipravený systém přímo v nasazené aplikaci, je potřeba ho přidat do repozitáře aplikace. Systém stažený v kroku 4 pomocí tlačítka `Stáhnout systém` můžete vložit do adresáře `public/systems` buď jako rozbalenou složku, nebo přímo jako `.zip` archiv.

Rozbalená složka systému by měla obsahovat soubory jako `config.json`, `create_schema.sql` a `system_components.json`. Název složky nebo souboru `.zip` musíte zapsat do souboru `public/systems/manifest.json`, aby se systém studentovi spustil.

Například, pokud jste stáhli systém `muj-system.zip` a vložili ho do `public/systems`, přidejte do `manifest.json` tento záznam:

```json
{
  "systems": [
    "muj-system.zip"
  ]
}
```

Alternativně, pokud jste rozbalili systém do složky `muj-system`, přidejte tento záznam:

```json
{
  "systems": [
    "muj-system"
  ]
}
```

Buď si repozitář klonujte a upravte lokálně, nebo použijte GitHub webové rozhraní pro úpravu souborů.

Důležité: v souboru `manifest.json` musí být uveden pouze jeden systém, ne více systémů najednou. Aplikace nepodporuje, aby si student mohl vybrat z více systémů, proto musí být v manifestu vždy jen jeden záznam.

## 7) Poznámky

Podrobnější příručka pro učitele je v dokumentu [`teacher.md`](./teacher.md). Obsahuje detailnější popis nasazení, konfigurace aplikace, tvorby systémů a práce s úkoly.
