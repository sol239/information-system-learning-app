import { Component } from "~/model/Component";

export const editVstupAlergenyUcastnikaKomponenta = new Component({
  id: "edit-vstup-alergeny-ucastnika",
  name: "Vstup – Edit alergeny účastníka",
  tags: ["účastníci"],
  description: "Vícenásobný výběr alergenů účastníka. Vyžaduje generalVariable: idUcastnika.",

  html: `
<div class="form-radek">
  <label for="edit-vstup_alergeny_ucastnika-{{ idUcastnika }}">Alergeny:</label>
  <div id="edit-vstup_alergeny_ucastnika-{{ idUcastnika }}" class="vyber-checkboxu">
    {{ moznosti_alergenu_edit_ucastnika }}
  </div>
  <input type="hidden" id="system-edit_vstup_alergeny_ucastnika-{{ idUcastnika }}" name="system-edit_vstup_alergeny_ucastnika" />
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
const checkboxesAlergenuEditUcastnika = document.querySelectorAll('#edit-vstup_alergeny_ucastnika-' + idUcastnika + ' input[type="checkbox"]');
const hiddenAlergenyEditUcastnika = document.querySelector('#system-edit_vstup_alergeny_ucastnika-' + idUcastnika);

function syncAlergenyEditUcastnika() {
  if (!hiddenAlergenyEditUcastnika) return;

  const hodnoty = Array.from(checkboxesAlergenuEditUcastnika)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenAlergenyEditUcastnika.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenAlergenyEditUcastnika.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesAlergenuEditUcastnika.length > 0) {
  syncAlergenyEditUcastnika();

  checkboxesAlergenuEditUcastnika.forEach(function(checkbox) {
    checkbox.addEventListener('change', syncAlergenyEditUcastnika);
  });
}
`,
  sql: {
    nacistAlergenyUcastnika: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || a.id_alergenu || '"' || CASE WHEN ua.id_ucastnika IS NULL THEN '' ELSE ' checked' END || '> ' || a.jmeno || '</label>', '') FROM alergeny a LEFT JOIN ucastnici_alergeny ua ON ua.id_alergenu = a.id_alergenu AND ua.id_ucastnika = idUcastnika ORDER BY a.id_alergenu) AS moznosti_alergenu_edit_ucastnika`
  },
});
