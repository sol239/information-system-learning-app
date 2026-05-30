import { Component } from "~/model/Component";

export const kartaUcastnikaKomponenta = new Component({
  id: "karta-ucastnika",
  name: "Karta účastníka",
  tags: ["účastníci"],
  description: `Karta zobrazující jméno, věk, email, telefon a adresu účastníka. Vyžaduje generalVariable: idUcastnika.`,
  html: `
<div id="karta-ucastnika">
  <div id="karta-ucastnika-hlavicka">
    <span id="jmeno-ucastnika">{{ jmeno }}</span>
    <span id="vek-ucastnika-stitek">Věk: {{ vek }}</span>
  </div>
  <div id="email-ucastnika-radek">
    <span id="email-ucastnika-ikona">✉️</span>
    <span id="email-ucastnika">{{ email }}</span>
  </div>
  <div id="telefon-ucastnika-radek">
    <span id="telefon-ucastnika-ikona">📞</span>
    <span id="telefon-ucastnika">{{ telefon }}</span>
  </div>
  <div id="adresa-ucastnika-radek">
    <span id="adresa-ucastnika-ikona">📍</span>
    <span id="adresa-ucastnika">{{ adresa }}</span>
  </div>
</div>
`,
  css: `
#karta-ucastnika {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

#karta-ucastnika-hlavicka {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

#jmeno-ucastnika {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

#vek-ucastnika-stitek {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  background-color: #cffafe;
  color: #0e7490;
  white-space: nowrap;
  flex-shrink: 0;
}

#email-ucastnika-radek, #telefon-ucastnika-radek, #adresa-ucastnika-radek {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

#email-ucastnika-ikona, #telefon-ucastnika-ikona, #adresa-ucastnika-ikona {
  font-size: 14px;
  color: #6b7280;
  flex-shrink: 0;
}
`,
  js: ``,
  js_click: ``,
  sql: {
    "karta-ucastnika": `SELECT u.jmeno, u.vek, u.email, u.telefon, u.adresa FROM ucastnici u WHERE u.id_ucastnika = idUcastnika`
  },
  sql_click: {}
});

