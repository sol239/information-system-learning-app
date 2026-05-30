import { Component } from "~/model/Component";

export const statistikaJidelKomponenta = new Component({
  id: "statistika-jidel",
  name: "Statistika jídel",
  tags: ["statistika", "jídel"],
  description: `Komponenta pro statistiku jídel. SQL: SELECT COUNT(*) as pocet_jidel FROM jidla`,
  html: `
  <div id="statistika-jidel-karta">
    <div id="statistika-jidel-ikona">🍽️</div>
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
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width:400px;
}

#statistika-jidel-ikona {
  font-size: 32px;
}

#statistika-jidel-pocet {
  font-size: 28px;
  font-weight: bold;
  color: #111111;
}

#statistika-jidel-popisek {
  font-size: 13px;
  color: #666666;
  margin-top: 4px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-jidel": `SELECT COUNT(*) as pocet_jidel FROM jidla`
  },
  sql_click: {}
});
