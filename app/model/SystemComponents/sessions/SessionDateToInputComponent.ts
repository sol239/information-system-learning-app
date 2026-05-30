import { Component } from "~/model/Component";

export const vstupDatumDoKomponenta = new Component({
  id: "vstup-datum-do",
  name: "Vstup – Datum do",
  tags: ["turnusy"],
  description: "Pole pro zadání koncového data turnusu.",

  html: `
<div class="form-radek">
  <label>Datum do:</label>
  <input type="date" id="system-vstup_datum_do" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_datum_do_validni =
    !isNaN(new Date(vstup_datum_do).getTime());
const je_rozsah_dat_validni =
    je_datum_do_validni &&
    typeof vstup_datum_od !== "undefined" &&
    !isNaN(new Date(vstup_datum_od).getTime()) &&
    new Date(vstup_datum_od).getTime() <= new Date(vstup_datum_do).getTime();

let barva_ramecku = "#FFFFFF";

if (je_datum_do_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {},
});
