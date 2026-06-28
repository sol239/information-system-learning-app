import { Component } from "~/model/Component";

export const statsMaxParticipantAgeComponent = new Component({
  id: "statistika-max-vek-ucastnika",
  name: "Statistika max. věku",
  tags: ["dashboard", "statistika", "účastníci", "věk"],
  description: `Zobrazuje věk nejstaršího účastníka.`,
  html: `
  <div id="statistika-max-vek-ucastnika-card">
    <div id="statistika-max-vek-ucastnika-icon">MAX</div>
    <div id="statistika-max-vek-ucastnika-content">
      <div id="statistika-max-vek-ucastnika-number">{{ max_vek_ucastnika }}</div>
      <div id="statistika-max-vek-ucastnika-label">max. věk</div>
    </div>
  </div>
  `,
  css: `
#statistika-max-vek-ucastnika-card {
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

#statistika-max-vek-ucastnika-icon {
  font-size: 14px;
  font-weight: 700;
  color: #111111;
}

#statistika-max-vek-ucastnika-number {
  font-size: 20px;
  font-weight: bold;
  color: #111111;
}

#statistika-max-vek-ucastnika-label {
  font-size: 11px;
  color: #666666;
  margin-top: 2px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-max-vek-ucastnika": `SELECT MAX(u.vek) AS max_vek_ucastnika FROM ucastnici u`
  },
  sql_click: {}
});
