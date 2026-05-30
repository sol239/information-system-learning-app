import { Component } from "~/model/Component";

export const jidelnicekHlavickaDneKomponenta = new Component({
  id: "jidelnicek-hlavicka-dne",
  name: "Jídelníček – Hlavička dne",
  tags: ["jídelníček"],
  description: `Zobrazuje datum dne v akordéonu jídelníčku. Vyžaduje generalVariable: datumDne (formát YYYY-MM-DD).`,
  html: `
<div id="jidelnicek-dne-nazev">
  <span id="jidelnicek-dne-ikona">📅</span>
  <span id="jidelnicek-dne-datum">{{ zobrazeni_dne }}</span>
</div>
`,
  css: `
#jidelnicek-dne-nazev {
  display: flex;
  align-items: center;
  gap: 10px;
}

#jidelnicek-dne-ikona {
  font-size: 16px;
}

#jidelnicek-dne-datum {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-hlavicka-dne": `SELECT strftime('%d. %m. %Y', 'datumDne') AS zobrazeni_dne`
  },
  sql_click: {}
});

export const jidelnicekPocetJidelDneKomponenta = new Component({
  id: "jidelnicek-pocet-jidel-dne",
  name: "Jídelníček – Počet jídel dne",
  tags: ["jídelníček"],
  description: `Zobrazuje počet unikátních jídel dne v jídelníčku. Vyžaduje generalVariable: datumDne (formát YYYY-MM-DD).`,
  html: `
<span id="jidelnicek-dne-jidla-stitek">Unikátních jídel: {{ pocet_unikatnich_jidel_dne }}</span>
`,
  css: `
#jidelnicek-dne-jidla-stitek {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid #bbf7d0;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-pocet-jidel-dne": `SELECT COUNT(DISTINCT id_jidla) AS pocet_unikatnich_jidel_dne FROM kniha_jidel WHERE DATE(datum) = DATE('datumDne')`
  },
  sql_click: {}
});

export const jidelnicekPocetPorciDneKomponenta = new Component({
  id: "jidelnicek-pocet-porci-dne",
  name: "Jídelníček – Počet porcí dne",
  tags: ["jídelníček"],
  description: `Zobrazuje počet porcí dne v jídelníčku. Vyžaduje generalVariable: datumDne (formát YYYY-MM-DD).`,
  html: `
<span id="jidelnicek-dne-porci-stitek">Počet porcí: {{ pocet_porci_dne }}</span>
`,
  css: `
#jidelnicek-dne-porci-stitek {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #ede9fe;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-pocet-porci-dne": `SELECT (
  SELECT COUNT(*)
  FROM ucastnici_jidla uj
  WHERE DATE(uj.datum_podavani) = DATE('datumDne')
) + (
  SELECT COUNT(*)
  FROM jidla_vedouci jv
  WHERE DATE(jv.datum_podavani) = DATE('datumDne')
) AS pocet_porci_dne`
  },
  sql_click: {}
});
