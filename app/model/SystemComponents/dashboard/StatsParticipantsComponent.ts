import { Component } from "~/model/Component";

export const statistikaUcastnikuKomponenta = new Component({
  id: "statistika-ucastniku",
  name: "Statistika úèastníkù",
  tags: ["statistika", "úèastníkù"],
  description: `Komponenta pro statistiku úèastníkù. SQL: SELECT COUNT(*) as pocet_ucastniku FROM ucastnici`,
  html: `
  <div id="statistika-ucastniku-karta">
    <div id="statistika-ucastniku-ikona">??</div>
    <div id="statistika-ucastniku-obsah">
      <div id="statistika-ucastniku-pocet">{{ pocet_ucastniku }}</div>
      <div id="statistika-ucastniku-popisek">úèastníkù</div>
    </div>
  </div>
  `,
  css: `
#statistika-ucastniku-karta {
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width:400px;
}

#statistika-ucastniku-ikona {
  font-size: 21px;
}

#statistika-ucastniku-pocet {
  font-size: 20px;
  font-weight: bold;
  color: #111111;
}

#statistika-ucastniku-popisek {
  font-size: 11px;
  color: #666666;
  margin-top: 2px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-ucastniku": `SELECT COUNT(*) as pocet_ucastniku FROM ucastnici`
  },
  sql_click: {}
});
