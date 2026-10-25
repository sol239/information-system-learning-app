import { Component } from "~/model/Component";

export const smazatJidloKomponenta = new Component({
  id: "smazat-jidlo",
  name: "Smazat jídlo",
  tags: ["jídla"],
  description: "Tlačítko pro smazání jídla. Vyžaduje generalVariable: idJidla.",

  html: `
<div id="smazat-jidlo-tlacitko">
  Smazat jídlo
</div>
`,

  css: `
#smazat-jidlo-tlacitko {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 9999px;
  border: 1px solid #ef4444;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}
`,

  js: ``,
  js_click: ``,
  sql: {},
  sql_click: {
    "smazat-jidlo-alergeny": `DELETE FROM jidla_alergeny WHERE id_jidla = idJidla`,
    "smazat-jidlo-kniha-jidel": `DELETE FROM kniha_jidel WHERE id_jidla = idJidla`,
    "smazat-jidlo-ucastnici": `DELETE FROM ucastnici_jidla WHERE id_jidla = idJidla`,
    "smazat-jidlo-vedouci": `DELETE FROM jidla_vedouci WHERE id_jidla = idJidla`,
    "smazat-jidlo": `DELETE FROM jidla WHERE id_jidla = idJidla`
  }
});
