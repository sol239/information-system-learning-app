import { Component } from "~/model/Component";

export const editVstupKapacitaKomponenta = new Component({
  id: "edit-vstup-kapacita",
  name: "Vstup – Edit Kapacita",
  tags: ["turnusy"],
  description: "Pole pro úpravu kapacity turnusu. Vyžaduje generalVariable: idTurnusu.",

  html: `
<div class="form-radek">
  <label>Kapacita:</label>
  <input type="number" id="system-edit_vstup_kapacita" min="1" value="{{ edit_vstup_kapacita }}" style="border: 4px solid {{ barva_ramecku }}" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `const je_kapacita_validni = (edit_vstup_kapacita > 0);

let barva_ramecku = "#FFFFFF";

if (je_kapacita_validni) {
    barva_ramecku = "#4aff5c";
} else {
    barva_ramecku = "#ff4f92";
}`,
  sql: {
    nacistKapacituTurnusu: `SELECT kapacita AS edit_vstup_kapacita FROM turnusy WHERE id_turnusu = idTurnusu`
  },
});
