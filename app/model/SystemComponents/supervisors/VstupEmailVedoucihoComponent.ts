import { Component } from "~/model/Component";

export const vstupEmailVedoucihoKomponenta = new Component({
  id: "vstup-email-vedouciho",
  name: "Vstup – Email vedoucího",
  tags: ["vedoucí"],
  description: "Pole pro zadání emailu vedoucího.",

  html: `
<div class="form-radek">
  <label>Email:</label>
  <input type="email" id="system-vstup_email_vedouciho" placeholder="Zadejte email" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_validni_email = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(vstup_email_vedouciho);

let barva_ramecku = "#FFFFFF";

if (je_validni_email) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {},
});
