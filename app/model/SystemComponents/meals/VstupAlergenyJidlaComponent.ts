import { Component } from "~/model/Component";

export const vstupAlergenyJidlaKomponenta = new Component({
  id: "vstup-alergeny-jidla",
  name: "Vstup – Alergeny jídla",
  tags: ["jídla"],
  description: "Vícenásobný výběr alergenů pro nové jídlo.",

  html: `
<div class="form-radek">
  <label for="vstup_alergeny_jidla">Alergeny:</label>
  <div id="vstup_alergeny_jidla" class="vyber-checkboxu">
    {{ moznosti_alergenu_vstup_jidla }}
  </div>
  <input type="hidden" id="system-vstup_alergeny_jidla" name="system-vstup_alergeny_jidla" value="NULL" />
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
const checkboxesAlergenuVstupJidla = document.querySelectorAll('#vstup_alergeny_jidla input[type="checkbox"]');
const hiddenAlergenyVstupJidla = document.querySelector('#system-vstup_alergeny_jidla');

function syncAlergenyVstupJidla() {
  if (!hiddenAlergenyVstupJidla) return;

  const hodnoty = Array.from(checkboxesAlergenuVstupJidla)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenAlergenyVstupJidla.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenAlergenyVstupJidla.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesAlergenuVstupJidla.length > 0) {
  syncAlergenyVstupJidla();

  checkboxesAlergenuVstupJidla.forEach(function(checkbox) {
    if (checkbox.dataset.vstupAlergenyJidlaChange === '1') return;
    checkbox.dataset.vstupAlergenyJidlaChange = '1';
    checkbox.addEventListener('change', syncAlergenyVstupJidla);
  });
}
`,
  sql: {
    nacistAlergenyJidla: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || id_alergenu || '"> ' || jmeno || '</label>', '') FROM alergeny ORDER BY id_alergenu) AS moznosti_alergenu_vstup_jidla`
  },
});
