import { Component } from "~/model/Component";

export const statsTotalParticipantsInSessionsComponent = new Component({
  id: "statistika-celkem-ucasti-turnusu",
  name: "Statistika – Celkem účastí v turnusech",
  tags: ["dashboard", "statistika", "účastníci", "turnusy"],
  description: `Zobrazuje celkový počet zápisů účastníků ve všech turnusech.`,
  html: `
  <div id="statistika-celkem-ucasti-turnusu-card">
    <div id="statistika-celkem-ucasti-turnusu-icon">SUM</div>
    <div id="statistika-celkem-ucasti-turnusu-content">
      <div id="statistika-celkem-ucasti-turnusu-number">{{ celkem_ucasti_v_turnusech }}</div>
      <div id="statistika-celkem-ucasti-turnusu-label">účastí ve všech turnusech</div>
    </div>
  </div>
  `,
  css: `
#statistika-celkem-ucasti-turnusu-card {
  background-color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 400px;
}

#statistika-celkem-ucasti-turnusu-icon {
  font-size: 22px;
  font-weight: 700;
  color: #111111;
}

#statistika-celkem-ucasti-turnusu-number {
  font-size: 28px;
  font-weight: bold;
  color: #111111;
}

#statistika-celkem-ucasti-turnusu-label {
  font-size: 13px;
  color: #666666;
  margin-top: 4px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-celkem-ucasti-turnusu": `SELECT COUNT(*) AS celkem_ucasti_v_turnusech FROM turnusy_ucastnici`
  },
  sql_click: {}
});
