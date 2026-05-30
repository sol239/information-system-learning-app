import { Component } from "~/model/Component";

export const kartaVedoucihoKomponenta = new Component({
  id: "karta-vedouciho",
  name: "Karta vedoucího",
  tags: ["vedoucí"],
  description: `Karta zobrazující jméno, věk, email, telefon a adresu vedoucího. Vyžaduje generalVariable: idVedouciho.`,
  html: `
<div id="karta-vedouciho">
  <div id="karta-vedouciho-hlavicka">
    <span id="jmeno-vedouciho">{{ jmeno }}</span>
    <span id="vek-vedouciho-stitek">Věk: {{ vek }}</span>
  </div>
  <div id="email-vedouciho-radek">
    <span id="email-vedouciho-ikona">✉️</span>
    <span id="email-vedouciho">{{ email }}</span>
  </div>
  <div id="telefon-vedouciho-radek">
    <span id="telefon-vedouciho-ikona">📞</span>
    <span id="telefon-vedouciho">{{ telefon }}</span>
  </div>
  <div id="adresa-vedouciho-radek">
    <span id="adresa-vedouciho-ikona">📍</span>
    <span id="adresa-vedouciho">{{ adresa }}</span>
  </div>
</div>
`,
  css: `
#karta-vedouciho {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

#karta-vedouciho-hlavicka {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

#jmeno-vedouciho {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

#vek-vedouciho-stitek {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #ede9fe;
  color: #7c3aed;
  white-space: nowrap;
  flex-shrink: 0;
}

#email-vedouciho-radek, #telefon-vedouciho-radek, #adresa-vedouciho-radek {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

#email-vedouciho-ikona, #telefon-vedouciho-ikona, #adresa-vedouciho-ikona {
  font-size: 14px;
  color: #6b7280;
  flex-shrink: 0;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "karta-vedouciho": `SELECT v.jmeno, v.vek, v.email, v.telefon, v.adresa FROM vedouci v WHERE v.id_vedouciho = idVedouciho`
  },
  sql_click: {}
});

