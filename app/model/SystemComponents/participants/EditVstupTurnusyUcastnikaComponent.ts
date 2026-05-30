import { Component } from "~/model/Component";

export const editVstupTurnusyUcastnikaKomponenta = new Component({
  id: "edit-vstup-turnusy-ucastnika",
  name: "Vstup – Edit turnusy účastníka",
  tags: ["účastníci", "turnusy"],
  description: "Vícenásobný výběr turnusů účastníka. Vyžaduje generalVariable: idUcastnika.",

  html: `
<div class="form-radek">
  <label for="edit-vstup_turnusy_ucastnika-{{ idUcastnika }}">Turnusy:</label>
  <div id="edit-vstup_turnusy_ucastnika-{{ idUcastnika }}" class="vyber-checkboxu">
    {{ moznosti_turnusu_edit_ucastnika }}
  </div>
  <input type="hidden" id="system-edit_vstup_turnusy_ucastnika-{{ idUcastnika }}" name="system-edit_vstup_turnusy_ucastnika" />
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
const checkboxesTurnusuEditUcastnika = document.querySelectorAll('#edit-vstup_turnusy_ucastnika-' + idUcastnika + ' input[type="checkbox"]');
const hiddenTurnusyEditUcastnika = document.querySelector('#system-edit_vstup_turnusy_ucastnika-' + idUcastnika);

function syncTurnusyEditUcastnika() {
  if (!hiddenTurnusyEditUcastnika) return;

  const hodnoty = Array.from(checkboxesTurnusuEditUcastnika)
    .filter(function(checkbox) { return checkbox.checked; })
    .map(function(checkbox) { return checkbox.value; });

  hiddenTurnusyEditUcastnika.value = hodnoty.length > 0 ? hodnoty.join(',') : 'NULL';
  hiddenTurnusyEditUcastnika.dispatchEvent(new Event('input', { bubbles: true }));
}

if (checkboxesTurnusuEditUcastnika.length > 0) {
  syncTurnusyEditUcastnika();

  checkboxesTurnusuEditUcastnika.forEach(function(checkbox) {
    checkbox.addEventListener('change', syncTurnusyEditUcastnika);
  });
}
`,
  sql: {
    nacistTurnusyUcastnika: `SELECT (SELECT GROUP_CONCAT('<label class="volba-radek"><input type="checkbox" value="' || t.id_turnusu || '"' || CASE WHEN tu.id_ucastnika IS NULL THEN '' ELSE ' checked' END || '> Turnus ' || t.id_turnusu || ' (' || strftime('%d. %m.', t.datum_od) || ' - ' || strftime('%d. %m. %Y', t.datum_do) || ')</label>', '') FROM turnusy t LEFT JOIN turnusy_ucastnici tu ON tu.id_turnusu = t.id_turnusu AND tu.id_ucastnika = idUcastnika ORDER BY t.id_turnusu) AS moznosti_turnusu_edit_ucastnika`
  },
});
