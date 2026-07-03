# Příručka pro učitele

Tato příručka slouží k tomu, jak aplikaci používat, konfigurovat, spustit i nasadit, aby k ní měli přístup studenti.

## Obsah

#### 1 Technické informace o aplikaci
#### 2 Jak aplikaci spustit
- 2.1 Lokální spuštění
- 2.2 Online nasazení
#### 3 Verze aplikace
#### 4 Učitelská verze
- 4.1 Nastavení
- 4.2 První spuštění
- 4.3 Přidání systému
- 4.4 Orientace systému
- 4.5 Možnosti učitelské verze
#### 5 Tvorba úkolů (stránka návrháře `/designer`)
- 5.1 Počet úrovní
- 5.2 Tlačítka `Náhled studenta/editoru`, `Nový úkol` a `Možnosti`
- 5.3 Úkoly
- 5.4 Sekce Detail úkolu
- 5.5 Sekce Úroveň
- 5.6 Sekce Bodování
- 5.7 Sekce Vybrané komponenty
- 5.8 Sekce Aktivita
- 5.9 Sekce Dokončení
- 5.10 Zpětná vazba
#### 6 Studentská verze
- 6.1 Nastavení
- 6.2 První spuštění
#### 7 Úkoly
- 7.1 Tvorba úkolů
- 7.2 Jak úkoly fungují
#### 8 Předpřipravený systém s úkoly
#### 9 Konfigurace
- 9.1 `NUXT_PUBLIC_APP_MODE`
- 9.2 `NUXT_PUBLIC_HTML_AVAILABLE`
- 9.3 `NUXT_PUBLIC_CSS_AVAILABLE`
- 9.4 `NUXT_PUBLIC_JS_AVAILABLE`
- 9.5 `NUXT_PUBLIC_SQL_AVAILABLE`
- 9.6 `NUXT_PUBLIC_JS_CLICK_AVAILABLE`
- 9.7 `NUXT_PUBLIC_SQL_CLICK_AVAILABLE`
- 9.8 `NUXT_APP_BASE_URL`
#### 10 Struktura adresáře systému
- 10.1 `config.json`
- 10.2 `create_schema.sql`
#### 11 Tvorba & úprava systémů
- 11.1 Úprava
- 11.2 Tvorba systému
#### 12 Nahrání systému studentům
#### 13 Zkušební verze
#### 14 Kontakt
#### 15 Odkazy

## 1 Technické informace o aplikaci

Jedná se o webovou aplikaci postavenou na frameworku Nuxt.js, který je založen na JavaScriptu a běží v prohlížeči uživatele. Aplikace je navržena tak, aby byla snadno použitelná pro učitele i studenty, a umožňuje přizpůsobení obsahu a funkcí podle potřeb výuky. 

## 2 Jak aplikaci spustit

Jedná se o webovou aplikaci, která běží přímo v prohlížeči uživatele (client-side aplikace [1]). Níže uvedu jak aplikaci spustit lokálně, ale i jak ji nasadit na server, aby k ní měli přístup studenti.

### 2.1 Lokální spuštění

#### Technické požadavky:

- Node.js (doporučuji nějakou novou verzi, např. 18+)
- NPM (mělo by být součástí Node.js)
- Git (pro klonování repozitáře)
- Textový editor (doporučuji Visual Studio Code)

#### Naklonujte repozitář

Klonování repozitáře je prostě stahnutí kódu z GitHubu (to je služba pro hostování kódu) do vašeho počítače. Otevřete terminál a spusťte:

```bash
git clone https://github.com/sol239/information-system-learning-app
```

Alternativně můžete repozitář stáhnout jako ZIP soubor a rozbalit ho na výše uvedené adrese.

#### Nainstalujte závislosti
Přejděte do složky s projektem a nainstalujte potřebné knihovny:

```bash
cd information-system-learning-app
npm install
```

#### Nastavte režim aplikace

V souboru `.env` nastavte `NUXT_PUBLIC_APP_MODE` na `TEACHER` pokud chcete spustit učitelskou verzi aplikace, Jinak nastavte `STUDENT` pro studentskou verzi. Podrobněji jsou režimy aplikace popsané v části **Verze aplikace**.

```env
NUXT_PUBLIC_APP_MODE=TEACHER
```env
NUXT_PUBLIC_APP_MODE=TEACHER
```


#### Spusťte vývojový server

Tohle je krok, kdy se aplikace spustí a bude dostupná ve vašem prohlížeči, pouze pro vás (ne pro studenty). Spusťte:

```bash
npm run dev
```

Aplikace bude pravděpodobně dostupná na adrese `http://localhost:3000/information-system-learning-app`. Můžete ji otevřít v prohlížeči a začít s ní pracovat.
Je možné, že port 3000 je již obsazený, v takovém případě se aplikace spustí na jiném portu (např. 3001) a v terminálu uvidíte zprávu, na jaké adrese je aplikace dostupná.

### 2.2 Online nasazení

Pro maximální jednoduchost doporučuji použít pro nasazení službu Pages od GitHubu, která umožňuje snadno hostovat statické webové stránky přímo z vašeho repozitáře. Alternativně lze použít i třeba jiné služby jako [Vercel](https://vercel.com/docs/frameworks/full-stack/nuxt), anebo si aplikaci nasadit na vlastní [server](https://nuxt.com/docs/4.x/getting-started/deployment). Všechny možné příručky pro nasazení jsou dostupné v oficiální [dokumentaci](https://nuxt.com/deploy)

#### Nasazení pomocí GitHub Pages

Je možné zvolit dva způsoby nasazení:

1. Dva repozitáře pro učitelskou a studentskou verzi (složitější nastavení, ale poté už není potřeba nic měnit).

2. Jeden repozitář pro obě verze (jednodušší nastavení, ale pro přepnutí mezi režimy je potřeba změnit nastavení a znovu spustit workflow pro nasazení).

V obout případech je potřeba mít účet na GitHubu. Pokud nemáte účet na [GitHubu](https://github.com/), vytvořte si ho.

##### Dva repozitáře

1. [Vytvořte](https://github.com/new) dva repozitáře, například `information-system-learning-app-teacher` a `information-system-learning-app-student`.

2. Ujistěte se, že oba repozitáře jsou veřejné (public).

3. Přejděte do nastavení `Settings` každého repozitáře, jděte do sekce `Pages` a v sekci `Source` zvolte `GitHub Actions`. Pokud to nenajdete, tak byste to měli mít na adrese: `https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>/settings/pages`


4. Přejděte v nastavení repozitáře do sekce `Secrets and variables`, zvolte podsekci `Actions`, zvolte `Variables` místo `Secrets` a klikněte na `New repository variable`.
    - Vytvořte proměnnou: `NUXT_PUBLIC_APP_MODE` s hodnotu `TEACHER` pro učitelskou verzi aplikace, anebo `STUDENT` pro studentskou verzi. 
    - Vytvořte proměnnou: `NUXT_APP_BASE_URL` s hodnotou `/<nazev-repozitare>`, například `/information-system-learning-app-student`.

Například pro repozitář `information-system-learning-app-student` by to mělo vypadat takto:

Pokud tuhle stránky s nastavením nenajdete, tak byste ji měli mít na adrese: `https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>/settings/variables/actions`

5. Naklonujte si repozitář výukové aplikace a přepněte se do něj:

```bash
git clone https://github.com/sol239/information-system-learning-app.git
cd information-system-learning-app
```

6. Přidejte oba repozitáře jako vzdálené (remote) repozitáře:

```bash
# git remote add teacher https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>.git
# Například:
git remote add teacher https://github.com/zeverou/information-system-learning-app-teacher.git
git remote add student https://github.com/zeverou/information-system-learning-app-student.git
git branch -M main
git push teacher main
git push student main
```

7. Stránky by poté měly být dostupné na adresách `https://<vase-github-uzivatelske-jmeno>.github.io/<nazev-repozitare>/`. To si můžete ověřit na adrese: `https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>/deployments/github-pages`

##### Jeden repozitář

1. [Vytvořte](https://github.com/new) jeden repozitář, například `information-system-learning-app`.

2. Ujistěte se, že repozitář je veřejný (public).

3. Přejděte do nastavení `Settings` každého repozitáře, jděte do sekce `Pages` a v sekci `Source` zvolte `GitHub Actions`. Pokud to nenajdete, tak byste to měli mít na adrese: `https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>/settings/pages`

4. Přejděte v nastavení repozitáře do sekce `Secrets and variables`, zvolte podsekci `Actions`, zvolte `Variables` místo `Secrets` a klikněte na `New repository variable`.
    - Vytvořte proměnnou: `NUXT_PUBLIC_APP_MODE` s hodnotu `TEACHER` pro učitelskou verzi aplikace, anebo `STUDENT` pro studentskou verzi. 
    - Vytvořte proměnnou: `NUXT_APP_BASE_URL` s hodnotou `/<nazev-repozitare>`, například `/information-system-learning-app`.


5. Naklonujte si repozitář výukové aplikace a přepněte se do něj:

```bash
git clone https://github.com/sol239/information-system-learning-app.git
cd information-system-learning-app
```

6. Přidejte repozitář jako vzdálený (remote) repozitář:

```bash
# git remote add teacher https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>.git
# Například:
git remote add dual https://github.com/zeverou/information-system-learning-app.git
git branch -M main
git push dual main
```

7. Stránka by poté měla být dostupná na adrese `https://<vase-github-uzivatelske-jmeno>.github.io/<nazev-repozitare>/`. To si můžete ověřit na adrese: `https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>/deployments/github-pages`

###### Jak měnit verze aplikace

Při každé změně verze apliakce musíte:

1. Změnit nastavení `NUXT_PUBLIC_APP_MODE` v proměnné prostředí (jak je popsáno výše).
2. Znovu spustit workflow pro nasazení, to můžete provést na stránce: `https://github.com/<vase-github-uzivatelske-jmeno>/<nazev-repozitare>/actions/workflows/deploy.yml` kliknutím na `Run workflow` a zvolit větev `main` a poté kliknout na `Run workflow` pro spuštění.

###### Fork repozitáře s aplikací

Pro verzi s jedním repozitářem, můžete také použít funkci `Fork` na GitHubu, která vám umožní vytvořit kopii repozitáře pod vaším účtem. Poté vám stačí provést kroky 3, 4 a je potřeba provést `Run workflow` pro nasazení, jak je popsáno výše.

---

## 3 Verze aplikace

Aplikace má dvě verze: učitelskou a studentskou. Režim se nastavuje pomocí proměnné prostředí `NUXT_PUBLIC_APP_MODE` v proměnných github repozitáře, nebo v souboru `.env` pro lokální spuštění. Pokud se proměnné v proměnných GitHub repozitáře nenajdou, tak se použijí proměnné z `.env` souboru.

## 4 Učitelská verze

V této verzi máte přístup ke správě vašich systémů a úkolů. Můžete přidávat nové systémy, přidávat úkoly, upravovat je a mazat. Tato verze je určena pro vás jako učitele, abyste mohli připravit materiály pro své studenty. Umožnuje také, přepínání mezi verzemi, abyste si mohli prohlédnout, jak bude aplikace vypadat pro studenty.

### 4.1 Nastavení

V proměnných repozitáře GitHubu vytvote proměnnou `NUXT_PUBLIC_APP_MODE` s hodnotou `TEACHER`, anebo v souboru `.env` nastavte:

```env
NUXT_PUBLIC_APP_MODE=TEACHER
``` 

### 4.2 První spuštění

Při otevření odkazu webové stránky budete přesměrování na adresu `/systems`, kde jako učitel uvidítě všechny systémy, které máte k dispozici, a můžete přidávat nové systémy pomocí tlačítka `Přidat nový systém`. Jakmile na stránce budete mít nějaké systémy, tak u nich uvidiíte tlačítko `Tužky`, které vám umožní upravit systém - upravit jeho ID, název a popis, a tlačítko `Koše`, které vám umožní systém smazat. Dále každý systém má tlačítko `Vstoupit do systému`, které vás přesměruje do systému.

### 4.3 Přidání systému

Po kliknutí se vám otevře okno pro nahrání nového systému, buď můžete nahrát `.zip` soubor reprezentující systém, anebo zvolit nějaký systém z nabídky předpřipravených systémů. Předpřipravené systémy jsou popsané v části **Předpřipravený systém s úkoly**.

### 4.4 Orientace systému

Po vstupu do systému uvidíte vaši, že vaše obrazovka je rozdělena na dvě části vertikální čárou. 
- **Část vlevo**: reprezentuje samotný systém, se kterým budou studenti pracovat. Můžete zde vidět nahoře stránky, na které se dá vstupovat, a pod nimi se nachází různé komponenty.
- **Část vpravo**: nahoře můžete vidět opět různé možnosti, které jsou popsané v části **Možnosti učitelské verze**. Pod nimi jsou úkoly, dostupné v daném systému. Můžete zde přidávat nové úkoly pomocí tlačítka `Vytvořit úkol`, a u každého úkolu se nachází tlačítko `Koše`, které vám umožní úkol smazat. Na každý úkol jde kliknout a tím jej vybrat. Poté co na něj kliknete, tak ho uvidítě v nabídce modře ohraničený a v systému vlevo uvidítě, tmavě červěně ohraničené komponenty, které jsou k úkolu přiřazené.

### 4.5 Možnosti učitelské verze

V právé části obrazovky se nachází několik možností - tlačítek, které vám umožňují různé akce:

- **Ikona oka**: umožňuje vám vidět přesně, kde komponenty systému začínajjí a končí díky modrému ohraničení, také vám umožňuje vidět název komponenty. Při kliknutí na název komponenty se komponenta přidá do aktuálně vybraného úkolu a poté se zobrazí v části **Vybrané komponenty**.
- **Návrhář**: přesměruje vás na stránku `/designer`, kde můžete přidávat a upravovaat úkoly. Tato stránka je popsaná v části **Tvorba úkolů**.
- **Obnovit systém**: otevře okno, které vám umožňuje obnovit databázi, komponenty a systém samotný do původního stavu. Hodí se to při testování úkolů nebo ve chvíli, kdy chcete zahodit změny provedené během zkoušení systému.
- **Opustit systém**: opustí systém a přesměruje vás zpět na stránku se systémy `/systems`.
- **Změnit verzi**: umožňuje vám přepnout mezi učitelskou a studentskou verzí.

## 5 Tvorba úkolů (stránka návrháře `/designer`)

V pravém horním rohu jsou tlačítka: 
- `Stáhnout systém`: otevře okno, které vám umožní stáhnout systém ve formátu `.zip`, který můžete později nahrát jako nový systém, nebo ho použít v předpřipravených systémech.
- `Zpět do systému`: přesměruje vás zpět do systému, kde jste byli předtím.

Níže uvidíte položky:

### 5.1 Počet úrovní

Úkoly mohou být seskupeny do úrovní (např. úroveň 1, úroveň 2, atd.). Tato položka vám umožňuje nastavit počet úrovní, které chcete mít ve vašem systému. Student prvně řeší úkoly z úrovně 1, a jakmile je všechny vyřeší, tak se odemknou úkoly z úrovně 2, a tak dále.

### 5.2 Tlačítka `Náhled studenta/editoru`, `Nový úkol` a `Možnosti`

- `Náhled studenta/editoru`: umožňuje vám přepnout mezi zobrazením úkolů tak, jak je vidí studenti, a zobrazením pro editaci úkolů.
- `Nový úkol`: po kliknutí se vytvoří nový úkol, který se přidá do první úrovně.
- `Možnosti`: otevře nabídku, která okbsahuje možnosti:
    - `Přidat úkol z JSON`: umožňuje vám přidat úkol z JSON formátu.
    - `Stáhnout úkol jako JSON`: umožňuje vám stáhnout úkol ve formátu JSON, který můžete později použít pro přidání úkolu z JSON.
    Tyhle možnosti tu jsou hlavně pro případ, kdybyste chtěli si třeba stáhnout reprezentaci úkolu, tak abyste mohli říct nějakému nástroji umělé inteligence, aby vám ji upravil.

### 5.3 Úkoly

Zde vidíte za sebou štítky s názvy úkolů, které máte v systému. kliknutím na ikonu `Koše` můžete úkol smazat.

### 5.4 Sekce Detail úkolu

#### Název

Zde můžete upravit název úkolu.

#### Popis

Zde můžete upravit popis úkolu.

#### Viditelné stránky

Zde můžete zvolit, které stránky budou pro studenty viditelné, během daného úkolu. To znamená, že když student bude řešit úkol, tak uvidí pouze ty stránky, které zde zvolíte a nemůže vstupovat na ostatní stránky, dokud nevyřeší všechny úkoly z aktuální úrovně. Úkoly v jedné úrovni musí mít stejné viditelné stránky, pokud dojde k tomu, že úkoly ve stejné úrovni mají různé viditelné stránky, tak se vám zobrazí varování, které musíte vyřešit.

#### Povolit SQL dotazy

Zda studenti mohou během řešení úkolu na stránce `/database` spouštět SQL dotazy, nebo ne.

### 5.5 Sekce Úroveň

#### Úroveň

Zde můžete zvolit úroveň, do které chcete úkol zařadit.

#### Úkoly v této úrovni

Zde vidíte všechny úkoly, které jsou v zvolené úrovni.

### 5.6 Sekce Bodování

#### Odměna bodů

Zde můžete nastavit, kolik bodů student získá za vyřešení úkolu.

#### Penalizace za selhání

Zde můžete nastavit, kolik bodů student ztratí, když se pokusí úkol vyřešit, ale neuspěje.

### 5.7 Sekce Vybrané komponenty

Zde vidíte seznam všech komponent, které jsou přiřazené k úkolu. Komponenty se přidávají kliknutím na modrý název komponenty v systému, anebo lze přidat komponentu ručně pomocí tlačítka `Přidat komponentu`, kde můžete vložit její JSON reprezentaci, to je opět užitečné v případě, že chcete použít nějaký nástroj umělé inteligence pro úpravu komponenty.

Každé komponenta obsahuje 3 tlačítka:

- `Kopírovat`: umožňuje vám zkopírovat komponentu jako JSON, který můžete použít v nástrojích umělé inteligence.
- `Koš`: umožňuje vám odebrat komponentu z úkolu.
- `Tužka`: umožňuje vám upravit komponentu. Po kliknutí se otevře okno s editorem částí komponenty, například HTML, CSS, JavaScriptu, SQL nebo akcí po kliknutí podle nastavení konfigurace aplikace.

### 5.8 Sekce Aktivita

#### Název aktivity

Zde můžete nastavit název aktivity.

#### Typ aktivity

Zde můžete zvolit typ aktivity úkolu. Pokud zvolíte `Výběr možností`, tak se vám zobrazí pole, pro vytváření možností, které student může vybírat, zelená fajka znamená, že možnost je správná, a červený křížek znamená, že možnost je nesprávná.

#### Popis aktivity

Zde můžete upravit popis aktivity.

#### Nahradit chybné komponenty původními po dokončení aktivity

Zda se mají po dokončení aktivity přiřazené (např. nějak upravené) komponenty nahradit původními (výchozími) komponentami.

#### Zkontrolovat opravu (při zvolení typu aktivity `Oprava komponent`)

Pokud tuto možnost nezvolíte, tak student už bude moct pracovat na **Dokončení úkolu** bez toho, aniž by musel nejdříve opravit komponenty, avšak to se mu nepovede, pokud je úkol navržen, tak aby to bez konkrétní opravy nešlo. Tahle možnost tu je proto, že některé opravy by zkontrolovat nešly.
Pokud zvolíte, že chcete zkontrolovat opravu, tak se vám zobrazí pole `Podmínky kontroly opravy` pro nastavení kontroly opravy - zvolíte komponentu a déte kontrolu zda má obsahovat / nemá obsahovat nějakou hodnotu.

### 5.9 Sekce Dokončení

#### Název dokončení

Zde můžete nastavit název dokončení úkolu.

#### Popis dokončení

Zde můžete upravit popis dokončení úkolu.

#### Typ dokončení

Zde můžete zvolit typ dokončení úkolu. Pokud zvolíte `Výběr možností`, tak se vám zobrazí pole, pro vytváření možností, které student může vybírat, zelená fajka znamená, že možnost je správná, a červený křížek znamená, že možnost je nesprávná. Pokud zvolíte `Napsat správně`, tak se vám zobrazí pole pro napsaní správné odpovědi, kterou student musí napsat, aby úkol dokončil. Pokud zvolíte `Po aktualizaci databáze`, tak se úkol vyhodnotí jako dokončený, pokud dotaz, který zadáte níže, vrátí nějaký výsledek.

### 5.10 Zpětná vazba

Umožňuje vám nastavit zpětnou vazbu, kterou studenti uvidí po vyřešení úkolu.

## 6 Studentská verze

V této verzi studenti řeší úkoly, které jste pro ně připravili. Nemají přístup k nastavení ani správě systémů a úkolů, ale mohou vidět všechny úkoly, které jste vytvořili, a pracovat na jejich řešení.

### 6.1 Nastavení

V proměnných repozitáře GitHubu vytvote proměnnou `NUXT_PUBLIC_APP_MODE` s hodnotou `STUDENT`, anebo v souboru `.env` nastavte:

```env
NUXT_PUBLIC_APP_MODE=STUDENT
```

### 6.2 První spuštění

## 7 Úkoly

Tahle část se zabývá tím, jaké úkoly lze vytvářet, jak je navrhnout a jak fungují pro studenty.

### 7.1 Tvorba úkolů

Úkoly můžete tvořit na stránce `/designer`, do které můžete vstoupit z učitelské verze systému. Tato stránka je popsaná v části **Tvorba úkolů**.

### 7.2 Jak úkoly fungují

Každý úkol se skládá ze 2 částí: **Aktivita** a **Dokončení**. V každé z těchto dvou částí student něco musí udělat.

#### Aktivita

Aktivita je zaměřená na to, aby student buď problém identifikoval, zjistil jeho důvod, anebo jej opravil. Tomu odpovídají 3 různé typy aktivit.

1. `Výběr komponent`: cílem je, aby student v systému označil komponenty, které podle něj souvisí s problémem v úkolu. Tento typ aktivity se hodí ve chvíli, kdy má student chybu hlavně najít a správně určit její zdroj.

2. `Vybrat možnost`: cílem je, aby student vybral jednu nebo více správných možností. Možnosti mohou popisovat například příčinu chyby, správné vysvětlení chování systému nebo závěr, ke kterému má student dojít po prozkoumání kódu, databáze nebo samotného systému.

3. `Oprava komponent`: cílem je, aby student upravil chybnou komponentu tak, aby systém začal fungovat správně. Typicky jde o situaci, kdy bez opravy komponenty nejde dokončit další krok úkolu, například uložit změnu do databáze nebo použít určitou funkci stránky. V návrháři můžete nastavit, zda se má oprava kontrolovat automaticky pomocí podmínek na obsah komponenty.

#### Dokončení

Dokončení je část úkolu, kdy se kontroluje, zda student něco udělal v systému - typicky něco zjistit, anebo přidat/upravit/smazat nějakou entitu, anebo musí např. odpovědět na otázku / vybrat správné možnosti. Tuto část úkolu jde řešit až když student vyřeší aktivitu, s výjimkou aktivity `Oprava komponent` bez kontroly opravení, zde rovnou student řeší dokončení a k tomu, že student musí něco opravit dojde přirozeně. Opět existují různé typy dokončení:

1. `Po dokončení aktivity`: v tomto typu se nic nekontroluje, jedná vlastně o přeskočení části **Dokončení**, tohle je užitečné, když třeba cílem úkolu je akorát něco zjistit, proč nefunguje - to se udělá v části **Aktivita**, a není potřeba, aby student ještě něco dělal.

2. `Po aktualizaci databáze`: v tomto typu se kontroluje typicky nějaký stav v databázi, který musí nastat, aby se úkol vyhodnotil jako dokončený, například že student musí přidat nějakou entitu do databáze, nebo nějak upravit nějakou entitu v databázi. Je to koncipované tak, že vytvořítě nějaký SQL dotaz a pokud ten něco vrací, tak kontrola vyhodnotí úkol jako splněný.

3. `Výběr možností`: v tomto typu student musí vybrat správné možnosti, které jsou zobrazené, aby úkol dokončil. Tyto možnosti typicky popisují např. nějaký stav systému - kolik je v databázi entit a jejich atributy.

4. `Napsat správně`: v tomto typu student musí napsat správnou odpověď, aby úkol dokončil, například musí napsat přesný počet entit v databázi.

#### Jak probíhá řešení úkolu studentem

Student si v menu s úkoly zvolí úkol, na kterém chce pracovat, a klikne na něj. Poté se mu zobrazí informace o úkolu a může začít řešit aktivitu. Jakmile student vyřeší aktivitu, tak se mu odemkne část dokončení, a může začít řešit dokončení úkolu. Jakmile student vyřeší dokončení úkolu, tak se mu zobrazí zpětná vazba, kterou jste pro něj nastavili, a získá body, které jste pro něj nastavili v sekci Bodování. Část **Aktivita** i část **Dokončení** mají samostatné kontroly - student dostane body jen za dokočení obou částí úkolu, takže pokud třeba vyřeší aktivitu, ale nedokáže dodělat druhou část úkolu, tak nezíská žádné body, protože úkol není kompletně vyřešený. Ale pokud například student udělá chybu i v **Aktivitě**, tak ztratí daný počet bodů. Až student vyřeší všechny úkoly z dané úrovně, tak se mu odemknou úkoly z další úrovně, a také se mu odemknou stránky, které jsou pro danou úroveň nastavené jako viditelné.

## 8 Předpřipravený systém s úkoly

Součástí aplikace je i předpřipravený systém s úkoly, který spíš slouží jako ukázka toho, jak můžou vypadat pomylsné úkoly, než přímo jako něco, co byste měli používat ve výuce, ale klidně ho můžete použít, upravit, nebo se jím inspirovat pro tvorbu vlastních systémů a úkolů. Nachází se v nabídce předpřipravených systémů, kam se dostanete při přidávání nového systému v učitelské verzi. Tento systém se jmenuje `Školní tábor Pálava` a obsahuje 7 různých úkolů. Konkrétně se nachází v adresáří `~/public/systems/skolni-tabor-palava`.

## 9 Konfigurace

Konfigurace aplikace slouží k např. nastavení verze aplikace (učitelská vs studentská), ale i k nastavení různých funkcí, které jsou popsány níže. Pokud se rozhodnete pro nasazení skrze GitHub Pages, tak se aplikace nejprve dívá na hodnoty nastavené v proměnných repozitáře GitHubu a až potom se dívá do souboru `.env`, takže pokud nastavíte nějakou proměnnou v proměnných repozitáře GitHubu, tak se hodnota z `.env` souboru pro danou proměnnou ignoruje.

### 9.1 `NUXT_PUBLIC_APP_MODE`

Určuje, jestli se aplikace spustí v učitelském, nebo studentském režimu. Hodnota `TEACHER` zapne učitelskou verzi aplikace, ve které je možné vytvářet a upravovat systémy, úkoly a jejich obsah. Každá jiná hodnota, typicky `STUDENT`, učitelský režim vypne a aplikace se chová jako studentská verze určená pro řešení připravených úkolů.





### 9.2 `NUXT_PUBLIC_HTML_AVAILABLE`

Zapíná nebo vypíná viditelnost editoru pro HTML část komponenty. Pokud je hodnota `true`, student nebo učitel vidí HTML sekci při opravě komponent. Pokud je hodnota `false`, HTML sekce se v editoru nezobrazí a uživatel ji nemůže upravovat.

### 9.3 `NUXT_PUBLIC_CSS_AVAILABLE`

Zapíná nebo vypíná viditelnost editoru pro CSS část komponenty. Hodnota `true` zobrazí CSS sekci a umožní upravovat styly komponenty, zatímco hodnota `false` tuto část editoru skryje. Hodí se to například ve chvíli, kdy se mají úkoly soustředit jen na strukturu, JavaScript nebo SQL.

### 9.4 `NUXT_PUBLIC_JS_AVAILABLE`

Zapíná nebo vypíná viditelnost editoru pro JavaScriptovou část komponenty. Při hodnotě `true` je možné upravovat JS kód komponenty, při hodnotě `false` se tato sekce v editoru nezobrazí. Tím lze jednoduše omezit, které části komponent mají studenti při řešení úkolů k dispozici.

### 9.5 `NUXT_PUBLIC_SQL_AVAILABLE`

Zapíná nebo vypíná viditelnost editoru pro SQL část komponenty. Hodnota `true` zpřístupní SQL sekci, ve které lze psát nebo opravovat dotazy pracující s databází systému. Hodnota `false` tuto sekci skryje, pokud se dané nasazení nebo sada úkolů SQL části netýká.

### 9.6 `NUXT_PUBLIC_JS_CLICK_AVAILABLE`

Určuje, jestli se v editoru komponent zobrazí část pro JavaScriptovou akci po kliknutí. Hodnota `true` tuto možnost zpřístupní a umožní řešit chování komponenty vyvolané kliknutím. Hodnota `false` ji skryje, což je výchozí nastavení, pokud nechcete pracovat s klikací JavaScriptovou logikou.

### 9.7 `NUXT_PUBLIC_SQL_CLICK_AVAILABLE`

Určuje, jestli se v editoru komponent zobrazí část pro SQL akci po kliknutí. Hodnota `true` tuto možnost zpřístupní a umožní nastavovat databázovou akci, která se provede po kliknutí na komponentu. Hodnota `false` tuto část skryje, pokud ji v úkolech nechcete používat.

### 9.8 `NUXT_APP_BASE_URL`

Nastavuje základní URL cestu, ze které je aplikace dostupná, což je důležité hlavně při nasazení na GitHub Pages nebo do podadresáře. Pokud je aplikace nasazená například v repozitáři `information-system-learning-app`, hodnota bývá `/information-system-learning-app`. Při špatně nastavené hodnotě se mohou špatně načítat stránky, systémy nebo soubor `sql-wasm.wasm`.

## 10 Struktura adresáře systému

Každý systém je uložený jako samostatný adresář v `public/systems`, případně jako ZIP soubor se stejnou vnitřní strukturou. Příklad takového adresáře je `public/systems/skolni-tabor-palava`. Název adresáře je jen označení předpřipraveného systému, samotný obsah systému je popsaný v souborech uvnitř.

### 10.1 `config.json`

Hlavní konfigurační soubor systému. Obsahuje základní informace o systému, například název, popis, jazyk, seznam stránek, úkoly, úrovně a další nastavení. Bez tohoto souboru se systém nenačte, protože aplikace z něj pozná, co má systém obsahovat a jak se má zobrazovat.

### 10.2 `create_schema.sql`

SQL soubor pro vytvoření výchozí databáze systému. Typicky obsahuje příkazy pro vytvoření tabulek, vložení počátečních dat a nastavení stavu, se kterým studenti začínají pracovat. Díky tomuto souboru může mít každý systém vlastní databázový model i vlastní ukázková data. Když se systém poprvé vkládá do aplikace, tak se spustí tento SQL skript pro nastavení databáze do výchozího stavu. (Aplikace používá databázi sql.js, což je databáze SQLite běžící v prohlížeči, takže tento SQL skript se spouští nad touto databází.)





## 11 Tvorba & úprava systémů


### 11.1 Úprava

Můžete upravit vššechny části systému - jeho databázi (data i schéma), stránky i komponenty.

### 11.2 Tvorba systému

Můžete vytvořit nový systém. K tomu máte k dispozici šablonu prázdného systému, kterou najdete v adresáři `docs/cs/empty-system-template`. Pak můžete upravovat tento systém podle svých potřeb, ať už přidávat nové komponenty, stránky, úkoly, nebo upravovat databázi. Po dokončení je vhodné systém vyzkoušet v učitelské verzi, stáhnout ho jako ZIP nebo ho vložit do `public/systems` a ověřit, že se správně načítá i ve studentské verzi.

## 12 Nahrání systému studentům

Až budete mít systém připravený, můžete ho nahrát do aplikace, aby ho studenti mohli řešit. Je potřeba systém nahrát do adresáře `public/systems` a v souboru `public/manifest.json` přidat název adresáře systému (anebo název zip souboru - lze také nahrát systém jako zip soubor) do pole `systems`, aby se systém načetl do aplikace a zobrazil studentům. Viz. níže

```json
{
  "systems": [
    "skolni-tabor-palava"
  ]
}
```

Nezapomeňte také na to, aby aplikace byla v studentské verzi, tedy aby proměnná `NUXT_PUBLIC_APP_MODE` měla hodnotu `STUDENT`.

## 13 Zkušební verze

Studentská verze aplikace s předpřipraveným systémem `Školní tábor Pálava` je dostupná na adrese: https://zeverou.github.io/information-system-learning-app-student/ a učitelská verze je dostupná na adrese: https://zeverou.github.io/information-system-learning-app-teacher/. zde si můžete udělat představu o tom, jak aplikace vypadá a funguje, a také se inspirovat pro tvorbu vlastních systémů a úkolů, a zda vůbec taková aplikace dává smysl pro vaši výuku.

## 14 Kontakt

Pokud máte jakékoliv dotazy, nápady na vylepšení, nebo chcete sdílet své zkušenosti s používáním této aplikace, neváhejte mě kontaktovat na emailu: david.valek17@gmail.com

## 15 Odkazy

1. https://www.cloudflare.com/learning/serverless/glossary/client-side-vs-server-side/

