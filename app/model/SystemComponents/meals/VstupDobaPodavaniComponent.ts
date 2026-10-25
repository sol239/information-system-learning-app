import { Component } from "~/model/Component";

export const vstupDobaPodavaniKomponenta = new Component({
  id: "vstup-doba-podavani",
  name: "Vstup – Doba podávání",
  tags: ["jídla"],
  description: "Výběr doby podávání jídla (snídaně/oběd/večeře).",

  html: `
<div class="form-radek">
  <label>Doba podávání:</label>
  <select id="system-vstup_doba_podavani">
    <option value="snídaně">Snídaně</option>
    <option value="oběd">Oběd</option>
    <option value="večeře">Večeře</option>
  </select>
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 12px !important; font-weight: 500; color: #374151; }
.form-radek input, .form-radek select { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: ``,
  sql: {},
});
