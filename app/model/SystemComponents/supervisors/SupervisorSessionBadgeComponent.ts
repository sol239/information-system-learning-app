import { Component } from "~/model/Component";

export const stitekTurnusuVedoucihoKomponenta = new Component({
  id: "stitek-turnusu-vedouciho",
  name: "Štítek turnusu vedoucího",
  tags: ["vedoucí"],
  description: `Zobrazuje název turnusu a datum pro vedoucího. Vyžaduje generalVariable: idVedouciho.`,
  html: `
<div id="stitek-turnusu-vedouciho">
  {{ turnusy_vedouciho }}
</div>
`,
  css: `
#stitek-turnusu-vedouciho {
  display: block;
  font-size: 13px;
  color: #6b7280;
  white-space: pre-line;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "stitek-turnusu-vedouciho": `SELECT GROUP_CONCAT('Turnus ' || t.id_turnusu || ' (' || strftime('%d. %m.', t.datum_od) || ' - ' || strftime('%d. %m. %Y', t.datum_do) || ')', CHAR(10)) AS turnusy_vedouciho FROM turnusy t JOIN vedouci_turnusy vt ON t.id_turnusu = vt.id_turnusu WHERE vt.id_vedouciho = idVedouciho`
  },
  sql_click: {}
});
