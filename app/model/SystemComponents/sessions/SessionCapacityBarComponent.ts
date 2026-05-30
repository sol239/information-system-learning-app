import { Component } from "~/model/Component";

export const kapacitaTurnusuKomponenta = new Component({
  id: "kapacita-turnusu",
  name: "Kapacita turnusu",
  tags: ["turnusy"],
  description: `Zobrazuje obsazenost, kapacitu a progress bar turnusu. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div class="kapacita-turnusu-kontejner">
  <div class="kapacita-turnusu-hlavicka">
    <span class="kapacita-turnusu-popisek">Kapacita</span>
    <span class="kapacita-turnusu-pocet">{{ pocet_prihlasenych }}/{{ kapacita_turnusu }}</span>
  </div>
  <div class="kapacita-turnusu-barva-pozadi">
    <div class="kapacita-turnusu-barva-vypln" style="width: {{ procento_obsazenosti }}%"></div>
  </div>
  <div class="kapacita-turnusu-procenta">{{ procento_obsazenosti }}% obsazeno</div>
</div>
`,
  css: `
.kapacita-turnusu-kontejner {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 310px;
}

.kapacita-turnusu-hlavicka {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #374151;
}

.kapacita-turnusu-popisek {
  font-weight: 500;
}

.kapacita-turnusu-pocet {
  font-weight: 700;
  color: #374151;
}

.kapacita-turnusu-barva-pozadi {
  background: #e5e7eb;
  border-radius: 9999px;
  height: 8px;
  overflow: hidden;
  width: 100%;
}

.kapacita-turnusu-barva-vypln {
  height: 100%;
  background: #16a34a;
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.kapacita-turnusu-procenta {
  font-size: 12px;
  color: #6b7280;
}
`,
  js: `
let procento_obsazenosti = 0;

if (kapacita_turnusu > 0) {
  procento_obsazenosti = Math.round((pocet_prihlasenych / kapacita_turnusu) * 100);
} else {
  procento_obsazenosti = 0;
}
`,
  js_click: ``,
  sql: {
    "ziskej_data_turnusu": `SELECT COUNT(tu.id_ucastnika) AS pocet_prihlasenych, t.kapacita AS kapacita_turnusu FROM turnusy t LEFT JOIN turnusy_ucastnici tu ON t.id_turnusu = tu.id_turnusu WHERE t.id_turnusu = idTurnusu GROUP BY t.kapacita`
  },
  sql_click: {}
});
