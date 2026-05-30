import { Component } from "~/model/Component";

export const jidelnicekLideJidlaKomponenta = new Component({
  id: "jidelnicek-lide-jidla",
  name: "Jídelníček – Účastníci u jídla",
  tags: ["jídelníček"],
  description: `Účastníci, kteří měli jídlo v daný den. Vyžaduje generalVariables: idJidla, datumDne.`,
  html: `
<div id="jidelnicek-sekce-ucastniku">
  <div id="jidelnicek-hlavicka-ucastniku">
    <span id="jidelnicek-ikona-ucastniku">🧑‍🤝‍🧑</span>
    <span id="jidelnicek-titulek-ucastniku">Účastníci ({{ pocet_ucastniku_jidla }})</span>
  </div>
  <ul id="jidelnicek-seznam-ucastniku-jidla">{{ seznam_ucastniku_jidla }}</ul>
</div>
`,
  css: `
#jidelnicek-sekce-ucastniku {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

#jidelnicek-hlavicka-ucastniku {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

#jidelnicek-sekce-ucastniku ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

#jidelnicek-sekce-ucastniku li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.avatar-ucastnika-jidelnicku {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background-color: #dbeafe;
  color: #1d4ed8;
  flex-shrink: 0;
}

.jmeno-ucastnika-jidelnicku {
  font-size: 13px;
  font-weight: 600;
  color: #1d4ed8;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-lide-jidla": `SELECT
  COUNT(*) AS pocet_ucastniku_jidla,
  GROUP_CONCAT('<li><span class="avatar-ucastnika-jidelnicku">' || UPPER(SUBSTR(jmeno, 1, 1)) || '</span><span class="jmeno-ucastnika-jidelnicku">' || jmeno || '</span></li>', '') AS seznam_ucastniku_jidla
FROM (
  SELECT u.jmeno AS jmeno
  FROM ucastnici u
  JOIN ucastnici_jidla uj ON u.id_ucastnika = uj.id_ucastnika
  WHERE uj.id_jidla = idJidla
    AND DATE(uj.datum_podavani) = DATE('datumDne')
  ORDER BY u.jmeno
)`
  },
  sql_click: {}
});

export const jidelnicekVedouciJidlaKomponenta = new Component({
  id: "jidelnicek-vedouci-jidla",
  name: "Jídelníček – Vedoucí u jídla",
  tags: ["jídelníček"],
  description: `Vedoucí, kteří měli jídlo v daný den. Vyžaduje generalVariables: idJidla, datumDne.`,
  html: `
<div id="jidelnicek-sekce-vedoucich">
  <div id="jidelnicek-hlavicka-vedoucich">
    <span id="jidelnicek-ikona-vedoucich">👥</span>
    <span id="jidelnicek-titulek-vedoucich">Vedoucí ({{ pocet_vedoucich_jidla }})</span>
  </div>
  <ul id="jidelnicek-seznam-vedoucich-jidla">{{ seznam_vedoucich_jidla }}</ul>
</div>
`,
  css: `
#jidelnicek-sekce-vedoucich {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

#jidelnicek-hlavicka-vedoucich {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

#jidelnicek-sekce-vedoucich ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

#jidelnicek-sekce-vedoucich li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.avatar-vedouciho-jidelnicku {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background-color: #ede9fe;
  color: #7c3aed;
  flex-shrink: 0;
}

.jmeno-vedouciho-jidelnicku {
  font-size: 13px;
  font-weight: 600;
  color: #7c3aed;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "jidelnicek-vedouci-jidla": `SELECT
  COUNT(*) AS pocet_vedoucich_jidla,
  GROUP_CONCAT('<li><span class="avatar-vedouciho-jidelnicku">' || UPPER(SUBSTR(jmeno, 1, 1)) || '</span><span class="jmeno-vedouciho-jidelnicku">' || jmeno || '</span></li>', '') AS seznam_vedoucich_jidla
FROM (
  SELECT DISTINCT v.jmeno AS jmeno
  FROM vedouci v
  JOIN jidla_vedouci jv ON v.id_vedouciho = jv.id_vedouciho
  WHERE jv.id_jidla = idJidla
    AND DATE(jv.datum_podavani) = DATE('datumDne')
  ORDER BY v.jmeno
)`
  },
  sql_click: {}
});
