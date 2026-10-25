import { Component } from "~/model/Component";

export const smazatVedoucihoKomponenta = new Component({
  id: "smazat-vedouciho",
  name: "Smazat vedoucího",
  tags: ["vedoucí"],
  description: "Tlačítko pro smazání vedoucího. Vyžaduje generalVariable: idVedouciho.",

  html: `
<div id="smazat-vedouciho-tlacitko">
  Smazat vedoucího
</div>
`,

  css: `
#smazat-vedouciho-tlacitko {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ef4444;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}
`,

  js: ``,
  js_click: ``,
  sql: {},
  sql_click: {
    "smazat-vedouciho-turnusy": `DELETE FROM vedouci_turnusy WHERE id_vedouciho = idVedouciho`,
    "smazat-vedouciho-alergeny": `DELETE FROM vedouci_alergeny WHERE id_vedouciho = idVedouciho`,
    "smazat-vedouciho-jidla": `DELETE FROM jidla_vedouci WHERE id_vedouciho = idVedouciho`,
    "smazat-vedouciho": `DELETE FROM vedouci WHERE id_vedouciho = idVedouciho`
  }
});
