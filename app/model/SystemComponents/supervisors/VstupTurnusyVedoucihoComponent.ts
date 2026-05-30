import { Component } from "~/model/Component";

export const vstupTurnusyVedoucihoKomponenta = new Component({
  id: "vstup-turnusy-vedouciho",
  name: "Vstup – Turnusy vedoucího",
  tags: ["vedoucí", "turnusy"],
  description: "Vícenásobný výběr turnusů pro nového vedoucího.",

  html: `
<div class="form-radek">
  <label for="vstup_turnusy_vedouciho">Turnusy:</label>
  <div id="vstup_turnusy_vedouciho" class="vyber-checkboxu">
    {{ moznosti_turnusu_vstup_vedouciho }}
  </div>
  <input type="hidden" id="system-vstup_turnusy_vedouciho" name="system-vstup_turnusy_vedouciho" value="NULL" />
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
const checkboxesTurnusuVstupVedouciho = document.querySelectorAll('#vstup_turnusy_vedouciho input[type="checkbox"]');
const hiddenTurnusyVstupVedouciho = document.querySelector('#system-vstup_turnusy_vedouciho');

function syncTurnusyVstupVedouciho() {
  if (!hiddenTurnusyVstupVedouciho) return;

  const hodnoty = Array.from(checkboxesTurnusuVstupVedouciho)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenTurnusyVstupVedouciho.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenTurnusyVstupVedouciho.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesTurnusuVstupVedouciho.length > 0) {
  syncTurnusyVstupVedouciho();

  checkboxesTurnusuVstupVedouciho.forEach(function(checkbox) {
    if (checkbox.dataset.vstupTurnusyVedoucihoChange === '1') return;
    checkbox.dataset.vstupTurnusyVedoucihoChange = '1';
    checkbox.addEventListener('change', syncTurnusyVstupVedouciho);
  });
}
`,
  sql: {
    nacistTurnusyVedouciho: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || id_turnusu || '"> Turnus ' || id_turnusu || ' (' || strftime('%d. %m.', datum_od) || ' - ' || strftime('%d. %m. %Y', datum_do) || ')</label>', '') FROM turnusy ORDER BY id_turnusu) AS moznosti_turnusu_vstup_vedouciho`
  },
});
