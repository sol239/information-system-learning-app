import { Component } from "~/model/Component";

export const celkovaKapacitaUcastnikuKomponenta = new Component({
  id: "celkova-kapacita-ucastniku",
  name: "Celková kapacita účastníků",
  tags: ["účastníci"],
  description: `Zobrazuje celkový počet zapsaných / celkovou kapacitu a procento obsazenosti.`,
  html: `
<div id="widget-kapacity-ucastniku">
  <span id="ikona-kapacity-ucastniku">👥</span>
  <span id="popisek-kapacity-ucastniku">Kapacita: {{ celkem_zapsanych }}/{{ celkova_kapacita }}</span>
  <div id="pozadi-kapacity-ucastniku">
    <div id="vypln-kapacity-ucastniku" style="width: {{ procento_obsazenosti_ucastniku }}%"></div>
  </div>
  <span id="procenta-kapacity-ucastniku">{{ procento_obsazenosti_ucastniku }} %</span>
</div>
`,
  css: `
#widget-kapacity-ucastniku {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  background: #18181b;
  border: 1px solid #3f3f46;
  border-radius: 10px;
  color: #e4e4e7;
  font-size: 13px;
  font-weight: 500;
}

#ikona-kapacity-ucastniku {
  font-size: 15px;
}

#pozadi-kapacity-ucastniku {
  width: 80px;
  height: 8px;
  background: #3f3f46;
  border-radius: 9999px;
  overflow: hidden;
}

#vypln-kapacity-ucastniku {
  height: 100%;
  background: #22c55e;
  border-radius: 9999px;
}

#procenta-kapacity-ucastniku {
  color: #22c55e;
  font-weight: 700;
}
`,
  js: `let procento_obsazenosti_ucastniku: number = celkem_zapsanych / celkova_kapacita * 100;
  procento_obsazenosti_ucastniku = Number(procento_obsazenosti_ucastniku.toFixed(2));`,
  js_click: ``,
  sql: {
    "celkova-kapacita-ucastniku": `SELECT
  (
    SELECT COUNT(DISTINCT id_ucastnika)
    FROM turnusy_ucastnici
  ) AS celkem_zapsanych,
  (
    SELECT SUM(kapacita)
    FROM turnusy
  ) AS celkova_kapacita`
  },
  sql_click: {}
});
