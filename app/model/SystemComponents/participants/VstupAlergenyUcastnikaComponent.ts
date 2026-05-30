import { Component } from "~/model/Component";

export const vstupAlergenyUcastnikaKomponenta = new Component({
  id: "vstup-alergeny-ucastnika",
  name: "Vstup – Alergeny účastníka",
  tags: ["účastníci"],
  description: "Vícenásobný výběr alergenů pro nového účastníka.",

  html: `
<div class="form-radek">
  <label for="vstup_alergeny_ucastnika">Alergeny:</label>
  <div id="vstup_alergeny_ucastnika" class="vyber-checkboxu">
    {{ moznosti_alergenu_vstup_ucastnika }}
  </div>
  <input type="hidden" id="system-vstup_alergeny_ucastnika" name="system-vstup_alergeny_ucastnika" value="NULL" />
</div>
`,

  css: `
.form-radek { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-radek label { font-size: 13px; font-weight: 600; color: #374151; }
.vyber-checkboxu { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; min-width: 280px; max-height: 150px; overflow-y: auto; background: #ffffff; }
.volba-radek { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 4px; font-size: 14px; font-weight: 400; cursor: pointer; }
.volba-radek:hover { background: #f3f4f6; }
.volba-radek input { width: 16px; height: 16px; }
`,

  js: `
const checkboxesAlergenuVstupUcastnika = document.querySelectorAll('#vstup_alergeny_ucastnika input[type="checkbox"]');
const hiddenAlergenyVstupUcastnika = document.querySelector('#system-vstup_alergeny_ucastnika');

function syncAlergenyVstupUcastnika() {
  if (!hiddenAlergenyVstupUcastnika) return;

  const hodnoty = Array.from(checkboxesAlergenuVstupUcastnika)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenAlergenyVstupUcastnika.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenAlergenyVstupUcastnika.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesAlergenuVstupUcastnika.length > 0) {
  syncAlergenyVstupUcastnika();

  checkboxesAlergenuVstupUcastnika.forEach(function(checkbox) {
    checkbox.addEventListener('change', syncAlergenyVstupUcastnika);
  });
}
`,
  sql: {
    nacistAlergenyUcastnika: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || id_alergenu || '"> ' || jmeno || '</label>', '') FROM alergeny ORDER BY id_alergenu) AS moznosti_alergenu_vstup_ucastnika`
  },
});
