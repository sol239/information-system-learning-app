import { Component } from "~/model/Component";

export const datumTurnusuKomponenta = new Component({
  id: "datum-turnusu",
  name: "Datum turnusu",
  tags: ["turnusy"],
  description: `Zobrazuje datumový rozsah turnusu. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div class="datum-turnusu-stitek">
  📅 {{ datum_od_turnusu }} - {{ datum_do_turnusu }}
</div>
`,
  css: `
.datum-turnusu-stitek {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "ziskej_data_turnusu": `SELECT strftime('%d. %m.', datum_od) AS datum_od_turnusu, strftime('%d. %m. %Y', datum_do) AS datum_do_turnusu FROM turnusy WHERE id_turnusu = idTurnusu`
  },
  sql_click: {}
});
