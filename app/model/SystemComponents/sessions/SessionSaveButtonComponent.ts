import { Component } from "~/model/Component";

export const tlacitkoUlozitKomponenta = new Component({
  id: "btn-ulozit",
  name: "Tlačítko – Uložit turnus",
  tags: ["turnusy"],
  description: "Tlačítko pro uložení nového turnusu.",

  html: `
<button id="system-btn_ulozit" class="btn-uspech" {{ stav_tlacitka }}>Uložit turnus</button>
`,

  css: `
.btn-uspech { background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_datum_od_validni && je_datum_do_validni && je_rozsah_dat_validni && je_kapacita_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    insertTurnus: `INSERT INTO turnusy (datum_od, datum_do, kapacita) VALUES (DATE('vstup_datum_od'), DATE('vstup_datum_do'), vstup_kapacita)`
  },
});
