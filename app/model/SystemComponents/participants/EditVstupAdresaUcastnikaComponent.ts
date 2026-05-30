import { Component } from "~/model/Component";

export const editVstupAdresaUcastnikaKomponenta = new Component({
  id: "edit-vstup-adresa-ucastnika",
  name: "Vstup – Edit Adresa účastníka",
  tags: ["účastníci"],
  description: "Pole pro úpravu adresy účastníka. Vyžaduje generalVariable: idUcastnika.",

  html: `
<div class="form-radek">
  <label>Adresa:</label>
  <input type="text" id="system-edit_vstup_adresa_ucastnika" value="{{ edit_vstup_adresa_ucastnika }}" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_adresa_validni = /^\\S.+\\s+\\d+[a-zA-Z]?\\s*,\\s*\\S.+\\s*,\\s*\\d{3}\\s?\\d{2}$/.test(edit_vstup_adresa_ucastnika.trim());

let barva_ramecku = "#FFFFFF";

if (je_adresa_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {
    nacistAdresuUcastnika: `SELECT adresa AS edit_vstup_adresa_ucastnika FROM ucastnici WHERE id_ucastnika = idUcastnika`
  },
});
