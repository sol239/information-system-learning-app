import { Component } from "~/model/Component";

export const celkovyPocetJidelKomponenta = new Component({
  id: "celkovy-pocet-jidel",
  name: "Celkový počet jídel",
  tags: ["jídla"],
  description: `Zobrazuje celkový počet jídel ve widgetu nástrojové lišty.`,
  html: `
<div id="widget-poctu-jidel">
  <span id="ikona-poctu-jidel">🍴</span>
  <span id="popisek-poctu-jidel">Celkový počet jídel: {{ celkovy_pocet_jidel }}</span>
</div>
`,
  css: `
#widget-poctu-jidel {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 10px;
  color: #e4e4e7;
  font-size: 13px;
  font-weight: 500;
}

#ikona-poctu-jidel {
  font-size: 15px;
}

#popisek-poctu-jidel {
  color: #34d399;
  font-weight: 700;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "celkovy-pocet-jidel": `SELECT COUNT(*) AS celkovy_pocet_jidel FROM jidla`
  },
  sql_click: {}
});
