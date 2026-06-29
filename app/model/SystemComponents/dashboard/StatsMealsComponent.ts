import { Component } from "~/model/Component";

export const statistikaJidelKomponenta = new Component({
  id: "statistika-jidel",
  name: "Statistika jídel",
  tags: ["statistika", "jídel"],
  description: `Komponenta pro statistiku jídel. SQL: SELECT COUNT(*) as pocet_jidel FROM jidla`,
  html: `
  <div id="statistika-jidel-karta">
    <div id="statistika-jidel-ikona">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3v7"/>
        <path d="M8 3v7"/>
        <path d="M4 7h4"/>
        <path d="M6 10v11"/>
        <path d="M17 3v18"/>
        <path d="M14 3h3a3 3 0 0 1 3 3v5h-6z"/>
      </svg>
    </div>
    <div id="statistika-jidel-obsah">
      <div id="statistika-jidel-pocet">{{ pocet_jidel }}</div>
      <div id="statistika-jidel-popisek">jídel</div>
    </div>
  </div>
  `,
  css: `
#statistika-jidel-karta {
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 158px;
  max-width: 158px;
}

#statistika-jidel-ikona {
  color: #334155;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
}

#statistika-jidel-ikona svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

#statistika-jidel-pocet {
  font-size: 20px;
  font-weight: bold;
  color: #111111;
}

#statistika-jidel-popisek {
  font-size: 11px;
  color: #666666;
  margin-top: 2px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-jidel": `SELECT COUNT(*) as pocet_jidel FROM jidla`
  },
  sql_click: {}
});
