import { Component } from "~/model/Component";

export const editTlacitkoUlozitUcastnikaKomponenta = new Component({
  id: "edit-btn-ulozit-ucastnika",
  name: "Tlačítko – Upravit účastníka",
  tags: ["účastníci"],
  description: "Tlačítko pro uložení změn existujícího účastníka. Vyžaduje generalVariable: idUcastnika.",

  html: `
<button id="system-edit_btn_ulozit_ucastnika" class="btn-uspech" {{ stav_tlacitka }}>Upravit účastníka</button>
`,

  css: `
.btn-uspech { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_jmeno_validni && je_validni_email && je_cislo_validni && je_adresa_validni && je_vek_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    upravitUcastnika: `UPDATE ucastnici SET jmeno = 'edit_vstup_jmeno_ucastnika', email = 'edit_vstup_email_ucastnika', telefon = 'edit_vstup_telefon_ucastnika', adresa = 'edit_vstup_adresa_ucastnika', vek = edit_vstup_vek_ucastnika WHERE id_ucastnika = idUcastnika`,
    smazatAlergenyUcastnika: `DELETE FROM ucastnici_alergeny WHERE id_ucastnika = idUcastnika`,
    vlozitAlergenyUcastnika: `INSERT OR IGNORE INTO ucastnici_alergeny (id_ucastnika, id_alergenu) SELECT idUcastnika, id_alergenu FROM alergeny WHERE id_alergenu IN (edit_vstup_alergeny_ucastnika)`,
    smazatTurnusyUcastnika: `DELETE FROM turnusy_ucastnici WHERE id_ucastnika = idUcastnika`,
    vlozitTurnusyUcastnika: `INSERT OR IGNORE INTO turnusy_ucastnici (id_ucastnika, id_turnusu) SELECT idUcastnika, id_turnusu FROM turnusy WHERE id_turnusu IN (edit_vstup_turnusy_ucastnika)`
  },
});
