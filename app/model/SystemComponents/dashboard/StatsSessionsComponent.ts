import { Component } from "~/model/Component";

export const statistikaTurnusuKomponenta = new Component({
  id: "statistika-turnusu",
  name: "Statistika turnusů",
  tags: ["statistika", "turnusů"],
  description: `Komponenta pro statistiku turnusů. SQL: SELECT COUNT(*) as pocet_turnusu FROM turnusy`,
  html: `
  <div id="statistika-turnusu-karta">
    <div id="statistika-turnusu-ikona">📅</div>
    <div id="statistika-turnusu-obsah">
      <div id="statistika-turnusu-pocet">{{ pocet_turnusu }}</div>
      <div id="statistika-turnusu-popisek">turnusů</div>
    </div>
  </div>
  `,
  css: `
#statistika-turnusu-karta {
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

#statistika-turnusu-ikona {
  font-size: 32px;
}

#statistika-turnusu-pocet {
  font-size: 28px;
  font-weight: bold;
  color: #111111;
}

#statistika-turnusu-popisek {
  font-size: 13px;
  color: #666666;
  margin-top: 4px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-turnusu": `SELECT COUNT(*) as pocet_turnusu FROM turnusy`
  },
  sql_click: {}
});
