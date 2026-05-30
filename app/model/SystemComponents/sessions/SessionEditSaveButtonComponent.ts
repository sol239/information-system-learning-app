import { Component } from "~/model/Component";

export const editTlacitkoUlozitKomponenta = new Component({
  id: "edit-btn-ulozit",
  name: "Tlačítko – Upravit turnus",
  tags: ["turnusy"],
  description: "Tlačítko pro uložení změn existujícího turnusu. Vyžaduje generalVariable: idTurnusu.",

  html: `
<button id="system-edit_btn_ulozit" class="btn-uspech" {{ stav_tlacitka }}>Upravit turnus</button>
`,

  css: `
.btn-uspech { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_datum_od_validni && je_datum_do_validni && je_rozsah_dat_validni && je_kapacita_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    upravitTurnus: `UPDATE turnusy SET datum_od = DATE('edit_vstup_datum_od'), datum_do = DATE('edit_vstup_datum_do'), kapacita = edit_vstup_kapacita WHERE id_turnusu = idTurnusu`
  },
});
