import { Component } from "~/model/Component";

export const statsMaxParticipantAgeComponent = new Component({
  id: "statistika-max-vek-ucastnika",
  name: "Statistika – Max. věk účastníka",
  tags: ["dashboard", "statistika", "účastníci", "věk"],
  description: `Zobrazuje věk nejstaršího účastníka.`,
  html: `
  <div id="statistika-max-vek-ucastnika-card">
    <div id="statistika-max-vek-ucastnika-icon">MAX</div>
    <div id="statistika-max-vek-ucastnika-content">
      <div id="statistika-max-vek-ucastnika-number">{{ max_vek_ucastnika }}</div>
      <div id="statistika-max-vek-ucastnika-label">věk nejstaršího účastníka</div>
    </div>
  </div>
  `,
  css: `
#statistika-max-vek-ucastnika-card {
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

#statistika-max-vek-ucastnika-icon {
  font-size: 22px;
  font-weight: 700;
  color: #111111;
}

#statistika-max-vek-ucastnika-number {
  font-size: 28px;
  font-weight: bold;
  color: #111111;
}

#statistika-max-vek-ucastnika-label {
  font-size: 13px;
  color: #666666;
  margin-top: 4px;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "statistika-max-vek-ucastnika": `SELECT MAX(u.vek) AS max_vek_ucastnika FROM ucastnici u`
  },
  sql_click: {}
});
