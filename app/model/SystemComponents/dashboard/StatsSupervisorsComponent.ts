import { Component } from "~/model/Component";

export const statistikaVedoucichKomponenta = new Component({
  id: "statistika-vedoucich",
  name: "Statistika vedoucích",
  tags: ["statistika", "vedoucích"],
  description: `Komponenta pro statistiku vedoucích. SQL: SELECT COUNT(*) as pocet_vedoucich FROM vedouci`,
  html: `
  <div id="statistika-vedoucich-karta">
    <div id="statistika-vedoucich-ikona">?????</div>
    <div id="statistika-vedoucich-obsah">
      <div id="statistika-vedoucich-pocet">{{ pocet_vedoucich }}</div>
      <div id="statistika-vedoucich-popisek">vedoucích</div>
    </div>
  </div>
  `,
  css: `
#statistika-vedoucich-karta {
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

#statistika-vedoucich-ikona {
  font-size: 21px;
}

#statistika-vedoucich-pocet {
  font-size: 20px;
  font-weight: bold;
  color: #111111;
}

#statistika-vedoucich-popisek {
  font-size: 11px;
  color: #666666;
  margin-top: 2px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-vedoucich": `SELECT COUNT(*) as pocet_vedoucich FROM vedouci`
  },
  sql_click: {}
});
