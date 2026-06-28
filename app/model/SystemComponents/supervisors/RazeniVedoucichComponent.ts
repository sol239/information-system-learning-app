import { Component } from "~/model/Component";

export const razeniVedoucichKomponenta = new Component({
  id: "razeni-vedoucich",
  name: "Řazení vedoucích",
  tags: ["vedoucí", "řazení", "sql"],
  description: "Výběr řazení vedoucích podle jména, věku, emailu nebo počtu alergenů.",

  html: `
<div id="razeni-vedoucich">
  <label for="system-razeni_vedoucich">Řadit:</label>
  <select id="system-razeni_vedoucich">
    <option value="jmeno" selected>Jméno</option>
    <option value="vek">Věk</option>
    <option value="email">Email</option>
    <option value="alergeny">Počet alergenů</option>
  </select>
</div>
`,

  css: `
#razeni-vedoucich {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d8b4fe;
  border-radius: 8px;
  background-color: #ffffff;
}

#razeni-vedoucich label {
  font-size: 13px;
  font-weight: 600;
  color: #4c1d95;
  white-space: nowrap;
}

#system-razeni_vedoucich {
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
    "vedouci-serazeni-podle-jmena": `
SELECT v.id_vedouciho AS id_vedouciho_razeni_jmeno
FROM vedouci v
ORDER BY v.jmeno, v.id_vedouciho
`,
    "vedouci-serazeni-podle-veku": `
SELECT v.id_vedouciho AS id_vedouciho_razeni_vek
FROM vedouci v
ORDER BY v.vek, v.id_vedouciho
`,
    "vedouci-serazeni-podle-emailu": `
SELECT v.id_vedouciho AS id_vedouciho_razeni_email
FROM vedouci v
ORDER BY v.email, v.id_vedouciho
`,
    "vedouci-serazeni-podle-poctu-alergenu": `
SELECT
  v.id_vedouciho AS id_vedouciho_razeni_alergeny,
  COUNT(va.id_alergenu) AS pocet_alergenu_razeni_vedouciho
FROM vedouci v
LEFT JOIN vedouci_alergeny va
  ON va.id_vedouciho = v.id_vedouciho
GROUP BY v.id_vedouciho
ORDER BY COUNT(va.id_alergenu), v.id_vedouciho
`
  },
});
