import { Component } from "~/model/Component";

export const vstupAlergenyVedoucihoKomponenta = new Component({
  id: "vstup-alergeny-vedouciho",
  name: "Vstup – Alergeny vedoucího",
  tags: ["vedoucí"],
  description: "Vícenásobný výběr alergenů pro nového vedoucího.",

  html: `
<div class="form-radek">
  <label for="vstup_alergeny_vedouciho">Alergeny:</label>
  <div id="vstup_alergeny_vedouciho" class="vyber-checkboxu">
    {{ moznosti_alergenu_vstup_vedouciho }}
  </div>
  <input type="hidden" id="system-vstup_alergeny_vedouciho" name="system-vstup_alergeny_vedouciho" value="NULL" />
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
const checkboxesAlergenuVstupVedouciho = document.querySelectorAll('#vstup_alergeny_vedouciho input[type="checkbox"]');
const hiddenAlergenyVstupVedouciho = document.querySelector('#system-vstup_alergeny_vedouciho');

function syncAlergenyVstupVedouciho() {
  if (!hiddenAlergenyVstupVedouciho) return;

  const hodnoty = Array.from(checkboxesAlergenuVstupVedouciho)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenAlergenyVstupVedouciho.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenAlergenyVstupVedouciho.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesAlergenuVstupVedouciho.length > 0) {
  syncAlergenyVstupVedouciho();

  checkboxesAlergenuVstupVedouciho.forEach(function(checkbox) {
    if (checkbox.dataset.vstupAlergenyVedoucihoChange === '1') return;
    checkbox.dataset.vstupAlergenyVedoucihoChange = '1';
    checkbox.addEventListener('change', syncAlergenyVstupVedouciho);
  });
}
`,
  sql: {
    nacistAlergenyVedouciho: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || id_alergenu || '"> ' || jmeno || '</label>', '') FROM alergeny ORDER BY id_alergenu) AS moznosti_alergenu_vstup_vedouciho`
  },
});
