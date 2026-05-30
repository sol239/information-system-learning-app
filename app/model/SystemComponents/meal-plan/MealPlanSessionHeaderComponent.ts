import { Component } from "~/model/Component";

export const jidelnicekHlavickaTurnusuKomponenta = new Component({
  id: "jidelnicek-hlavicka-turnusu",
  name: "Jídelníček – Hlavička turnusu",
  tags: ["jídelníček"],
  description: `Zobrazuje název turnusu v akordéonu jídelníčku. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div id="jidelnicek-turnusu-nazev">
  <span id="jidelnicek-turnusu-ikona">📅</span>
  <span id="jidelnicek-turnusu-popisek">Turnus {{ idTurnusu }}</span>
</div>
`,
  css: `
#jidelnicek-turnusu-nazev {
  display: flex;
  align-items: center;
  gap: 10px;
}

#jidelnicek-turnusu-ikona {
  font-size: 20px;
}

#jidelnicek-turnusu-popisek {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}
`,
  js: ``,
  js_click: ``,
  sql: {},
  sql_click: {}
});

export const jidelnicekDatumTurnusuKomponenta = new Component({
  id: "jidelnicek-datum-turnusu",
  name: "Jídelníček – Datum turnusu",
  tags: ["jídelníček"],
  description: `Zobrazuje datumový rozsah turnusu v jídelníčku. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<span id="jidelnicek-turnusu-datum-stitek">{{ datum_od_jidelnicku }} – {{ datum_do_jidelnicku }}</span>
`,
  css: `
#jidelnicek-turnusu-datum-stitek {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #cffafe;
  color: #0e7490;
  border: 1px solid #a5f3fc;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-datum-turnusu": `SELECT strftime('%d. %m. %Y', datum_od) AS datum_od_jidelnicku, strftime('%d. %m. %Y', datum_do) AS datum_do_jidelnicku FROM turnusy WHERE id_turnusu = idTurnusu`
  },
  sql_click: {}
});

export const jidelnicekPocetJidelTurnusuKomponenta = new Component({
  id: "jidelnicek-pocet-jidel-turnusu",
  name: "Jídelníček – Počet jídel turnusu",
  tags: ["jídelníček"],
  description: `Zobrazuje počet unikátních jídel turnusu v jídelníčku. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<span id="jidelnicek-turnusu-jidla-stitek">Unikátních jídel: {{ pocet_unikatnich_jidel }}</span>
`,
  css: `
#jidelnicek-turnusu-jidla-stitek {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
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
    "jidelnicek-pocet-jidel-turnusu": `SELECT COUNT(DISTINCT kj.id_jidla) AS pocet_unikatnich_jidel FROM turnusy t LEFT JOIN kniha_jidel kj ON DATE(kj.datum) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do) WHERE t.id_turnusu = idTurnusu GROUP BY t.id_turnusu`
  },
  sql_click: {}
});

export const jidelnicekPocetPorciTurnusuKomponenta = new Component({
  id: "jidelnicek-pocet-porci-turnusu",
  name: "Jídelníček – Počet porcí turnusu",
  tags: ["jídelníček"],
  description: `Zobrazuje počet porcí turnusu v jídelníčku. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<span id="jidelnicek-turnusu-porci-stitek">Počet porcí: {{ pocet_porci }}</span>
`,
  css: `
#jidelnicek-turnusu-porci-stitek {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
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
    "jidelnicek-pocet-porci-turnusu": `SELECT (
  SELECT COUNT(*)
  FROM ucastnici_jidla uj
  WHERE DATE(uj.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do)
) + (
  SELECT COUNT(*)
  FROM jidla_vedouci jv
  WHERE DATE(jv.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do)
) AS pocet_porci FROM turnusy t WHERE t.id_turnusu = idTurnusu`
  },
  sql_click: {}
});
