import { Component } from "~/model/Component";

export const tlacitkoUlozitJidloKomponenta = new Component({
  id: "btn-ulozit-jidlo",
  name: "Tlačítko – Uložit jídlo",
  tags: ["jídla"],
  description: "Tlačítko pro uložení nového jídla.",

  html: `
<button id="system-btn_ulozit_jidlo" class="btn-uspech" {{ stav_tlacitka }}>Uložit jídlo</button>
`,

  css: `
.btn-uspech { background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_nazev_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    vlozitJidlo: `INSERT INTO jidla (jmeno, doba_podavani) VALUES ('vstup_nazev_jidla', 'vstup_doba_podavani')`,
    vlozitAlergenyJidla: `INSERT OR IGNORE INTO jidla_alergeny (id_jidla, id_alergenu) SELECT (SELECT MAX(id_jidla) FROM jidla), id_alergenu FROM alergeny WHERE id_alergenu IN (vstup_alergeny_jidla)`
  },
});
