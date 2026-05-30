import { Component } from "~/model/Component";

export const jidelnicekRadekJidlaKomponenta = new Component({
  id: "jidelnicek-radek-jidla",
  name: "Jídelníček – Řádek jídla",
  tags: ["jídelníček"],
  description: `Zobrazuje název jídla v akordéonu jídelníčku. Vyžaduje generalVariable: idJidla.`,
  html: `
<div id="jidelnicek-jidlo-nazev-kontejner">
  <span id="jidelnicek-jidlo-ikona">🍽️</span>
  <span id="jidelnicek-jidlo-nazev">{{ nazev_jidla_jidelnicku }}</span>
</div>
`,
  css: `
#jidelnicek-jidlo-nazev-kontejner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

#jidelnicek-jidlo-ikona {
  font-size: 20px;
  padding-top: 2px;
  flex-shrink: 0;
}

#jidelnicek-jidlo-nazev {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-radek-jidla": `SELECT j.jmeno AS nazev_jidla_jidelnicku FROM jidla j WHERE j.id_jidla = idJidla`
  },
  sql_click: {}
});

export const jidelnicekAlergenyJidlaKomponenta = new Component({
  id: "jidelnicek-alergeny-jidla",
  name: "Jídelníček – Alergeny jídla",
  tags: ["jídelníček"],
  description: `Zobrazuje alergeny jídla v akordéonu jídelníčku. Vyžaduje generalVariable: idJidla.`,
  html: `
<div id="jidelnicek-jidlo-alergeny-{{ idJidla }}">{{ pilulky_alergenu_jidelnicku }}</div>
`,
  css: `
[id^="jidelnicek-jidlo-alergeny-"] {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pilulka-alergenu-jidelnicku {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  background-color: #fce7f3;
  border: 1px solid #fbcfe8;
  color: #be185d;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-alergeny-jidla": `SELECT GROUP_CONCAT('<span class="pilulka-alergenu-jidelnicku">' || a.jmeno || '</span>', '') AS pilulky_alergenu_jidelnicku FROM alergeny a JOIN jidla_alergeny ja ON a.id_alergenu = ja.id_alergenu WHERE ja.id_jidla = idJidla`
  },
  sql_click: {}
});

export const jidelnicekDobaPodavaniJidlaKomponenta = new Component({
  id: "jidelnicek-doba-podavani-jidla",
  name: "Jídelníček – Doba podávání jídla",
  tags: ["jídelníček"],
  description: `Zobrazuje dobu podávání jídla v akordéonu jídelníčku. Vyžaduje generalVariable: idJidla.`,
  html: `
  <span id="jidelnicek-jidlo-doba-stitek">{{ doba_podavani_jidelnicku }}</span>
`,
  css: `
#jidelnicek-jidlo-doba-stitek {
  display: inline-flex;
  align-items: center;
  padding: 5px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  background-color: #eab308;
  color: #ffffff;
  white-space: nowrap;
  flex-shrink: 0;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-doba-podavani-jidla": `SELECT j.doba_podavani AS doba_podavani_jidelnicku FROM jidla j WHERE j.id_jidla = idJidla`
  },
  sql_click: {}
});
