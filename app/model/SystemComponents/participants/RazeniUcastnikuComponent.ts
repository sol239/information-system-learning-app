import { Component } from "~/model/Component";

export const razeniUcastnikuKomponenta = new Component({
  id: "razeni-ucastniku",
  name: "Řazení účastníků",
  tags: ["účastníci", "řazení", "sql"],
  description: "Výběr řazení účastníků podle jména, věku, emailu nebo počtu alergenů.",

  html: `
<div id="razeni-ucastniku">
  <label for="system-razeni_ucastniku">Řadit:</label>
  <select id="system-razeni_ucastniku">
    <option value="jmeno" selected>Jméno</option>
    <option value="vek">Věk</option>
    <option value="email">Email</option>
    <option value="alergeny">Počet alergenů</option>
  </select>
</div>
`,

  css: `
#razeni-ucastniku {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #0e7490;
  border-radius: 8px;
  background-color: #ffffff;
}

#razeni-ucastniku label {
  font-size: 13px;
  font-weight: 600;
  color: #0e7490;
  white-space: nowrap;
}

#system-razeni_ucastniku {
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
    "ucastnici-serazeni-podle-jmena": `
SELECT u.id_ucastnika AS id_ucastnika_razeni_jmeno
FROM ucastnici u
ORDER BY u.jmeno, u.id_ucastnika
`,
    "ucastnici-serazeni-podle-veku": `
SELECT u.id_ucastnika AS id_ucastnika_razeni_vek
FROM ucastnici u
ORDER BY u.vek, u.id_ucastnika
`,
    "ucastnici-serazeni-podle-emailu": `
SELECT u.id_ucastnika AS id_ucastnika_razeni_email
FROM ucastnici u
ORDER BY u.email, u.id_ucastnika
`,
    "ucastnici-serazeni-podle-poctu-alergenu": `
SELECT
  u.id_ucastnika AS id_ucastnika_razeni_alergeny,
  COUNT(ua.id_alergenu) AS pocet_alergenu_razeni_ucastnika
FROM ucastnici u
LEFT JOIN ucastnici_alergeny ua
  ON ua.id_ucastnika = u.id_ucastnika
GROUP BY u.id_ucastnika
ORDER BY COUNT(ua.id_alergenu), u.id_ucastnika
`
  },
});
