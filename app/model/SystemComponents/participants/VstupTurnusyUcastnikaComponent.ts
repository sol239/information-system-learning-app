import { Component } from "~/model/Component";

export const vstupTurnusyUcastnikaKomponenta = new Component({
  id: "vstup-turnusy-ucastnika",
  name: "Vstup – Turnusy účastníka",
  tags: ["účastníci", "turnusy"],
  description: "Vícenásobný výběr turnusů pro nového účastníka.",

  html: `
<div class="form-radek">
  <label for="vstup_turnusy_ucastnika">Turnusy:</label>
  <div id="vstup_turnusy_ucastnika" class="vyber-checkboxu">
    {{ moznosti_turnusu_vstup_ucastnika }}
  </div>
  <input type="hidden" id="system-vstup_turnusy_ucastnika" name="system-vstup_turnusy_ucastnika" value="NULL" />
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
const checkboxesTurnusuVstupUcastnika = document.querySelectorAll('#vstup_turnusy_ucastnika input[type="checkbox"]');
const hiddenTurnusyVstupUcastnika = document.querySelector('#system-vstup_turnusy_ucastnika');

function syncTurnusyVstupUcastnika() {
  if (!hiddenTurnusyVstupUcastnika) return;

  const hodnoty = Array.from(checkboxesTurnusuVstupUcastnika)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenTurnusyVstupUcastnika.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenTurnusyVstupUcastnika.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesTurnusuVstupUcastnika.length > 0) {
  syncTurnusyVstupUcastnika();

  checkboxesTurnusuVstupUcastnika.forEach(function(checkbox) {
    checkbox.addEventListener('change', syncTurnusyVstupUcastnika);
  });
}
`,
  sql: {
    nacistTurnusyUcastnika: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || id_turnusu || '"> Turnus ' || id_turnusu || ' (' || strftime('%d. %m.', datum_od) || ' - ' || strftime('%d. %m. %Y', datum_do) || ')</label>', '') FROM turnusy ORDER BY id_turnusu) AS moznosti_turnusu_vstup_ucastnika`
  },
});
