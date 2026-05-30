import { Component } from "~/model/Component";

export const editVstupAlergenyVedoucihoKomponenta = new Component({
  id: "edit-vstup-alergeny-vedouciho",
  name: "Vstup – Edit alergeny vedoucího",
  tags: ["vedoucí"],
  description: "Vícenásobný výběr alergenů vedoucího. Vyžaduje generalVariable: idVedouciho.",

  html: `
<div class="form-radek">
  <label for="edit-vstup_alergeny_vedouciho-{{ idVedouciho }}">Alergeny:</label>
  <div id="edit-vstup_alergeny_vedouciho-{{ idVedouciho }}" class="vyber-checkboxu">
    {{ moznosti_alergenu_edit_vedouciho }}
  </div>
  <input type="hidden" id="system-edit_vstup_alergeny_vedouciho-{{ idVedouciho }}" name="system-edit_vstup_alergeny_vedouciho" />
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
const checkboxesAlergenuEditVedouciho = document.querySelectorAll('#edit-vstup_alergeny_vedouciho-' + idVedouciho + ' input[type="checkbox"]');
const hiddenAlergenyEditVedouciho = document.querySelector('#system-edit_vstup_alergeny_vedouciho-' + idVedouciho);

function syncAlergenyEditVedouciho() {
  if (!hiddenAlergenyEditVedouciho) return;

  const hodnoty = Array.from(checkboxesAlergenuEditVedouciho)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenAlergenyEditVedouciho.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenAlergenyEditVedouciho.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesAlergenuEditVedouciho.length > 0) {
  syncAlergenyEditVedouciho();

  checkboxesAlergenuEditVedouciho.forEach(function(checkbox) {
    if (checkbox.dataset.editAlergenyVedoucihoChange === '1') return;
    checkbox.dataset.editAlergenyVedoucihoChange = '1';
    checkbox.addEventListener('change', syncAlergenyEditVedouciho);
  });
}
`,
  sql: {
    nacistAlergenyVedouciho: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || a.id_alergenu || '"' || CASE WHEN va.id_vedouciho IS NULL THEN '' ELSE ' checked' END || '> ' || a.jmeno || '</label>', '') FROM alergeny a LEFT JOIN vedouci_alergeny va ON va.id_alergenu = a.id_alergenu AND va.id_vedouciho = idVedouciho ORDER BY a.id_alergenu) AS moznosti_alergenu_edit_vedouciho`
  },
});
