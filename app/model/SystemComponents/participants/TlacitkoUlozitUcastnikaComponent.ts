import { Component } from "~/model/Component";

export const tlacitkoUlozitUcastnikaKomponenta = new Component({
  id: "btn-ulozit-ucastnika",
  name: "Tlačítko – Uložit účastníka",
  tags: ["účastníci"],
  description: "Tlačítko pro uložení nového účastníka.",

  html: `
<button id="system-btn_ulozit_ucastnika" class="btn-uspech" {{ stav_tlacitka }}>Uložit účastníka</button>
`,

  css: `
.btn-uspech { background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_jmeno_validni && je_validni_email && je_cislo_validni && je_adresa_validni && je_vek_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    vlozitUcastnika: `INSERT INTO ucastnici (jmeno, email, telefon, adresa, vek) VALUES ('vstup_jmeno_ucastnika', 'vstup_email_ucastnika', 'vstup_telefon_ucastnika', 'vstup_adresa_ucastnika', vstup_vek_ucastnika)`,
    vlozitAlergenyUcastnika: `INSERT OR IGNORE INTO ucastnici_alergeny (id_ucastnika, id_alergenu) SELECT (SELECT MAX(id_ucastnika) FROM ucastnici), id_alergenu FROM alergeny WHERE id_alergenu IN (vstup_alergeny_ucastnika)`,
    vlozitTurnusyUcastnika: `INSERT OR IGNORE INTO turnusy_ucastnici (id_ucastnika, id_turnusu) SELECT (SELECT MAX(id_ucastnika) FROM ucastnici), id_turnusu FROM turnusy WHERE id_turnusu IN (vstup_turnusy_ucastnika)`
  },
});
