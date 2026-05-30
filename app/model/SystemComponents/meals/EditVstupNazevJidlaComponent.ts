import { Component } from "~/model/Component";

export const editVstupNazevJidlaKomponenta = new Component({
  id: "edit-vstup-nazev-jidla",
  name: "Vstup – Edit Název jídla",
  tags: ["jídla"],
  description: "Pole pro úpravu názvu jídla. Vyžaduje generalVariable: idJidla.",

  html: `
<div class="form-radek">
  <label>Název jídla:</label>
  <input type="text" id="system-edit_vstup_nazev_jidla" value="{{ edit_vstup_nazev_jidla }}" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input, .form-radek select { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_nazev_validni = edit_vstup_nazev_jidla.trim().length > 0;

let barva_ramecku = "#FFFFFF";

if (je_nazev_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {
    nacistNazevJidla: `SELECT jmeno AS edit_vstup_nazev_jidla FROM jidla WHERE id_jidla = idJidla`
  },
});
