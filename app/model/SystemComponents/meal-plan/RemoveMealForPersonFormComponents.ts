import { Component } from "~/model/Component";

const fieldCss = `
.jidelnicek-odebrat-jidlo-pole {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
  width: 100%;
}

.jidelnicek-odebrat-jidlo-pole label {
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.jidelnicek-odebrat-jidlo-pole select {
  width: 100%;
  min-height: 38px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  padding: 8px 10px;
}

.jidelnicek-odebrat-jidlo-pole select:focus {
  outline: 2px solid #fecaca;
  border-color: #dc2626;
}
`;

export const jidelnicekVstupTurnusOdebratJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-turnus-odebrat-jidlo-osobe",
  name: "Jídelníček – Vstup turnus pro odebrání jídla osobě",
  tags: ["jídelníček"],
  description: "Výběr turnusu pro formulář odebrání jídla osobě.",

  html: `
<div class="jidelnicek-odebrat-jidlo-pole">
  <label for="system-odebrat_id_turnusu_jidlo_osobe">Turnus</label>
  <select id="system-odebrat_id_turnusu_jidlo_osobe"></select>
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekOdebratTurnusPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

const turnusy_odebrat_jidlo_osobe = jidelnicekOdebratTurnusPole(typeof id_turnusu_odebrat_jidlo_osobe === 'undefined' ? [] : id_turnusu_odebrat_jidlo_osobe);
const datumy_od_odebrat_jidlo_osobe = jidelnicekOdebratTurnusPole(typeof datum_od_odebrat_jidlo_osobe === 'undefined' ? [] : datum_od_odebrat_jidlo_osobe);
const datumy_do_odebrat_jidlo_osobe = jidelnicekOdebratTurnusPole(typeof datum_do_odebrat_jidlo_osobe === 'undefined' ? [] : datum_do_odebrat_jidlo_osobe);
const select_turnusu_odebrat_jidlo_osobe = document.querySelector('#system-odebrat_id_turnusu_jidlo_osobe');

if (select_turnusu_odebrat_jidlo_osobe) {
  const puvodniHodnota = select_turnusu_odebrat_jidlo_osobe.value;
  select_turnusu_odebrat_jidlo_osobe.innerHTML = '';

  turnusy_odebrat_jidlo_osobe.forEach(function(idTurnusu, index) {
    const option = document.createElement('option');
    option.value = String(idTurnusu);
    option.textContent = 'Turnus ' + idTurnusu + ' (' + datumy_od_odebrat_jidlo_osobe[index] + ' - ' + datumy_do_odebrat_jidlo_osobe[index] + ')';
    select_turnusu_odebrat_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = turnusy_odebrat_jidlo_osobe.some(function(idTurnusu) {
    return String(idTurnusu) === String(puvodniHodnota);
  });
  select_turnusu_odebrat_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(turnusy_odebrat_jidlo_osobe[0] ?? '');
  select_turnusu_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));

  if (select_turnusu_odebrat_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_turnusu_odebrat_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_turnusu_odebrat_jidlo_osobe.addEventListener('change', function() {
      select_turnusu_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}
`,
  sql: {
    "jidelnicek-vstup-turnus-odebrat-jidlo-osobe": `SELECT DISTINCT t.id_turnusu AS id_turnusu_odebrat_jidlo_osobe, DATE(t.datum_od) AS datum_od_odebrat_jidlo_osobe, DATE(t.datum_do) AS datum_do_odebrat_jidlo_osobe FROM turnusy t WHERE EXISTS (SELECT 1 FROM ucastnici_jidla uj WHERE DATE(uj.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do)) OR EXISTS (SELECT 1 FROM jidla_vedouci jv WHERE DATE(jv.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do)) ORDER BY t.id_turnusu`
  },
});

export const jidelnicekVstupOsobaOdebratJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-osoba-odebrat-jidlo-osobe",
  name: "Jídelníček – Vstup osoba pro odebrání jídla",
  tags: ["jídelníček"],
  description: "Výběr osoby, které lze odebrat již přiřazené jídlo.",

  html: `
<div class="jidelnicek-odebrat-jidlo-pole">
  <label for="jidelnicek-odebrat_osoba_jidlo_osobe">Osoba</label>
  <select id="jidelnicek-odebrat_osoba_jidlo_osobe"></select>
  <input type="hidden" id="system-odebrat_typ_osoby_jidlo_osobe" />
  <input type="hidden" id="system-odebrat_id_osoby_jidlo_osobe" />
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekOdebratOsobaPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

const typy_osob_odebrat_jidlo_osobe = jidelnicekOdebratOsobaPole(typeof typ_osoby_odebrat_jidlo_osobe === 'undefined' ? [] : typ_osoby_odebrat_jidlo_osobe);
const id_osob_odebrat_jidlo_osobe = jidelnicekOdebratOsobaPole(typeof id_osoby_odebrat_jidlo_osobe === 'undefined' ? [] : id_osoby_odebrat_jidlo_osobe);
const jmena_osob_odebrat_jidlo_osobe = jidelnicekOdebratOsobaPole(typeof jmeno_osoby_odebrat_jidlo_osobe === 'undefined' ? [] : jmeno_osoby_odebrat_jidlo_osobe);
const turnusy_osob_odebrat_jidlo_osobe = jidelnicekOdebratOsobaPole(typeof id_turnusu_osoby_odebrat_jidlo_osobe === 'undefined' ? [] : id_turnusu_osoby_odebrat_jidlo_osobe);
const vybrany_turnus_osoby_odebrat_jidlo_osobe = typeof odebrat_id_turnusu_jidlo_osobe === 'undefined' ? '' : String(odebrat_id_turnusu_jidlo_osobe);
const select_osoby_odebrat_jidlo_osobe = document.querySelector('#jidelnicek-odebrat_osoba_jidlo_osobe');
const input_typ_osoby_odebrat_jidlo_osobe = document.querySelector('#system-odebrat_typ_osoby_jidlo_osobe');
const input_id_osoby_odebrat_jidlo_osobe = document.querySelector('#system-odebrat_id_osoby_jidlo_osobe');

const moznosti_osob_odebrat_jidlo_osobe = id_osob_odebrat_jidlo_osobe
  .map(function(idOsoby, index) {
    return {
      label: jmena_osob_odebrat_jidlo_osobe[index] + ' (' + (typy_osob_odebrat_jidlo_osobe[index] === 'ucastnik' ? 'účastník' : 'vedoucí') + ')',
      value: typy_osob_odebrat_jidlo_osobe[index] + ':' + idOsoby,
      typ: String(typy_osob_odebrat_jidlo_osobe[index] ?? ''),
      id: String(idOsoby),
      turnus: String(turnusy_osob_odebrat_jidlo_osobe[index] ?? '')
    };
  })
  .filter(function(osoba) {
    return osoba.turnus === vybrany_turnus_osoby_odebrat_jidlo_osobe;
  });

function jidelnicekOdebratOsobaSyncHidden() {
  const vybrana = moznosti_osob_odebrat_jidlo_osobe.find(function(osoba) {
    return select_osoby_odebrat_jidlo_osobe && osoba.value === select_osoby_odebrat_jidlo_osobe.value;
  });

  if (input_typ_osoby_odebrat_jidlo_osobe) {
    input_typ_osoby_odebrat_jidlo_osobe.value = vybrana?.typ ?? '';
    input_typ_osoby_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
  }

  if (input_id_osoby_odebrat_jidlo_osobe) {
    input_id_osoby_odebrat_jidlo_osobe.value = vybrana?.id ?? '';
    input_id_osoby_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

if (select_osoby_odebrat_jidlo_osobe) {
  const puvodniHodnota = select_osoby_odebrat_jidlo_osobe.value;
  select_osoby_odebrat_jidlo_osobe.innerHTML = '';

  moznosti_osob_odebrat_jidlo_osobe.forEach(function(osoba) {
    const option = document.createElement('option');
    option.value = osoba.value;
    option.textContent = osoba.label;
    select_osoby_odebrat_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = moznosti_osob_odebrat_jidlo_osobe.some(function(osoba) {
    return osoba.value === puvodniHodnota;
  });
  select_osoby_odebrat_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(moznosti_osob_odebrat_jidlo_osobe[0]?.value ?? '');
  jidelnicekOdebratOsobaSyncHidden();

  if (select_osoby_odebrat_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_osoby_odebrat_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_osoby_odebrat_jidlo_osobe.addEventListener('change', jidelnicekOdebratOsobaSyncHidden);
  }
}
`,
  sql: {
    "jidelnicek-vstup-osoba-odebrat-jidlo-osobe": `SELECT DISTINCT 'ucastnik' AS typ_osoby_odebrat_jidlo_osobe, u.id_ucastnika AS id_osoby_odebrat_jidlo_osobe, u.jmeno AS jmeno_osoby_odebrat_jidlo_osobe, t.id_turnusu AS id_turnusu_osoby_odebrat_jidlo_osobe FROM ucastnici u JOIN ucastnici_jidla uj ON uj.id_ucastnika = u.id_ucastnika JOIN turnusy t ON DATE(uj.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do) UNION ALL SELECT DISTINCT 'vedouci' AS typ_osoby_odebrat_jidlo_osobe, v.id_vedouciho AS id_osoby_odebrat_jidlo_osobe, v.jmeno AS jmeno_osoby_odebrat_jidlo_osobe, t.id_turnusu AS id_turnusu_osoby_odebrat_jidlo_osobe FROM vedouci v JOIN jidla_vedouci jv ON jv.id_vedouciho = v.id_vedouciho JOIN turnusy t ON DATE(jv.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do) ORDER BY jmeno_osoby_odebrat_jidlo_osobe`
  },
});

export const jidelnicekVstupDatumOdebratJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-datum-odebrat-jidlo-osobe",
  name: "Jídelníček – Vstup datum pro odebrání jídla osobě",
  tags: ["jídelníček"],
  description: "Výběr dne, ve kterém má vybraná osoba přiřazené jídlo.",

  html: `
<div class="jidelnicek-odebrat-jidlo-pole">
  <label for="system-odebrat_datum_jidlo_osobe">Datum</label>
  <select id="system-odebrat_datum_jidlo_osobe"></select>
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekOdebratDatumPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function jidelnicekOdebratDatumLabel(hodnota) {
  if (!hodnota) return '';
  const casti = String(hodnota).split('-');
  if (casti.length !== 3) return String(hodnota);
  return casti[2] + '. ' + casti[1] + '. ' + casti[0];
}

const vybrany_typ_datum_odebrat_jidlo_osobe = typeof odebrat_typ_osoby_jidlo_osobe === 'undefined' ? '' : String(odebrat_typ_osoby_jidlo_osobe);
const vybrana_osoba_datum_odebrat_jidlo_osobe = typeof odebrat_id_osoby_jidlo_osobe === 'undefined' ? '' : String(odebrat_id_osoby_jidlo_osobe);
const vybrany_turnus_datum_odebrat_jidlo_osobe = typeof odebrat_id_turnusu_jidlo_osobe === 'undefined' ? '' : String(odebrat_id_turnusu_jidlo_osobe);
const typy_datum_odebrat_jidlo_osobe = jidelnicekOdebratDatumPole(typeof typ_osoby_datum_odebrat_jidlo_osobe === 'undefined' ? [] : typ_osoby_datum_odebrat_jidlo_osobe);
const id_osob_datum_odebrat_jidlo_osobe = jidelnicekOdebratDatumPole(typeof id_osoby_datum_odebrat_jidlo_osobe === 'undefined' ? [] : id_osoby_datum_odebrat_jidlo_osobe);
const turnusy_datum_odebrat_jidlo_osobe = jidelnicekOdebratDatumPole(typeof id_turnusu_datum_odebrat_jidlo_osobe === 'undefined' ? [] : id_turnusu_datum_odebrat_jidlo_osobe);
const datumy_odebrat_jidlo_osobe = jidelnicekOdebratDatumPole(typeof datum_odebrat_jidlo_osobe === 'undefined' ? [] : datum_odebrat_jidlo_osobe);
const select_datum_odebrat_jidlo_osobe = document.querySelector('#system-odebrat_datum_jidlo_osobe');

const moznosti_datu_odebrat_jidlo_osobe = [];
datumy_odebrat_jidlo_osobe.forEach(function(datum, index) {
  if (String(typy_datum_odebrat_jidlo_osobe[index]) !== vybrany_typ_datum_odebrat_jidlo_osobe) return;
  if (String(id_osob_datum_odebrat_jidlo_osobe[index]) !== vybrana_osoba_datum_odebrat_jidlo_osobe) return;
  if (String(turnusy_datum_odebrat_jidlo_osobe[index]) !== vybrany_turnus_datum_odebrat_jidlo_osobe) return;
  if (moznosti_datu_odebrat_jidlo_osobe.includes(String(datum))) return;
  moznosti_datu_odebrat_jidlo_osobe.push(String(datum));
});

if (select_datum_odebrat_jidlo_osobe) {
  const puvodniHodnota = select_datum_odebrat_jidlo_osobe.value;
  select_datum_odebrat_jidlo_osobe.innerHTML = '';

  moznosti_datu_odebrat_jidlo_osobe.forEach(function(datum) {
    const option = document.createElement('option');
    option.value = datum;
    option.textContent = jidelnicekOdebratDatumLabel(datum);
    select_datum_odebrat_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = moznosti_datu_odebrat_jidlo_osobe.includes(puvodniHodnota);
  select_datum_odebrat_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(moznosti_datu_odebrat_jidlo_osobe[0] ?? '');
  select_datum_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));

  if (select_datum_odebrat_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_datum_odebrat_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_datum_odebrat_jidlo_osobe.addEventListener('change', function() {
      select_datum_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}
`,
  sql: {
    "jidelnicek-vstup-datum-odebrat-jidlo-osobe": `SELECT DISTINCT 'ucastnik' AS typ_osoby_datum_odebrat_jidlo_osobe, uj.id_ucastnika AS id_osoby_datum_odebrat_jidlo_osobe, t.id_turnusu AS id_turnusu_datum_odebrat_jidlo_osobe, DATE(uj.datum_podavani) AS datum_odebrat_jidlo_osobe FROM ucastnici_jidla uj JOIN turnusy t ON DATE(uj.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do) UNION SELECT DISTINCT 'vedouci' AS typ_osoby_datum_odebrat_jidlo_osobe, jv.id_vedouciho AS id_osoby_datum_odebrat_jidlo_osobe, t.id_turnusu AS id_turnusu_datum_odebrat_jidlo_osobe, DATE(jv.datum_podavani) AS datum_odebrat_jidlo_osobe FROM jidla_vedouci jv JOIN turnusy t ON DATE(jv.datum_podavani) BETWEEN DATE(t.datum_od) AND DATE(t.datum_do) ORDER BY datum_odebrat_jidlo_osobe`
  },
});

export const jidelnicekVstupJidloOdebratJidloOsobeKomponenta = new Component({
  id: "jidelnicek-vstup-jidlo-odebrat-jidlo-osobe",
  name: "Jídelníček – Vstup jídlo pro odebrání osobě",
  tags: ["jídelníček"],
  description: "Výběr jídla, které má vybraná osoba v daný den přiřazené.",

  html: `
<div class="jidelnicek-odebrat-jidlo-pole">
  <label for="system-odebrat_id_jidla_jidlo_osobe">Jídlo</label>
  <select id="system-odebrat_id_jidla_jidlo_osobe"></select>
</div>
`,
  css: fieldCss,
  js: `
function jidelnicekOdebratJidloPole(value) {
  if (typeof value === 'undefined' || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

const vybrany_typ_jidlo_odebrat_jidlo_osobe = typeof odebrat_typ_osoby_jidlo_osobe === 'undefined' ? '' : String(odebrat_typ_osoby_jidlo_osobe);
const vybrana_osoba_jidlo_odebrat_jidlo_osobe = typeof odebrat_id_osoby_jidlo_osobe === 'undefined' ? '' : String(odebrat_id_osoby_jidlo_osobe);
const vybrane_datum_jidlo_odebrat_jidlo_osobe = typeof odebrat_datum_jidlo_osobe === 'undefined' ? '' : String(odebrat_datum_jidlo_osobe);
const typy_jidel_odebrat_jidlo_osobe = jidelnicekOdebratJidloPole(typeof typ_osoby_jidlo_odebrat_jidlo_osobe === 'undefined' ? [] : typ_osoby_jidlo_odebrat_jidlo_osobe);
const id_osob_jidel_odebrat_jidlo_osobe = jidelnicekOdebratJidloPole(typeof id_osoby_jidlo_odebrat_jidlo_osobe === 'undefined' ? [] : id_osoby_jidlo_odebrat_jidlo_osobe);
const datumy_jidel_odebrat_jidlo_osobe = jidelnicekOdebratJidloPole(typeof datum_jidla_odebrat_jidlo_osobe === 'undefined' ? [] : datum_jidla_odebrat_jidlo_osobe);
const id_jidel_odebrat_jidlo_osobe = jidelnicekOdebratJidloPole(typeof id_jidla_odebrat_jidlo_osobe === 'undefined' ? [] : id_jidla_odebrat_jidlo_osobe);
const nazvy_jidel_odebrat_jidlo_osobe = jidelnicekOdebratJidloPole(typeof nazev_jidla_odebrat_jidlo_osobe === 'undefined' ? [] : nazev_jidla_odebrat_jidlo_osobe);
const doby_jidel_odebrat_jidlo_osobe = jidelnicekOdebratJidloPole(typeof doba_jidla_odebrat_jidlo_osobe === 'undefined' ? [] : doba_jidla_odebrat_jidlo_osobe);
const select_jidla_odebrat_jidlo_osobe = document.querySelector('#system-odebrat_id_jidla_jidlo_osobe');

const moznosti_jidel_odebrat_jidlo_osobe = id_jidel_odebrat_jidlo_osobe
  .map(function(idJidla, index) {
    return {
      id: String(idJidla),
      label: nazvy_jidel_odebrat_jidlo_osobe[index] + ' (' + doby_jidel_odebrat_jidlo_osobe[index] + ')',
      typ: String(typy_jidel_odebrat_jidlo_osobe[index] ?? ''),
      osoba: String(id_osob_jidel_odebrat_jidlo_osobe[index] ?? ''),
      datum: String(datumy_jidel_odebrat_jidlo_osobe[index] ?? '')
    };
  })
  .filter(function(jidlo) {
    return jidlo.typ === vybrany_typ_jidlo_odebrat_jidlo_osobe
      && jidlo.osoba === vybrana_osoba_jidlo_odebrat_jidlo_osobe
      && jidlo.datum === vybrane_datum_jidlo_odebrat_jidlo_osobe;
  });

if (select_jidla_odebrat_jidlo_osobe) {
  const puvodniHodnota = select_jidla_odebrat_jidlo_osobe.value;
  select_jidla_odebrat_jidlo_osobe.innerHTML = '';

  moznosti_jidel_odebrat_jidlo_osobe.forEach(function(jidlo) {
    const option = document.createElement('option');
    option.value = jidlo.id;
    option.textContent = jidlo.label;
    select_jidla_odebrat_jidlo_osobe.appendChild(option);
  });

  const existujePuvodni = moznosti_jidel_odebrat_jidlo_osobe.some(function(jidlo) {
    return jidlo.id === puvodniHodnota;
  });
  select_jidla_odebrat_jidlo_osobe.value = existujePuvodni ? puvodniHodnota : String(moznosti_jidel_odebrat_jidlo_osobe[0]?.id ?? '');
  select_jidla_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));

  if (select_jidla_odebrat_jidlo_osobe.dataset.jidelnicekChange !== '1') {
    select_jidla_odebrat_jidlo_osobe.dataset.jidelnicekChange = '1';
    select_jidla_odebrat_jidlo_osobe.addEventListener('change', function() {
      select_jidla_odebrat_jidlo_osobe.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
}
`,
  sql: {
    "jidelnicek-vstup-jidlo-odebrat-jidlo-osobe": `SELECT 'ucastnik' AS typ_osoby_jidlo_odebrat_jidlo_osobe, uj.id_ucastnika AS id_osoby_jidlo_odebrat_jidlo_osobe, DATE(uj.datum_podavani) AS datum_jidla_odebrat_jidlo_osobe, j.id_jidla AS id_jidla_odebrat_jidlo_osobe, j.jmeno AS nazev_jidla_odebrat_jidlo_osobe, j.doba_podavani AS doba_jidla_odebrat_jidlo_osobe FROM ucastnici_jidla uj JOIN jidla j ON j.id_jidla = uj.id_jidla UNION ALL SELECT 'vedouci' AS typ_osoby_jidlo_odebrat_jidlo_osobe, jv.id_vedouciho AS id_osoby_jidlo_odebrat_jidlo_osobe, DATE(jv.datum_podavani) AS datum_jidla_odebrat_jidlo_osobe, j.id_jidla AS id_jidla_odebrat_jidlo_osobe, j.jmeno AS nazev_jidla_odebrat_jidlo_osobe, j.doba_podavani AS doba_jidla_odebrat_jidlo_osobe FROM jidla_vedouci jv JOIN jidla j ON j.id_jidla = jv.id_jidla ORDER BY datum_jidla_odebrat_jidlo_osobe, doba_jidla_odebrat_jidlo_osobe, nazev_jidla_odebrat_jidlo_osobe`
  },
});

export const jidelnicekTlacitkoOdebratJidloOsobeKomponenta = new Component({
  id: "jidelnicek-tlacitko-odebrat-jidlo-osobe",
  name: "Jídelníček – Tlačítko odebrat jídlo osobě",
  tags: ["jídelníček"],
  description: "Tlačítko, které odebere vybrané jídlo vybrané osobě.",

  html: `
<button id="jidelnicek-tlacitko-odebrat-jidlo-osobe" {{ stav_tlacitka_odebrat_jidlo_osobe }}>
  Odebrat jídlo
</button>
`,
  css: `
#jidelnicek-tlacitko-odebrat-jidlo-osobe {
  min-width: 180px;
  min-height: 38px;
  border: none;
  border-radius: 6px;
  background: #dc2626;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 14px;
}

#jidelnicek-tlacitko-odebrat-jidlo-osobe:hover {
  background: #b91c1c;
}

#jidelnicek-tlacitko-odebrat-jidlo-osobe:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.72;
}
`,
  js: `
const jidelnicek_odebrat_ma_typ_osoby = typeof odebrat_typ_osoby_jidlo_osobe !== 'undefined' && String(odebrat_typ_osoby_jidlo_osobe).length > 0;
const jidelnicek_odebrat_ma_turnus = typeof odebrat_id_turnusu_jidlo_osobe !== 'undefined' && String(odebrat_id_turnusu_jidlo_osobe).length > 0;
const jidelnicek_odebrat_ma_osobu = typeof odebrat_id_osoby_jidlo_osobe !== 'undefined' && String(odebrat_id_osoby_jidlo_osobe).length > 0;
const jidelnicek_odebrat_ma_datum = typeof odebrat_datum_jidlo_osobe !== 'undefined' && String(odebrat_datum_jidlo_osobe).length > 0;
const jidelnicek_odebrat_ma_jidlo = typeof odebrat_id_jidla_jidlo_osobe !== 'undefined' && String(odebrat_id_jidla_jidlo_osobe).length > 0;
const jidelnicek_odebrat_validni = jidelnicek_odebrat_ma_turnus && jidelnicek_odebrat_ma_typ_osoby && jidelnicek_odebrat_ma_osobu && jidelnicek_odebrat_ma_datum && jidelnicek_odebrat_ma_jidlo;
const stav_tlacitka_odebrat_jidlo_osobe = jidelnicek_odebrat_validni ? '' : 'disabled';
`,
  sql: {},
  sql_click: {
    "odebrat-ucastnikovi-jidlo": `DELETE FROM ucastnici_jidla WHERE 'odebrat_typ_osoby_jidlo_osobe' = 'ucastnik' AND id_ucastnika = CAST('odebrat_id_osoby_jidlo_osobe' AS INTEGER) AND id_jidla = CAST('odebrat_id_jidla_jidlo_osobe' AS INTEGER) AND DATE(datum_podavani) = DATE('odebrat_datum_jidlo_osobe')`,
    "odebrat-vedoucimu-jidlo": `DELETE FROM jidla_vedouci WHERE 'odebrat_typ_osoby_jidlo_osobe' = 'vedouci' AND id_vedouciho = CAST('odebrat_id_osoby_jidlo_osobe' AS INTEGER) AND id_jidla = CAST('odebrat_id_jidla_jidlo_osobe' AS INTEGER) AND DATE(datum_podavani) = DATE('odebrat_datum_jidlo_osobe')`
  },
});
