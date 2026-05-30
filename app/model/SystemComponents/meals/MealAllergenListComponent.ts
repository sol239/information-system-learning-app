import { Component } from "~/model/Component";

export const seznamAlergenuJidlaKomponenta = new Component({
  id: "seznam-alergenu-jidla",
  name: "Seznam alergenů jídla",
  tags: ["jídla"],
  description: `Zobrazuje pilulky alergenů pro jídlo. Vyžaduje generalVariable: idJidla.`,
  html: `
<div id="sekce-alergenu-jidla">
  <div id="popisek-alergenu-jidla">Alergeny:</div>
  <div id="pilulky-alergenu-jidla">{{ pilulky_alergenu_jidla }}</div>
</div>
`,
  css: `
#sekce-alergenu-jidla {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

#popisek-alergenu-jidla {
  font-size: 13px;
  color: #6b7280;
}

#pilulky-alergenu-jidla {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pilulka-alergenu-jidla {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fce7f3;
  border: 1px solid #fbcfe8;
  color: #be185d;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "seznam-alergenu-jidla": `SELECT GROUP_CONCAT('<span class="pilulka-alergenu-jidla">' || a.jmeno || '</span>', '') AS pilulky_alergenu_jidla
FROM alergeny a
JOIN jidla_alergeny ja ON a.id_alergenu = ja.id_alergenu
WHERE ja.id_jidla = idJidla`
  },
  sql_click: {}
});
