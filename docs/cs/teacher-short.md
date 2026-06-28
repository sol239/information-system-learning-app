# Učitelská příručka pro používání aplikace

## O aplikaci

Jedná se o aplikaci pro hledání a opravování chyb v informačních systémech. Studenti řeší připravené úkoly v daném informačním systému, např. hledají chybné komponenty, zjišťují, proč něco nefunguje, nebo opravují nějakou komponentu - mění její HTML/JS/SQL kód. Učitel může také vytvářet vlastní úkoly a dokonce i vlastní informační systém. Studenti také mají k dispozici databázi informačního systému.

Jinak se jedná o webovou aplikaci, která je napsaná v JavaScriptu s využitím frameworku Nuxt.js. Aplikace je open-source a je dostupná [zde](https://github.com/sol239/information-system-learning-app). Není potřeba mít vlastní server, aplikace se dá nasadit zdarma například přes GitHub Pages. Aplikace má dvě verze: studentskou a učitelskou. Učitel může mezi verzemi přepínat, studenti mají k dispozici jen studentskou verzi.

---

### Způsoby používání aplikace

Aplikaci lze používat třemi způsoby:

1. Jenom řešit předpřipravené úkoly ve studentské verzi dostupné [zde](https://zeverou.github.io/information-system-learning-app-student).

2. Upravovat/přidávat úkoly v předpřipraveném systému `Školní tábor Pálava` a poté upravený systém stáhnout a nahrát ho, aby byl dostupný studentům. Pro tento krok je potřeba následovat kroky v sekci `Pokročilé části příručky`.

3. Vytvořit vlastní systém a úkoly pro něj. Tento způsob používání je náročnější a vyžaduje hlubší znalosti práce s aplikací a technologiemi, které aplikace využívá. Pro podrobnější návod k tvorbě vlastního systému a úkolů je v tomto [dokumentu](https://github.com/sol239/information-system-learning-app/blob/main/docs/cs/teacher.pdf).

---

### Verze aplikace

Aplikace má dvě verze:

- `STUDENT`: studentská verze, ve které studenti úkoly řeší. Aplikaci se studentskou verzí si můžete vyzkoušet [zde](https://zeverou.github.io/information-system-learning-app-student). Obsahuje předpřipravený systém `Školní tábor Pálava` s předpřipravenými úkoly.
- `TEACHER`: učitelská verze, ve které připravujete systém a úkoly a zároveň se z ní lze přepnout do studentské verze a zpět. Webovou aplikaci s učitelskou verzí si můžete vyzkoušet [zde](https://zeverou.github.io/information-system-learning-app-teacher).

## O úkolech

V této sekci je popsáno, jak úkoly fungují a jak je možné je upravovat. Úkoly se skládají z aktivit a dokončení. Každý úkol má nastavenou kontrolu splnění a zpětnou vazbu pro studenta.

### Jak fungují úkoly

Každý úkol má dvě části: **Aktivitu** a **Dokončení**.

**Aktivita** je první část úkolu. Student zde typicky hledá problém, vybírá správné vysvětlení nebo opravuje komponentu systému.

Typy aktivit:

- `Výběr komponent`: student označí komponenty, které podle něj způsobují problém.
- `Výběr možností`: student vybere správné možnosti.
- `Oprava komponent`: student upraví chybnou komponentu, například její HTML, CSS, JavaScript nebo SQL.

**Dokončení** je druhá část úkolu. Chyba v systému už je opravena a komponenta z aktivity už funguje správně. Student musí například odpovědět na otázku, vybrat správnou možnost nebo napsat přesnou odpověď - například napsat věk účastníka.

Typy dokončení:

- `Automatické dokončení`: úkol skončí po splnění aktivity - student nemusí nic dalšího dělat, může přejít na další úkol.
- `Po aktualizaci údajů`: aplikace ověří stav databáze pomocí SQL dotazu. Student musí například opravit chybný údaj v databázi a poté aplikace ověří, zda je údaj opravený podle SQL dotazu, který ověřuje správnost. Pokud daný SQL dotaz vrátí nějaký výsledek, tak se úkol dokončí.
- `Výběr možností`: student vybere správné možnosti.
- `Napsat správně`: student napíše přesnou odpověď, například napíše věk účastníka. Aplikace ověří, zda je odpověď správná.

#### Úrovně úkolů

Každý úkol má nějakou úroveň. Jedná se vlastně o skupiny úkolů. Například poté, co student dokončí úkoly z úrovně 1, může přejít na úkoly z úrovně 2. Úrovně se dají nastavit podle obtížnosti úkolů nebo podle toho, jaké znalosti student potřebuje k dokončení úkolu.

Při tvorbě úkolu je důležité napsat studentovi jasné zadání, nastavit správnou kontrolu a přidat zpětnou vazbu.

Podrobnější návod k tvorbě a fungování úkolů je v tomto [dokumentu](https://github.com/sol239/information-system-learning-app/blob/main/docs/cs/teacher.pdf).

---

### Předpřipravené úkoly

Předpřipravený systém `Školní tábor Pálava` obsahuje tyto ukázkové úkoly:

- `Nejstarší účastník`: student má zjistit důvod, proč komponenta zobrazující věk nejstaršího účastníka zobrazuje špatný údaj, a správně odpovědět na otázku, poté má určit věk nejstaršího účastníka.
- `Nalezení chybné komponenty`: student má zkontrolovat komponenty na stránce Nástěnka a vybrat tu, která špatně zobrazuje celkový počet jídel, poté má určit správný počet různých jídel v turnusech.
- `Alergeny účastníka`: student má zjistit, proč komponenta pro výběr alergenů účastníka nedovoluje vybrat více alergenů, poté má účastnici nastavit další alergeny.
- `Barva štítku alergenů`: student má zjistit, proč komponenta pro výběr alergenů účastníka zobrazuje špatnou barvu štítku, poté se úkol dokončí automaticky.
- `Seřazení účastníků podle příjmení`: student má zjistit důvod, proč nefunguje řazení účastníků podle příjmení, poté má určit věk konkrétního účastníka.
- `Délka turnusu`: student má opravit komponentu zobrazující délku turnusu, poté má určit délku konkrétního turnusu.
- `Naplnění turnusu`: student má opravit komponentu zobrazující naplnění turnusu, poté má určit zaplnění v konkrétním turnusu.
- `Jméno vedoucího`: student má opravit komponentu zodpovědnou za úpravu jména vedoucího, poté má upravit jméno konkrétního vedoucího.

---

### Tvorba/Úprava úkolů (v předpřipraveném systému)

Po otevření učitelské verze přejděte na stránku se systémy. Zde můžete přidat nový systém nebo vybrat předpřipravený systém `Školní tábor Pálava`. Tento systém je připravený jako ukázka a dá se upravit pro vlastní potřeby.

Po vstupu do systému uvidíte vlevo samotný informační systém a vpravo učitelské ovládání. Pro úpravu úkolů použijte tlačítko `Návrhář`, které otevře stránku `/designer`.

Na stránce návrháře můžete:

- upravit existující úkoly,
- vytvořit nový úkol,
- smazat úkoly,
- nastavit úrovně úkolů,
- vybrat stránky, které student při úkolu uvidí,
- nastavit bodování, zpětnou vazbu a kontroly splnění.

Hotový systém si můžete stáhnout jako `.zip` pomocí tlačítka `Stáhnout systém`. Tento ZIP lze později znovu nahrát nebo použít jako připravený systém pro studentskou verzi.

## Pokročilé části příručky

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

---

### Nahrání upraveného systému

Pokud chcete, aby byl upravený systém dostupný jako předpřipravený systém přímo v nasazené aplikaci, je potřeba ho přidat do repozitáře aplikace. Systém stažený pomocí tlačítka `Stáhnout systém` (např. na stránce `/designer`) můžete vložit do adresáře `public/systems` jako `.zip` archiv.

Název souboru `.zip` musíte zapsat do souboru `public/systems/manifest.json`, aby se systém studentovi spustil.

Například, pokud jste stáhli systém `muj-system.zip` a vložili ho do `public/systems`, přidejte do `manifest.json` tento záznam:

```json
{
  "systems": [
    "muj-system.zip"
  ]
}
```

Důležité: v souboru `manifest.json` musí být uveden pouze jeden systém, ne více systémů najednou. Aplikace nepodporuje (aktuálně), aby si student mohl vybrat z více systémů, proto musí být v manifestu vždy jen jeden záznam.

Po změně souborů v adresáři `public/systems` je potřeba změny commitnout, pushnout do GitHub repozitáře a znovu spustit nasazení přes GitHub Actions.

---

### Doporučený postup

Pokud se rozhodnete aplikaci používat způsobem č. 2 nebo 3, tak doporučuju následující postup:

1. Vytvořte si fork repozitáře s aplikací a nastavte proměnnou `NUXT_PUBLIC_APP_MODE` na `TEACHER`. Tím získáte učitelskou verzi aplikace, ve které můžete upravovat úkoly a systémy. Také upravte proměnnou `NUXT_APP_BASE_URL` na `/<nazev-repozitare>`, například `/information-system-learning-app`.

2. Vytvořte si vlastní systém a úkoly, nebo upravte předpřipravený systém `Školní tábor Pálava`. Po dokončení úprav si systém stáhněte jako `.zip` archiv.

3. Upravený systém nahrajte do repozitáře aplikace do adresáře `public/systems` a zapište jeho název do souboru `public/systems/manifest.json`. Ještě změňte verzi aplikace `NUXT_PUBLIC_APP_MODE` na `STUDENT`. Po těchto změnách v repozitáři je potřeba změny commitnout, pushnout a znovu spustit nasazení přes GitHub Actions.

---

### Poznámky

Podrobnější příručka pro učitele je v tomto [dokumentu](https://github.com/sol239/information-system-learning-app/blob/main/docs/cs/teacher.pdf).
