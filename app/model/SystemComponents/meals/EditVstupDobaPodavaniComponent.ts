import { Component } from "~/model/Component";

export const editVstupDobaPodavaniKomponenta = new Component({
  id: "edit-vstup-doba-podavani",
  name: "Vstup – Edit Doba podávání",
  tags: ["jídla"],
  description: "Výběr doby podávání jídla při editaci. Vyžaduje generalVariable: idJidla.",

  html: `
<div class="form-radek">
  <label>Doba podávání:</label>
  <select id="system-edit_vstup_doba_podavani">
    <option value="snídaně" {{ snidane_selected }}>Snídaně</option>
    <option value="oběd" {{ obed_selected }}>Oběd</option>
    <option value="večeře" {{ vecere_selected }}>Večeře</option>
  </select>
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.form-radek input, .form-radek select { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
`,

  js: `let snidane_selected = "";
let obed_selected = "";
let vecere_selected = "";

if (edit_vstup_doba_podavani === "snídaně") {
  snidane_selected = "selected";
} else if (edit_vstup_doba_podavani === "oběd") {
  obed_selected = "selected";
} else if (edit_vstup_doba_podavani === "večeře") {
  vecere_selected = "selected";
}`,
  sql: {
    nacistDobuPodavani: `SELECT doba_podavani AS edit_vstup_doba_podavani FROM jidla WHERE id_jidla = idJidla`
  },
});
