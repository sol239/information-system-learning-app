import { Component } from "~/model/Component";

export const statistikaUcastnikuKomponenta = new Component({
  id: "statistika-ucastniku",
  name: "Statistika účastníků",
  tags: ["statistika", "účastníků"],
  description: `Komponenta pro statistiku účastníků. SQL: SELECT COUNT(*) as pocet_ucastniku FROM ucastnici`,
  html: `
  <div id="statistika-ucastniku-karta">
    <div id="statistika-ucastniku-ikona">👥</div>
    <div id="statistika-ucastniku-obsah">
      <div id="statistika-ucastniku-pocet">{{ pocet_ucastniku }}</div>
      <div id="statistika-ucastniku-popisek">účastníků</div>
    </div>
  </div>
  `,
  css: `
#statistika-ucastniku-karta {
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

#statistika-ucastniku-ikona {
  font-size: 32px;
}

#statistika-ucastniku-pocet {
  font-size: 28px;
  font-weight: bold;
  color: #111111;
}

#statistika-ucastniku-popisek {
  font-size: 13px;
  color: #666666;
  margin-top: 4px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-ucastniku": `SELECT COUNT(*) as pocet_ucastniku FROM ucastnici`
  },
  sql_click: {}
});
