import { Component } from "~/model/Component";

export const stitekAlergenuUcastnikaKomponenta = new Component({
  id: "stitek-alergenu-ucastnika",
  name: "Štítek alergenů účastníka",
  tags: ["účastníci"],
  description: `Zobrazuje štítek s počtem alergenů účastníka (zelený=0, růžový>=1). Vyžaduje generalVariable: idUcastnika.`,
  html: `<div class="stitek-alergenu-ucastnika" style="background-color: {{ barva }};">Alergeny: {{ pocet_alergenu_ucastnika }}</div>`,
  css: `
.stitek-alergenu-ucastnika {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}
`,
  js: `let barva = "#FFFFFF";
  if (pocet_alergenu_ucastnika === 0) {
    barva = "#9aefb8";
  } else {
    barva = "#ea98ba";
  }`,
  js_click: ``,
  sql: {
    "pocet-alergenu-ucastnika": `SELECT COUNT(ua.id_alergenu) AS pocet_alergenu_ucastnika
FROM ucastnici u
JOIN ucastnici_alergeny ua 
  ON u.id_ucastnika = ua.id_ucastnika
WHERE u.id_ucastnika = idUcastnika;`
  },
  sql_click: {}
});
