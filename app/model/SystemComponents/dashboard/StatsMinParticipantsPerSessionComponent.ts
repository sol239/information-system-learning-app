import { Component } from "~/model/Component";

export const statsMinParticipantsPerSessionComponent = new Component({
  id: "statistika-min-ucastniku-turnusu",
  name: "Statistika – Min. účastníků na turnus",
  tags: ["dashboard", "statistika", "účastníci", "turnusy"],
  description: `Zobrazuje minimální počet účastníků zapsaných v jednom turnusu.`,
  html: `
  <div id="statistika-min-ucastniku-turnusu-card">
    <div id="statistika-min-ucastniku-turnusu-icon">MIN</div>
    <div id="statistika-min-ucastniku-turnusu-content">
      <div id="statistika-min-ucastniku-turnusu-number">{{ minimalni_pocet_zapsanych }}</div>
      <div id="statistika-min-ucastniku-turnusu-label">min. účastníků v turnusu</div>
    </div>
  </div>
  `,
  css: `
#statistika-min-ucastniku-turnusu-card {
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

#statistika-min-ucastniku-turnusu-icon {
  font-size: 14px;
  font-weight: 700;
  color: #111111;
}

#statistika-min-ucastniku-turnusu-number {
  font-size: 20px;
  font-weight: bold;
  color: #111111;
}

#statistika-min-ucastniku-turnusu-label {
  font-size: 11px;
  color: #666666;
  margin-top: 2px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-min-ucastniku-turnusu": `SELECT MIN(pocet_zapsanych) as minimalni_pocet_zapsanych FROM (SELECT COUNT(*) AS pocet_zapsanych FROM turnusy_ucastnici GROUP BY id_turnusu);`
  },
  sql_click: {}
});
