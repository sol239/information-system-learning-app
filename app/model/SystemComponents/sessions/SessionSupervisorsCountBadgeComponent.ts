import { Component } from "~/model/Component";

export const sessionSupervisorsCountBadgeComponent = new Component({
  id: "stitek-poctu-vedoucich-turnusu",
  name: "Štítek počtu vedoucích turnusu",
  tags: ["turnusy"],
  description: `Zobrazuje badge s počtem vedoucích turnusu. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div id="stitek-vedoucich-turnusu">
  <span id="text-stitku-vedoucich">Vedoucí ({{ pocet_vedoucich_turnusu }})</span>
</div>
`,
  css: `
#stitek-vedoucich-turnusu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid #b79dff;
  background: #f6f2ff;
}

#text-stitku-vedoucich {
  font-weight: 600;
  font-size: 14px;
  color: #b79dff;
  line-height: 1;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "stitek-poctu-vedoucich-turnusu": `SELECT COUNT(*) AS pocet_vedoucich_turnusu FROM vedouci v JOIN vedouci_turnusy vt ON v.id_vedouciho = vt.id_vedouciho WHERE vt.id_turnusu = idTurnusu`
  },
  sql_click: {}
});
