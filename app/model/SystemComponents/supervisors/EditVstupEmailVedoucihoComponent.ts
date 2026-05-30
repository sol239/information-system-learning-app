import { Component } from "~/model/Component";

export const editVstupEmailVedoucihoKomponenta = new Component({
  id: "edit-vstup-email-vedouciho",
  name: "Vstup – Edit Email vedoucího",
  tags: ["vedoucí"],
  description: "Pole pro úpravu emailu vedoucího. Vyžaduje generalVariable: idVedouciho.",

  html: `
<div class="form-radek">
  <label>Email:</label>
  <input type="email" id="system-edit_vstup_email_vedouciho" value="{{ edit_vstup_email_vedouciho }}" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_validni_email = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(edit_vstup_email_vedouciho);

let barva_ramecku = "#FFFFFF";

if (je_validni_email) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {
    nacistEmailVedouciho: `SELECT email AS edit_vstup_email_vedouciho FROM vedouci WHERE id_vedouciho = idVedouciho`
  },
});
