import { Component } from "~/model/Component";

export const pocetDniTurnusuKomponenta = new Component({
  id: "pocet-dni-turnusu",
  name: "Počet dní turnusu",
  tags: ["turnusy"],
  description: `Zobrazuje počet dní turnusu. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div class="pocet-dni-turnusu-stitek">
  🗓️ Počet dní: {{ pocet_dni_turnusu }}
</div>
`,
  css: `
.pocet-dni-turnusu-stitek {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  height: 26px;
  gap: 6px;
  padding: 6px 16px;
  background: #16a34a;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "pocet-dni-turnusu": `SELECT CAST(julianday(datum_do) - julianday(datum_od) + 1 AS INTEGER) AS pocet_dni_turnusu FROM turnusy WHERE id_turnusu = idTurnusu`
  },
  sql_click: {}
});

