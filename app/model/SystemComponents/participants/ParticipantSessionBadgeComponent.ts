import { Component } from "~/model/Component";

export const stitekTurnusuUcastnikaKomponenta = new Component({
  id: "stitek-turnusu-ucastnika",
  name: "Štítek turnusu účastníka",
  tags: ["účastníci"],
  description: `Zobrazuje název turnusu a datum pro účastníka. Vyžaduje generalVariable: idUcastnika.`,
  html: `
<div id="stitek-turnusu-ucastnika">
  {{ turnusy_ucastnika }}
</div>
`,
  css: `
#stitek-turnusu-ucastnika {
  display: block;
  font-size: 13px;
  color: #6b7280;
  padding: 0;
  white-space: pre-line;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "stitek-turnusu-ucastnika": `SELECT GROUP_CONCAT('Turnus ' || t.id_turnusu || ' (' || strftime('%d. %m.', t.datum_od) || ' - ' || strftime('%d. %m. %Y', t.datum_do) || ')', CHAR(10)) AS turnusy_ucastnika FROM turnusy t JOIN turnusy_ucastnici tu ON t.id_turnusu = tu.id_turnusu WHERE tu.id_ucastnika = idUcastnika`
  },
  sql_click: {}
});
