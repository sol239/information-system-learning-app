import { Component } from "~/model/Component";

export const vstupKapacitaKomponenta = new Component({
  id: "vstup-kapacita",
  name: "Vstup – Kapacita",
  tags: ["turnusy"],
  description: "Pole pro zadání kapacity turnusu.",

  html: `
<div class="form-radek">
  <label>Kapacita:</label>
  <input type="number" id="system-vstup_kapacita" min="1" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_kapacita_validni = (vstup_kapacita > 0);

let barva_ramecku = "#FFFFFF";

if (je_kapacita_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {},
});
