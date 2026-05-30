import { Component } from "~/model/Component";

export const vstupVekVedoucihoKomponenta = new Component({
  id: "vstup-vek-vedouciho",
  name: "Vstup – Věk vedoucího",
  tags: ["vedoucí"],
  description: "Pole pro zadání věku vedoucího.",

  html: `
<div class="form-radek">
  <label>Věk:</label>
  <input type="number" id="system-vstup_vek_vedouciho" min="1" max="99" placeholder="Zadejte věk" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_vek_validni = Number(vstup_vek_vedouciho) >= 18 && Number(vstup_vek_vedouciho) <= 99;

let barva_ramecku = "#FFFFFF";

if (je_vek_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {},
});
