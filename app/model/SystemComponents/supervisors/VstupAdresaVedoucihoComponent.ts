import { Component } from "~/model/Component";

export const vstupAdresaVedoucihoKomponenta = new Component({
  id: "vstup-adresa-vedouciho",
  name: "Vstup – Adresa vedoucího",
  tags: ["vedoucí"],
  description: "Pole pro zadání adresy vedoucího.",

  html: `
<div class="form-radek">
  <label>Adresa:</label>
  <input type="text" id="system-vstup_adresa_vedouciho" placeholder="Zadejte adresu" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_adresa_validni = /^\\S.+\\s+\\d+[a-zA-Z]?\\s*,\\s*\\S.+\\s*,\\s*\\d{3}\\s?\\d{2}$/.test(vstup_adresa_vedouciho.trim());

let barva_ramecku = "#FFFFFF";

if (je_adresa_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {},
});
