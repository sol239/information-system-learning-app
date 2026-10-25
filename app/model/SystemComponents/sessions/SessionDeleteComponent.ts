import { Component } from "~/model/Component";

export const sessionDeleteComponent = new Component({
  id: "smazat-turnus",
  name: "Smazat turnus",
  tags: ["turnusy"],
  description: `Zobrazuje tlačítko pro smazání turnusu. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div id="smazat-turnus-tlacitko">
  Smazat turnus
</div>
`,
  css: `
#smazat-turnus-tlacitko {
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
  transition: background-color 0.15s;
}

#smazat-turnus-tlacitko:hover {
  background: #fee2e2;
}
`,
  js: ``,
  js_click: ``,
  sql: {},
  sql_click: {
    "smazat-turnus-ucastnici": `DELETE FROM turnusy_ucastnici WHERE id_turnusu = idTurnusu`,
    "smazat-turnus-vedouci": `DELETE FROM vedouci_turnusy WHERE id_turnusu = idTurnusu`,
    "smazat-turnus": `DELETE FROM turnusy WHERE id_turnusu = idTurnusu`,
  },
});
