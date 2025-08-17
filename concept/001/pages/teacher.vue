<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="mb-8 rounded-xl shadow p-6">
      <p class="text-lg">
        Aplikace poskytuje různé druhy úkolů. V následující sekci je napsané, jak takové úkoly fungují a jak se vytváří.
      </p>
    </div>

    <div class="mb-8 rounded-xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4 text-[#05df72]">Druhy řešení úkolů</h2>
      <h3 class="text-xl font-semibold mt-4 mb-2 text-[#05df72]">Nalezení chybné komponenty</h3>
      <p class="mb-4">
        Cílem tohoto úkolu je, aby student našel komponentu, která nefunguje správně. Student takovou komponentu označí a odešle.
      </p>
      <h3 class="text-xl font-semibold mt-4 mb-2 text-[#05df72]">Oprava chybné komponenty</h3>
      <p class="mb-4">
        Cílem tohoto úkolu je, aby student opravil komponentu, která nefunguje správně. Student provede potřebné úpravy a odešle opravenou komponentu.
      </p>
      <h3 class="text-xl font-semibold mt-4 mb-2 text-[#05df72]">Odpovědění na otázku</h3>
      <p>
        Cílem tohoto úkolu je, aby student odpověděl na otázku týkající se komponenty. Student vybere jednu z odpovědí a odešle ji.
      </p>
    </div>

    <div class="rounded-xl shadow p-6">
      <h2 class="text-2xl font-bold mb-4 text-[#05df72]">Druhy tvorby úkolů</h2>
      <p class="mb-4">
        Veškerá tvorba úkolů aktuálně probíha čistě skrze config.json soubor, který lze nalézt v
        <code class="bg-gray-800 px-1 rounded text-sm font-bold text-red-600">./assets/data/information_system_1/config.json</code>
      </p>
      <h3 class="text-xl font-semibold mt-4 mb-2 text-[#05df72]">Deklarace chybových elementů</h3>
      <p class="mb-4">
        Každá komponenta, má nějaké části, které je možné měnit skrze config.json soubor. Například je možné editovat SQL dotaz, HTML šablonu.
      </p>
      <h3 class="text-xl font-semibold mt-4 mb-2 text-[#05df72]">Změna na chybnou komponentu</h3>
      <p>
        Ke každé komponentě, existuje duální shodná .error komponenta, viz.
        <code class="bg-gray-800 px-1 rounded text-sm font-bold text-red-600">./components/</code>. V config.json souboru je možné určit, aby se použilá chybová komponenta.
      </p>
    </div>
  </div>
</template>

