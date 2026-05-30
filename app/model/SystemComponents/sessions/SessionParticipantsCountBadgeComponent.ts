import { Component } from "~/model/Component";

export const sessionParticipantsCountBadgeComponent = new Component({
  id: "stitek-poctu-ucastniku-turnusu",
  name: "Štítek počtu účastníků turnusu",
  tags: ["turnusy"],
  description: `Zobrazuje badge s počtem účastníků turnusu. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div id="stitek-ucastniku-turnusu">
  <span id="text-stitku-ucastniku">Účastníci ({{ pocet_ucastniku_turnusu }})</span>
</div>
`,
  css: `
#stitek-ucastniku-turnusu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid #2252d9;
  background: #dbeafe;
}

#text-stitku-ucastniku {
  font-weight: 600;
  font-size: 14px;
  color: #2252d9;
  line-height: 1;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "stitek-poctu-ucastniku-turnusu": `SELECT COUNT(*) AS pocet_ucastniku_turnusu FROM ucastnici u JOIN turnusy_ucastnici tu ON u.id_ucastnika = tu.id_ucastnika WHERE tu.id_turnusu = idTurnusu`
  },
  sql_click: {}
});
