import { Component } from "~/model/Component";

export const vstupDatumOdKomponenta = new Component({
  id: "vstup-datum-od",
  name: "Vstup – Datum od",
  tags: ["turnusy"],
  description: "Pole pro zadání počátečního data turnusu.",

  html: `
<div class="form-radek">
  <label>Datum od:</label>
  <input type="date" id="system-vstup_datum_od" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_datum_od_validni =
    !isNaN(new Date(vstup_datum_od).getTime());

let barva_ramecku = "#FFFFFF";

if (je_datum_od_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {},
});
