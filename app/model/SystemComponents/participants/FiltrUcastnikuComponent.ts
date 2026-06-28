import { Component } from "~/model/Component";

export const filtrUcastnikuKomponenta = new Component({
  id: "filtr-ucastniku",
  name: "Filtr účastníků",
  tags: ["účastníci", "filtr"],
  description: "Textové pole pro filtrování účastníků podle jména nebo emailu.",

  html: `
<div id="filtr-ucastniku">
  <span id="filtr-ucastniku-ikona">⌕</span>
  <input
    type="text"
    id="system-filtr_ucastniku"
    placeholder="Jméno nebo email"
    autocomplete="off"
  />
</div>
`,

  css: `
#filtr-ucastniku {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 260px;
  padding: 8px 12px;
  border: 1px solid #0e7490;
  border-radius: 8px;
  background-color: #ffffff;
}

#filtr-ucastniku-ikona {
  color: #0e7490;
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

#system-filtr_ucastniku {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #111827;
  font-size: 14px;
}

#system-filtr_ucastniku::placeholder {
  color: #9ca3af;
}
`,

  js: ``,
  sql: {
    "ucastnici-filtrovani-podle-jmena-emailu": `
SELECT u.id_ucastnika AS id_ucastnika_filtr_ucastniku
FROM ucastnici u
WHERE TRIM('filtr_ucastniku') = ''
   OR LOWER(u.jmeno) LIKE '%' || LOWER(TRIM('filtr_ucastniku')) || '%'
   OR LOWER(u.email) LIKE '%' || LOWER(TRIM('filtr_ucastniku')) || '%'
ORDER BY u.jmeno, u.id_ucastnika
`
  },
});
