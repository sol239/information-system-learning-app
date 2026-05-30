import { Component } from "~/model/Component";

export const editVstupAlergenyJidlaKomponenta = new Component({
  id: "edit-vstup-alergeny-jidla",
  name: "Vstup – Edit alergeny jídla",
  tags: ["jídla"],
  description: "Vícenásobný výběr alergenů jídla. Vyžaduje generalVariable: idJidla.",

  html: `
<div class="form-radek">
  <label for="edit-vstup_alergeny_jidla-{{ idJidla }}">Alergeny:</label>
  <div id="edit-vstup_alergeny_jidla-{{ idJidla }}" class="vyber-checkboxu">
    {{ moznosti_alergenu_edit_jidla }}
  </div>
  <input type="hidden" id="system-edit_vstup_alergeny_jidla-{{ idJidla }}" name="system-edit_vstup_alergeny_jidla" />
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
const checkboxesAlergenuEditJidla = document.querySelectorAll('#edit-vstup_alergeny_jidla-' + idJidla + ' input[type="checkbox"]');
const hiddenAlergenyEditJidla = document.querySelector('#system-edit_vstup_alergeny_jidla-' + idJidla);

function syncAlergenyEditJidla() {
  if (!hiddenAlergenyEditJidla) return;

  const hodnoty = Array.from(checkboxesAlergenuEditJidla)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenAlergenyEditJidla.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenAlergenyEditJidla.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesAlergenuEditJidla.length > 0) {
  syncAlergenyEditJidla();

  checkboxesAlergenuEditJidla.forEach(function(checkbox) {
    if (checkbox.dataset.editAlergenyJidlaChange === '1') return;
    checkbox.dataset.editAlergenyJidlaChange = '1';
    checkbox.addEventListener('change', syncAlergenyEditJidla);
  });
}
`,
  sql: {
    nacistAlergenyJidla: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || a.id_alergenu || '"' || CASE WHEN ja.id_jidla IS NULL THEN '' ELSE ' checked' END || '> ' || a.jmeno || '</label>', '') FROM alergeny a LEFT JOIN jidla_alergeny ja ON ja.id_alergenu = a.id_alergenu AND ja.id_jidla = idJidla ORDER BY a.id_alergenu) AS moznosti_alergenu_edit_jidla`
  },
});
