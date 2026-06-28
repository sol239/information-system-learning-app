import { Component } from "~/model/Component";

export const filtrJidelKomponenta = new Component({
  id: "filtr-jidel",
  name: "Filtr jídel",
  tags: ["jídla", "filtr"],
  description: "Textové pole pro filtrování jídel podle názvu.",

  html: `
<div id="filtr-jidel">
  <span id="filtr-jidel-ikona">⌕</span>
  <input
    type="text"
    id="system-filtr_jidel"
    placeholder="Název jídla"
    autocomplete="off"
  />
</div>
`,

  css: `
#filtr-jidel {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 260px;
  padding: 8px 12px;
  border: 1px solid #065f46;
  border-radius: 8px;
  background-color: #ffffff;
}

#filtr-jidel-ikona {
  color: #065f46;
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

#system-filtr_jidel {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #111827;
  font-size: 14px;
}

#system-filtr_jidel::placeholder {
  color: #9ca3af;
}
`,

  js: ``,
  sql: {
    "jidla-filtrovani-podle-nazvu": `
SELECT j.id_jidla AS id_jidla_filtr_jidel
FROM jidla j
WHERE TRIM('filtr_jidel') = ''
   OR LOWER(j.jmeno) LIKE '%' || LOWER(TRIM('filtr_jidel')) || '%'
ORDER BY j.jmeno, j.id_jidla
`
  },
});
