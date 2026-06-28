import { Component } from "~/model/Component";

export const razeniJidelKomponenta = new Component({
  id: "razeni-jidel",
  name: "Řazení jídel",
  tags: ["jídla", "řazení", "sql"],
  description: "Výběr řazení jídel podle názvu, doby podávání nebo počtu alergenů.",

  html: `
<div id="razeni-jidel">
  <label for="system-razeni_jidel">Řadit:</label>
  <select id="system-razeni_jidel">
    <option value="nazev" selected>Název</option>
    <option value="doba">Doba podávání</option>
    <option value="alergeny">Počet alergenů</option>
  </select>
</div>
`,

  css: `
#razeni-jidel {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #065f46;
  border-radius: 8px;
  background-color: #ffffff;
}

#razeni-jidel label {
  font-size: 13px;
  font-weight: 600;
  color: #065f46;
  white-space: nowrap;
}

#system-razeni_jidel {
  min-width: 110px;
  border: 0;
  outline: none;
  background: transparent;
  color: #111827;
  font-size: 14px;
}
`,

  js: ``,
  sql: {
    "jidla-serazeni-podle-nazvu": `
SELECT j.id_jidla AS id_jidla_razeni_nazev
FROM jidla j
ORDER BY j.jmeno, j.id_jidla
`,
    "jidla-serazeni-podle-doby-podavani": `
SELECT j.id_jidla AS id_jidla_razeni_doba
FROM jidla j
ORDER BY j.doba_podavani, j.id_jidla
`,
    "jidla-serazeni-podle-poctu-alergenu": `
SELECT
  j.id_jidla AS id_jidla_razeni_alergeny,
  COUNT(ja.id_alergenu) AS pocet_alergenu_razeni_jidla
FROM jidla j
LEFT JOIN jidla_alergeny ja
  ON ja.id_jidla = j.id_jidla
GROUP BY j.id_jidla
ORDER BY COUNT(ja.id_alergenu), j.id_jidla
`
  },
});
