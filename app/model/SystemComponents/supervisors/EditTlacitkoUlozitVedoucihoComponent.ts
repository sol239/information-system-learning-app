import { Component } from "~/model/Component";

export const editTlacitkoUlozitVedoucihoKomponenta = new Component({
  id: "edit-btn-ulozit-vedouciho",
  name: "Tlačítko – Upravit vedoucího",
  tags: ["vedoucí"],
  description: "Tlačítko pro uložení změn existujícího vedoucího. Vyžaduje generalVariable: idVedouciho.",

  html: `
<button id="system-edit_btn_ulozit_vedouciho" class="btn-uspech" {{ stav_tlacitka }}>Upravit vedoucího</button>
`,

  css: `
.btn-uspech { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_jmeno_validni && je_validni_email && je_cislo_validni && je_adresa_validni && je_vek_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    upravitVedouciho: `UPDATE vedouci SET jmeno = 'edit_vstup_jmeno_vedouciho', email = 'edit_vstup_email_vedouciho', telefon = 'edit_vstup_telefon_vedouciho', adresa = 'edit_vstup_adresa_vedouciho', vek = edit_vstup_vek_vedouciho WHERE id_vedouciho = idVedouciho`,
    smazatAlergenyVedouciho: `DELETE FROM vedouci_alergeny WHERE id_vedouciho = idVedouciho`,
    vlozitAlergenyVedouciho: `INSERT OR IGNORE INTO vedouci_alergeny (id_vedouciho, id_alergenu) SELECT idVedouciho, id_alergenu FROM alergeny WHERE id_alergenu IN (edit_vstup_alergeny_vedouciho)`,
    smazatTurnusyVedouciho: `DELETE FROM vedouci_turnusy WHERE id_vedouciho = idVedouciho`,
    vlozitTurnusyVedouciho: `INSERT OR IGNORE INTO vedouci_turnusy (id_vedouciho, id_turnusu) SELECT idVedouciho, id_turnusu FROM turnusy WHERE id_turnusu IN (edit_vstup_turnusy_vedouciho)`
  },
});
