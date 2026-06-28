import { Component } from "~/model/Component";

const fieldCss = `
.jidelnicek-pridat-jidlo-pole {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
  width: 100%;
}

.jidelnicek-pridat-jidlo-pole label {
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.jidelnicek-pridat-jidlo-pole select {
  width: 100%;
  min-height: 38px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  padding: 8px 10px;
}

.jidelnicek-pridat-jidlo-pole select:focus {
  outline: 2px solid #bae6fd;
  border-color: #0284c7;
}
`;

export const jidelnicekVstupTurnusJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-turnus-jidlo-osobe",
  name: "Jídelníček – Vstup turnus pro přidání jídla osobě",
  tags: ["jídelníček"],
  description: "Výběr turnusu pro formulář přidání jídla osobě.",

  html: `
<div class="jidelnicek-pridat-jidlo-pole">
  <label for="system-vstup_id_turnusu_jidlo_osobe">Turnus</label>
  <select id="system-vstup_id_turnusu_jidlo_osobe"></select>
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekTurnusPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

const turnusy_jidlo_osobe = jidelnicekTurnusPole(typeof id_turnusu_jidlo_osobe === 'undefined' ? [] : id_turnusu_jidlo_osobe);
const datumy_od_jidlo_osobe = jidelnicekTurnusPole(typeof datum_od_jidlo_osobe === 'undefined' ? [] : datum_od_jidlo_osobe);
const datumy_do_jidlo_osobe = jidelnicekTurnusPole(typeof datum_do_jidlo_osobe === 'undefined' ? [] : datum_do_jidlo_osobe);
const select_turnusu_jidlo_osobe = document.querySelector('#system-vstup_id_turnusu_jidlo_osobe');

if (select_turnusu_jidlo_osobe) {
  const puvodniHodnota = select_turnusu_jidlo_osobe.value;
  select_turnusu_jidlo_osobe.innerHTML = '';

  turnusy_jidlo_osobe.forEach(function(idTurnusu, index) {
    const option = document.createElement('option');
    option.value = String(idTurnusu);
    option.textContent = 'Turnus ' + idTurnusu + ' (' + datumy_od_jidlo_osobe[index] + ' - ' + datumy_do_jidlo_osobe[index] + ')';
    select_turnusu_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = turnusy_jidlo_osobe.some(function(idTurnusu) {
    return String(idTurnusu) === String(puvodniHodnota);
  });
  select_turnusu_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(turnusy_jidlo_osobe[0] ?? '');
  select_turnusu_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));

  if (select_turnusu_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_turnusu_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_turnusu_jidlo_osobe.addEventListener('change', function() {
      select_turnusu_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}
`,
  sql: {
    "jidelnicek-vstup-turnus-jidlo-osobe": `SELECT id_turnusu AS id_turnusu_jidlo_osobe, DATE(datum_od) AS datum_od_jidlo_osobe, DATE(datum_do) AS datum_do_jidlo_osobe FROM turnusy ORDER BY id_turnusu`
  },
});

export const jidelnicekVstupOsobaJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-osoba-jidlo-osobe",
  name: "Jídelníček – Vstup osoba pro přidání jídla",
  tags: ["jídelníček"],
  description: "Výběr osoby z účastníků a vedoucích ve zvoleném turnusu.",

  html: `
<div class="jidelnicek-pridat-jidlo-pole">
  <label for="jidelnicek-vstup_osoba_jidlo_osobe">Osoba</label>
  <select id="jidelnicek-vstup_osoba_jidlo_osobe"></select>
  <input type="hidden" id="system-vstup_typ_osoby_jidlo_osobe" />
  <input type="hidden" id="system-vstup_id_osoby_jidlo_osobe" />
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekOsobaPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

const vybrany_turnus_osoby_jidlo_osobe = typeof vstup_id_turnusu_jidlo_osobe === 'undefined' ? '' : String(vstup_id_turnusu_jidlo_osobe);
const typy_osob_jidlo_osobe = jidelnicekOsobaPole(typeof typ_osoby_jidlo_osobe === 'undefined' ? [] : typ_osoby_jidlo_osobe);
const id_osob_jidlo_osobe = jidelnicekOsobaPole(typeof id_osoby_jidlo_osobe === 'undefined' ? [] : id_osoby_jidlo_osobe);
const jmena_osob_jidlo_osobe = jidelnicekOsobaPole(typeof jmeno_osoby_jidlo_osobe === 'undefined' ? [] : jmeno_osoby_jidlo_osobe);
const turnusy_osob_jidlo_osobe = jidelnicekOsobaPole(typeof id_turnusu_osoby_jidlo_osobe === 'undefined' ? [] : id_turnusu_osoby_jidlo_osobe);

const select_osoby_jidlo_osobe = document.querySelector('#jidelnicek-vstup_osoba_jidlo_osobe');
const input_typ_osoby_jidlo_osobe = document.querySelector('#system-vstup_typ_osoby_jidlo_osobe');
const input_id_osoby_jidlo_osobe = document.querySelector('#system-vstup_id_osoby_jidlo_osobe');

const moznosti_osob_jidlo_osobe = id_osob_jidlo_osobe
  .map(function(idOsoby, index) {
    return {
      label: jmena_osob_jidlo_osobe[index] + ' (' + (typy_osob_jidlo_osobe[index] === 'ucastnik' ? 'účastník' : 'vedoucí') + ')',
      value: typy_osob_jidlo_osobe[index] + ':' + idOsoby,
      typ: String(typy_osob_jidlo_osobe[index] ?? ''),
      id: String(idOsoby),
      turnus: String(turnusy_osob_jidlo_osobe[index] ?? '')
    };
  })
  .filter(function(osoba) {
    return osoba.turnus === vybrany_turnus_osoby_jidlo_osobe;
  });

function jidelnicekOsobaSyncHidden() {
  const vybrana = moznosti_osob_jidlo_osobe.find(function(osoba) {
    return select_osoby_jidlo_osobe && osoba.value === select_osoby_jidlo_osobe.value;
  });

  if (input_typ_osoby_jidlo_osobe) {
    input_typ_osoby_jidlo_osobe.value = vybrana?.typ ?? '';
    input_typ_osoby_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
  }

  if (input_id_osoby_jidlo_osobe) {
    input_id_osoby_jidlo_osobe.value = vybrana?.id ?? '';
    input_id_osoby_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

if (select_osoby_jidlo_osobe) {
  const puvodniHodnota = select_osoby_jidlo_osobe.value;
  select_osoby_jidlo_osobe.innerHTML = '';

  moznosti_osob_jidlo_osobe.forEach(function(osoba) {
    const option = document.createElement('option');
    option.value = osoba.value;
    option.textContent = osoba.label;
    select_osoby_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = moznosti_osob_jidlo_osobe.some(function(osoba) {
    return osoba.value === puvodniHodnota;
  });
  select_osoby_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(moznosti_osob_jidlo_osobe[0]?.value ?? '');
  jidelnicekOsobaSyncHidden();

  if (select_osoby_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_osoby_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_osoby_jidlo_osobe.addEventListener('change', jidelnicekOsobaSyncHidden);
  }
}
`,
  sql: {
    "jidelnicek-vstup-osoba-jidlo-osobe": `SELECT 'ucastnik' AS typ_osoby_jidlo_osobe, u.id_ucastnika AS id_osoby_jidlo_osobe, u.jmeno AS jmeno_osoby_jidlo_osobe, tu.id_turnusu AS id_turnusu_osoby_jidlo_osobe FROM ucastnici u JOIN turnusy_ucastnici tu ON tu.id_ucastnika = u.id_ucastnika UNION ALL SELECT 'vedouci' AS typ_osoby_jidlo_osobe, v.id_vedouciho AS id_osoby_jidlo_osobe, v.jmeno AS jmeno_osoby_jidlo_osobe, vt.id_turnusu AS id_turnusu_osoby_jidlo_osobe FROM vedouci v JOIN vedouci_turnusy vt ON vt.id_vedouciho = v.id_vedouciho ORDER BY jmeno_osoby_jidlo_osobe`
  },
});

export const jidelnicekVstupDatumJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-datum-jidlo-osobe",
  name: "Jídelníček – Vstup datum pro přidání jídla osobě",
  tags: ["jídelníček"],
  description: "Výběr data v rozsahu zvoleného turnusu.",

  html: `
<div class="jidelnicek-pridat-jidlo-pole">
  <label for="system-vstup_datum_jidlo_osobe">Datum</label>
  <select id="system-vstup_datum_jidlo_osobe"></select>
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekDatumPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function jidelnicekDatumDny(datumOd, datumDo) {
  if (!datumOd || !datumDo) return [];

  const dny = [];
  const aktualni = new Date(datumOd + 'T00:00:00');
  const posledni = new Date(datumDo + 'T00:00:00');

  while (aktualni <= posledni) {
    const rok = aktualni.getFullYear();
    const mesic = String(aktualni.getMonth() + 1).padStart(2, '0');
    const den = String(aktualni.getDate()).padStart(2, '0');
    const hodnota = rok + '-' + mesic + '-' + den;

    dny.push({
      label: den + '. ' + mesic + '. ' + rok,
      value: hodnota
    });

    aktualni.setDate(aktualni.getDate() + 1);
  }

  return dny;
}

const vybrany_turnus_datum_jidlo_osobe = typeof vstup_id_turnusu_jidlo_osobe === 'undefined' ? '' : String(vstup_id_turnusu_jidlo_osobe);
const turnusy_datum_jidlo_osobe = jidelnicekDatumPole(typeof id_turnusu_datum_jidlo_osobe === 'undefined' ? [] : id_turnusu_datum_jidlo_osobe);
const datumy_od_datum_jidlo_osobe = jidelnicekDatumPole(typeof datum_od_datum_jidlo_osobe === 'undefined' ? [] : datum_od_datum_jidlo_osobe);
const datumy_do_datum_jidlo_osobe = jidelnicekDatumPole(typeof datum_do_datum_jidlo_osobe === 'undefined' ? [] : datum_do_datum_jidlo_osobe);
const select_datum_jidlo_osobe = document.querySelector('#system-vstup_datum_jidlo_osobe');

const index_turnusu_datum_jidlo_osobe = turnusy_datum_jidlo_osobe.findIndex(function(idTurnusu) {
  return String(idTurnusu) === vybrany_turnus_datum_jidlo_osobe;
});
const moznosti_datu_jidlo_osobe = index_turnusu_datum_jidlo_osobe >= 0
  ? jidelnicekDatumDny(datumy_od_datum_jidlo_osobe[index_turnusu_datum_jidlo_osobe], datumy_do_datum_jidlo_osobe[index_turnusu_datum_jidlo_osobe])
  : [];

if (select_datum_jidlo_osobe) {
  const puvodniHodnota = select_datum_jidlo_osobe.value;
  select_datum_jidlo_osobe.innerHTML = '';

  moznosti_datu_jidlo_osobe.forEach(function(datum) {
    const option = document.createElement('option');
    option.value = datum.value;
    option.textContent = datum.label;
    select_datum_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = moznosti_datu_jidlo_osobe.some(function(datum) {
    return datum.value === puvodniHodnota;
  });
  select_datum_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(moznosti_datu_jidlo_osobe[0]?.value ?? '');
  select_datum_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));

  if (select_datum_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_datum_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_datum_jidlo_osobe.addEventListener('change', function() {
      select_datum_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}
`,
  sql: {
    "jidelnicek-vstup-datum-jidlo-osobe": `SELECT id_turnusu AS id_turnusu_datum_jidlo_osobe, DATE(datum_od) AS datum_od_datum_jidlo_osobe, DATE(datum_do) AS datum_do_datum_jidlo_osobe FROM turnusy ORDER BY id_turnusu`
  },
});

export const jidelnicekVstupJidloJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-jidlo-jidlo-osobe",
  name: "Jídelníček – Vstup jídlo pro přidání osobě",
  tags: ["jídelníček"],
  description: "Výběr jídla pro formulář přidání jídla osobě.",

  html: `
<div class="jidelnicek-pridat-jidlo-pole">
  <label for="system-vstup_id_jidla_jidlo_osobe">Jídlo</label>
  <select id="system-vstup_id_jidla_jidlo_osobe"></select>
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekJidloPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

const id_jidel_jidlo_osobe = jidelnicekJidloPole(typeof id_jidla_jidlo_osobe === 'undefined' ? [] : id_jidla_jidlo_osobe);
const nazvy_jidel_jidlo_osobe = jidelnicekJidloPole(typeof nazev_jidla_jidlo_osobe === 'undefined' ? [] : nazev_jidla_jidlo_osobe);
const doby_jidel_jidlo_osobe = jidelnicekJidloPole(typeof doba_jidla_jidlo_osobe === 'undefined' ? [] : doba_jidla_jidlo_osobe);
const select_jidla_jidlo_osobe = document.querySelector('#system-vstup_id_jidla_jidlo_osobe');

if (select_jidla_jidlo_osobe) {
  const puvodniHodnota = select_jidla_jidlo_osobe.value;
  select_jidla_jidlo_osobe.innerHTML = '';

  id_jidel_jidlo_osobe.forEach(function(idJidla, index) {
    const option = document.createElement('option');
    option.value = String(idJidla);
    option.textContent = nazvy_jidel_jidlo_osobe[index] + ' (' + doby_jidel_jidlo_osobe[index] + ')';
    select_jidla_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = id_jidel_jidlo_osobe.some(function(idJidla) {
    return String(idJidla) === String(puvodniHodnota);
  });
  select_jidla_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(id_jidel_jidlo_osobe[0] ?? '');
  select_jidla_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));

  if (select_jidla_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_jidla_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_jidla_jidlo_osobe.addEventListener('change', function() {
      select_jidla_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}
`,
  sql: {
    "jidelnicek-vstup-jidlo-jidlo-osobe": `SELECT id_jidla AS id_jidla_jidlo_osobe, jmeno AS nazev_jidla_jidlo_osobe, doba_podavani AS doba_jidla_jidlo_osobe FROM jidla ORDER BY doba_podavani, jmeno`
  },
});

export const jidelnicekTlacitkoPridatJidloOsobeKomponenta = new Component({
  id: "jidelnicek-tlacitko-pridat-jidlo-osobe",
  name: "Jídelníček – Tlačítko přidat jídlo osobě",
  tags: ["jídelníček"],
  description: "Tlačítko, které uloží vybrané jídlo vybrané osobě.",

  html: `
<button id="jidelnicek-tlacitko-pridat-jidlo-osobe" {{ stav_tlacitka_pridat_jidlo_osobe }}>
  Přidat
</button>
`,
  css: `
#jidelnicek-tlacitko-pridat-jidlo-osobe {
  min-width: 180px;
  min-height: 38px;
  border: none;
  border-radius: 6px;
  background: #0284c7;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 14px;
}

#jidelnicek-tlacitko-pridat-jidlo-osobe:hover {
  background: #0369a1;
}

#jidelnicek-tlacitko-pridat-jidlo-osobe:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.72;
}
`,
  js: `
const jidelnicek_tlacitko_ma_turnus = typeof vstup_id_turnusu_jidlo_osobe !== 'undefined' && String(vstup_id_turnusu_jidlo_osobe).length > 0;
const jidelnicek_tlacitko_ma_typ_osoby = typeof vstup_typ_osoby_jidlo_osobe !== 'undefined' && String(vstup_typ_osoby_jidlo_osobe).length > 0;
const jidelnicek_tlacitko_ma_osobu = typeof vstup_id_osoby_jidlo_osobe !== 'undefined' && String(vstup_id_osoby_jidlo_osobe).length > 0;
const jidelnicek_tlacitko_ma_datum = typeof vstup_datum_jidlo_osobe !== 'undefined' && String(vstup_datum_jidlo_osobe).length > 0;
const jidelnicek_tlacitko_ma_jidlo = typeof vstup_id_jidla_jidlo_osobe !== 'undefined' && String(vstup_id_jidla_jidlo_osobe).length > 0;
const jidelnicek_tlacitko_validni = jidelnicek_tlacitko_ma_turnus && jidelnicek_tlacitko_ma_typ_osoby && jidelnicek_tlacitko_ma_osobu && jidelnicek_tlacitko_ma_datum && jidelnicek_tlacitko_ma_jidlo;
const stav_tlacitka_pridat_jidlo_osobe = jidelnicek_tlacitko_validni ? '' : 'disabled';
`,
  sql: {},
  sql_click: {
    "pridat-do-knihy-jidel": `INSERT OR IGNORE INTO kniha_jidel (id_jidla, datum) SELECT CAST('vstup_id_jidla_jidlo_osobe' AS INTEGER), DATE('vstup_datum_jidlo_osobe') WHERE 'vstup_id_jidla_jidlo_osobe' <> '' AND 'vstup_datum_jidlo_osobe' <> ''`,
    "pridat-ucastnikovi-jidlo": `INSERT OR IGNORE INTO ucastnici_jidla (id_jidla, id_ucastnika, datum_podavani) SELECT CAST('vstup_id_jidla_jidlo_osobe' AS INTEGER), CAST('vstup_id_osoby_jidlo_osobe' AS INTEGER), DATE('vstup_datum_jidlo_osobe') WHERE 'vstup_typ_osoby_jidlo_osobe' = 'ucastnik' AND 'vstup_id_osoby_jidlo_osobe' <> '' AND 'vstup_id_jidla_jidlo_osobe' <> '' AND 'vstup_datum_jidlo_osobe' <> ''`,
    "pridat-vedoucimu-jidlo": `INSERT OR IGNORE INTO jidla_vedouci (id_jidla, id_vedouciho, datum_podavani) SELECT CAST('vstup_id_jidla_jidlo_osobe' AS INTEGER), CAST('vstup_id_osoby_jidlo_osobe' AS INTEGER), DATE('vstup_datum_jidlo_osobe') WHERE 'vstup_typ_osoby_jidlo_osobe' = 'vedouci' AND 'vstup_id_osoby_jidlo_osobe' <> '' AND 'vstup_id_jidla_jidlo_osobe' <> '' AND 'vstup_datum_jidlo_osobe' <> ''`
  },
});
