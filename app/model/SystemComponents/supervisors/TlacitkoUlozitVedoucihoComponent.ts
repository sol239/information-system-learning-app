import { Component } from "~/model/Component";

export const tlacitkoUlozitVedoucihoKomponenta = new Component({
  id: "btn-ulozit-vedouciho",
  name: "Tlačítko – Uložit vedoucího",
  tags: ["vedoucí"],
  description: "Tlačítko pro uložení nového vedoucího.",

  html: `
<button id="system-btn_ulozit_vedouciho" class="btn-uspech" {{ stav_tlacitka }}>Uložit vedoucího</button>
`,

  css: `
.btn-uspech { background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-uspech:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.65; }
`,

  js: `const je_validni = je_jmeno_validni && je_validni_email && je_cislo_validni && je_adresa_validni && je_vek_validni;
const stav_tlacitka = je_validni ? "" : "disabled";`,
  sql: {},
  sql_click: {
    vlozitVedouciho: `INSERT INTO vedouci (jmeno, email, telefon, adresa, vek) VALUES ('vstup_jmeno_vedouciho', 'vstup_email_vedouciho', 'vstup_telefon_vedouciho', 'vstup_adresa_vedouciho', vstup_vek_vedouciho)`,
    vlozitAlergenyVedouciho: `INSERT OR IGNORE INTO vedouci_alergeny (id_vedouciho, id_alergenu) SELECT (SELECT MAX(id_vedouciho) FROM vedouci), id_alergenu FROM alergeny WHERE id_alergenu IN (vstup_alergeny_vedouciho)`,
    vlozitTurnusyVedouciho: `INSERT OR IGNORE INTO vedouci_turnusy (id_vedouciho, id_turnusu) SELECT (SELECT MAX(id_vedouciho) FROM vedouci), id_turnusu FROM turnusy WHERE id_turnusu IN (vstup_turnusy_vedouciho)`
  },
});
