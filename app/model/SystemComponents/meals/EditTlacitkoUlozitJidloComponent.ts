import { Component } from "~/model/Component";

export const editTlacitkoUlozitJidloKomponenta = new Component({
  id: "edit-btn-ulozit-jidlo",
  name: "Tlačítko – Upravit jídlo",
  tags: ["jídla"],
  description: "Tlačítko pro uložení změn existujícího jídla. Vyžaduje generalVariable: idJidla.",

  html: `
<button id="system-edit_btn_ulozit_jidlo" class="btn-uspech" {{ stav_tlacitka }}>Upravit jídlo</button>
`,

  css: `
.btn-uspech { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_nazev_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    upravitJidlo: `UPDATE jidla SET jmeno = 'edit_vstup_nazev_jidla', doba_podavani = 'edit_vstup_doba_podavani' WHERE id_jidla = idJidla`,
    smazatAlergenyJidla: `DELETE FROM jidla_alergeny WHERE id_jidla = idJidla`,
    vlozitAlergenyJidla: `INSERT OR IGNORE INTO jidla_alergeny (id_jidla, id_alergenu) SELECT idJidla, id_alergenu FROM alergeny WHERE id_alergenu IN (edit_vstup_alergeny_jidla)`
  },
});
