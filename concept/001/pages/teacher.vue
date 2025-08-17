<template>

<div>
    Aplikace poskytuje různé druhy úkolů. V následující sekci je napsané, jak takové úkoly fungují a jak se vytváří.
</div>

<h2>Druhy řešení úkolů</h2>
<h3>Nalezení chybné komponenty</h3>
<p>
    Cílem tohoto úkolu je, aby student našel komponentu, která nefunguje správně. Student takovou komponentu označí a odešle.
</p>
<h3>Oprava chybné komponenty</h3>
<p>
    Cílem tohoto úkolu je, aby student opravil komponentu, která nefunguje správně. Student provede potřebné úpravy a odešle opravenou komponentu.
</p>
<h3>Odpovězení na otázku</h3>
<p>
    Cílem tohoto úkolu je, aby student odpověděl na otázku týkající se komponenty. Student vybere jednu z odpovědí a odešle ji.
</p>

<h2>Druhy tvorby úkolů</h2>
<p>Veškerá tvorba úkolů aktuálně probíha čistě skrze config.json soubor, který lze nalézt v `./assets/data/information_system_1/config.json`</p>
<h3>Deklarace chybových elementů</h3>
<p>
    Každá komponenta, má nějaké části, které je možné měnit skrze config.json soubor. Například je možné editovat SQL dotaz, HTML šablonu.
</p>
<h3>Změna na chybnou komponentu</h3>
<p>
    Ke každé komponentě, existuje duální shodná .error komponenta, viz. ./components/. V config.json souboru je možné určit, aby se použilá chybová komponenta.
</p>
    
</template>

