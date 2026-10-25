import { Component } from "~/model/Component";

export const smazatUcastnikaKomponenta = new Component({
  id: "smazat-ucastnika",
  name: "Smazat účastníka",
  tags: ["účastníci"],
  description: "Tlačítko pro smazání účastníka. Vyžaduje generalVariable: idUcastnika.",

  html: `
<div id="smazat-ucastnika-tlacitko">
  Smazat účastníka
</div>
`,

  css: `
#smazat-ucastnika-tlacitko {
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
    "smazat-ucastnika-turnusy": `DELETE FROM turnusy_ucastnici WHERE id_ucastnika = idUcastnika`,
    "smazat-ucastnika-alergeny": `DELETE FROM ucastnici_alergeny WHERE id_ucastnika = idUcastnika`,
    "smazat-ucastnika-jidla": `DELETE FROM ucastnici_jidla WHERE id_ucastnika = idUcastnika`,
    "smazat-ucastnika": `DELETE FROM ucastnici WHERE id_ucastnika = idUcastnika`
  }
});
