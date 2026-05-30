import { Component } from "~/model/Component";

export const vstupNazevJidlaKomponenta = new Component({
  id: "vstup-nazev-jidla",
  name: "Vstup – Název jídla",
  tags: ["jídla"],
  description: "Pole pro zadání názvu jídla.",

  html: `
<div class="form-radek">
  <label>Název jídla:</label>
  <input type="text" id="system-vstup_nazev_jidla" placeholder="Zadejte název jídla" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input, .form-radek select { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_nazev_validni = vstup_nazev_jidla.trim().length > 0;

let barva_ramecku = "#FFFFFF";

if (je_nazev_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {},
});
