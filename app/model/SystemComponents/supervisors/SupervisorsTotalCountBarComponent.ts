import { Component } from "~/model/Component";

export const celkovyPocetVedoucichKomponenta = new Component({
  id: "celkovy-pocet-vedoucich",
  name: "Celkový počet vedoucích",
  tags: ["vedoucí"],
  description: `Zobrazuje celkový počet vedoucích ve widgetu nástrojové lišty.`,
  html: `
<div id="widget-poctu-vedoucich">
  <span id="ikona-poctu-vedoucich">👨‍🏫</span>
  <span id="popisek-poctu-vedoucich">Celkový počet vedoucích: {{ celkovy_pocet_vedoucich }}</span>
</div>
`,
  css: `
#widget-poctu-vedoucich {
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

#ikona-poctu-vedoucich {
  font-size: 15px;
}

#popisek-poctu-vedoucich {
  color: #a78bfa;
  font-weight: 700;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "celkovy-pocet-vedoucich": `SELECT COUNT(*) AS celkovy_pocet_vedoucich FROM vedouci`
  },
  sql_click: {}
});
