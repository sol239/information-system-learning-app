import { Component } from "~/model/Component";

export const editVstupTurnusyVedoucihoKomponenta = new Component({
  id: "edit-vstup-turnusy-vedouciho",
  name: "Vstup – Edit turnusy vedoucího",
  tags: ["vedoucí", "turnusy"],
  description: "Vícenásobný výběr turnusů vedoucího. Vyžaduje generalVariable: idVedouciho.",

  html: `
<div class="form-radek">
  <label for="edit-vstup_turnusy_vedouciho-{{ idVedouciho }}">Turnusy:</label>
  <div id="edit-vstup_turnusy_vedouciho-{{ idVedouciho }}" class="vyber-checkboxu">
    {{ moznosti_turnusu_edit_vedouciho }}
  </div>
  <input type="hidden" id="system-edit_vstup_turnusy_vedouciho-{{ idVedouciho }}" name="system-edit_vstup_turnusy_vedouciho" />
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
const checkboxesTurnusuEditVedouciho = document.querySelectorAll('#edit-vstup_turnusy_vedouciho-' + idVedouciho + ' input[type="checkbox"]');
const hiddenTurnusyEditVedouciho = document.querySelector('#system-edit_vstup_turnusy_vedouciho-' + idVedouciho);

function syncTurnusyEditVedouciho() {
  if (!hiddenTurnusyEditVedouciho) return;

  const hodnoty = Array.from(checkboxesTurnusuEditVedouciho)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenTurnusyEditVedouciho.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenTurnusyEditVedouciho.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesTurnusuEditVedouciho.length > 0) {
  syncTurnusyEditVedouciho();

  checkboxesTurnusuEditVedouciho.forEach(function(checkbox) {
    if (checkbox.dataset.editTurnusyVedoucihoChange === '1') return;
    checkbox.dataset.editTurnusyVedoucihoChange = '1';
    checkbox.addEventListener('change', syncTurnusyEditVedouciho);
  });
}
`,
  sql: {
    nacistTurnusyVedouciho: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || t.id_turnusu || '"' || CASE WHEN vt.id_vedouciho IS NULL THEN '' ELSE ' checked' END || '> Turnus ' || t.id_turnusu || ' (' || strftime('%d. %m.', t.datum_od) || ' - ' || strftime('%d. %m. %Y', t.datum_do) || ')</label>', '') FROM turnusy t LEFT JOIN vedouci_turnusy vt ON vt.id_turnusu = t.id_turnusu AND vt.id_vedouciho = idVedouciho ORDER BY t.id_turnusu) AS moznosti_turnusu_edit_vedouciho`
  },
});
