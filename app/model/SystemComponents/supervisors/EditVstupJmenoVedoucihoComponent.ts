import { Component } from "~/model/Component";

export const editVstupJmenoVedoucihoKomponenta = new Component({
  id: "edit-vstup-jmeno-vedouciho",
  name: "Vstup – Edit Jméno vedoucího",
  tags: ["vedoucí"],
  description: "Pole pro úpravu jména vedoucího. Vyžaduje generalVariable: idVedouciho.",

  html: `
<div class="form-radek">
  <label>Jméno:</label>
  <input type="text" id="system-edit_vstup_jmeno_vedouciho" value="{{ edit_vstup_jmeno_vedouciho }}" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const casti_jmena_vedouciho = edit_vstup_jmeno_vedouciho.trim().split(" ");
let pocet_casti_jmena_vedouciho = 0;

casti_jmena_vedouciho.forEach(function(cast_jmena) {
    if (cast_jmena !== "") {
        pocet_casti_jmena_vedouciho = pocet_casti_jmena_vedouciho + 1;
    }
});

let je_jmeno_validni = false;

if (pocet_casti_jmena_vedouciho === 2) {
    je_jmeno_validni = true;
} else {
    je_jmeno_validni = false;
}

let barva_ramecku = "#FFFFFF";

if (je_jmeno_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {
    nacistJmenoVedouciho: `SELECT jmeno AS edit_vstup_jmeno_vedouciho FROM vedouci WHERE id_vedouciho = idVedouciho`
  },
});
