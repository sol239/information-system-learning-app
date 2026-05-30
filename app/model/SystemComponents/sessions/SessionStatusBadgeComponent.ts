import { Component } from "~/model/Component";

export const sessionStatusBadgeComponent = new Component({
  id: "stitek-stavu-turnusu",
  name: "Štítek stavu turnusu",
  tags: ["turnusy"],
  description: `Štítek s dynamickými barvami řešenými přes inline styly pro zamezení úniku CSS.`,

  html: `
<div class="obal-stavu-turnusu">
  <span class="stitek-stavu-turnusu" 
        style="color: {{ s_barva_textu }}; background-color: {{ s_barva_pozadi }}; border-color: {{ s_barva_textu }};">
    {{ text_stavu }}
  </span>
</div>
`,

  css: `
.obal-stavu-turnusu {
  display: inline-flex;
  align-items: center;
}

.stitek-stavu-turnusu {
  display: inline-flex;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid;
}
`,

  js: `
let text_stavu = "VOLNO";
let s_barva_textu = "#16a34a";
let s_barva_pozadi = "#dcfce7";

if (aktualni_pocet >= celkova_kapacita) {
    text_stavu = "PLNO";
    s_barva_textu = "#dc2626";
    s_barva_pozadi = "#fee2e2";
} else if (aktualni_pocet >= (celkova_kapacita * 0.8)) {
    text_stavu = "SKORO PLNO";
    s_barva_textu = "#854d0e";
    s_barva_pozadi = "#fef9c3";
}
`,

  sql: {
    "ziskat-kapacitu": `SELECT kapacita AS celkova_kapacita FROM turnusy WHERE id_turnusu = idTurnusu`,
    "ziskat-obsazenost": `SELECT COUNT(*) AS aktualni_pocet FROM turnusy_ucastnici WHERE id_turnusu = idTurnusu`
  }
});