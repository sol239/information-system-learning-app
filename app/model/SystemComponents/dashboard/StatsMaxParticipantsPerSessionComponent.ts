import { Component } from "~/model/Component";

export const statsMaxParticipantsPerSessionComponent = new Component({
  id: "statistika-max-ucastniku-turnusu",
  name: "Statistika – Max. účastníků na turnus",
  tags: ["dashboard", "statistika", "účastníci", "turnusy"],
  description: `Zobrazuje maximální počet účastníků zapsaných v jednom turnusu.`,
  html: `
  <div id="statistika-max-ucastniku-turnusu-card">
    <div id="statistika-max-ucastniku-turnusu-icon">#</div>
    <div id="statistika-max-ucastniku-turnusu-content">
      <div id="statistika-max-ucastniku-turnusu-number">{{ maximalni_pocet_zapsanych }}</div>
      <div id="statistika-max-ucastniku-turnusu-label">max. účastníků v turnusu</div>
    </div>
  </div>
  `,
  css: `
#statistika-max-ucastniku-turnusu-card {
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

#statistika-max-ucastniku-turnusu-icon {
  font-size: 21px;
  font-weight: 700;
  color: #111111;
}

#statistika-max-ucastniku-turnusu-number {
  font-size: 20px;
  font-weight: bold;
  color: #111111;
}

#statistika-max-ucastniku-turnusu-label {
  font-size: 11px;
  color: #666666;
  margin-top: 2px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-max-ucastniku-turnusu": `SELECT MAX(pocet_zapsanych) as maximalni_pocet_zapsanych FROM (SELECT COUNT(*) AS pocet_zapsanych FROM turnusy_ucastnici GROUP BY id_turnusu);`
  },
  sql_click: {}
});
