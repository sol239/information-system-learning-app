import { Component } from "~/model/Component";

export const kartaJidlaKomponenta = new Component({
  id: "karta-jidla",
  name: "Karta jídla",
  tags: ["jídla"],
  description: `Karta zobrazující název jídla a štítek doby podávání. Vyžaduje generalVariable: idJidla.`,
  html: `
<div id="hlavicka-karty-jidla">
  <span id="nazev-jidla">{{ jmeno }}</span>
  <span id="stitek-doby-podavani">{{ doba_podavani }}</span>
</div>
`,
  css: `
#hlavicka-karty-jidla {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

#nazev-jidla {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

#stitek-doby-podavani {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #d1fae5;
  color: #065f46;
  white-space: nowrap;
  flex-shrink: 0;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "karta-jidla": `SELECT jmeno, doba_podavani FROM jidla WHERE id_jidla = idJidla`
  },
  sql_click: {}
});

