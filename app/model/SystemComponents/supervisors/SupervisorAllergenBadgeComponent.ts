import { Component } from "~/model/Component";

export const stitekAlergenuVedoucihoKomponenta = new Component({
  id: "stitek-alergenu-vedouciho",
  name: "Štítek alergenů vedoucího",
  tags: ["vedoucí"],
  description: `Zobrazuje štítek s počtem alergenů vedoucího (zelený=0, růžový>=1). Vyžaduje generalVariable: idVedouciho.`,
  html: `<div class="stitek-alergenu-vedouciho" style="background-color: {{ barva }};">Alergeny: {{ pocet_alergenu_vedouciho }}</div>`,
  css: `
.stitek-alergenu-vedouciho {
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
  if (pocet_alergenu_vedouciho === 0) {
    barva = "#9aefb8";
  } else {
    barva = "#ea98ba";
  }`,
  js_click: ``,
  sql: {
    "pocet-alergenu-vedouciho": `SELECT COUNT(va.id_alergenu) AS pocet_alergenu_vedouciho
FROM vedouci v
JOIN vedouci_alergeny va
  ON v.id_vedouciho = va.id_vedouciho
WHERE v.id_vedouciho = idVedouciho;`
  },
  sql_click: {}
});
