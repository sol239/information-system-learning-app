import { Component } from "~/model/Component";

export const hlavniKartaSystemuKomponenta = new Component({
  id: "hlavni-karta-systemu",
  name: "Hlavní karta systému",
  tags: ["hlavni", "karta", "systému"],
  description: `Karta zobrazující název systému, popis a jazyk.`,
  html: `
<div id="hlavni-karta-systemu">
  <div id="pozadi-horni"></div>
  <div id="pozadi-spodni"></div>

  <div id="obsah-karty">
    <div id="badge-systemu">Informační systém</div>

    <h1 id="nazev-systemu">Školní tábor Pálava</h1>

    <p id="popis-systemu">
      Školní tábor v Pálavě, zaměřený na výuku a zábavu pro děti.
    </p>
  </div>
</div>
`,
  css: `
#hlavni-karta-systemu {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(14,165,233,0.04) 50%, rgba(56,189,248,0.08) 100%);
  padding: 48px;
  width: 800px;
  border: 1px solid rgba(99,102,241,0.2);
  box-shadow: 0 20px 40px rgba(99,102,241,0.06);
}

#pozadi-horni {
  position: absolute;
  top: -48px;
  right: -48px;
  width: 256px;
  height: 256px;
  background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
  transform: rotate(12deg);
  pointer-events: none;
}

#pozadi-spodni {
  position: absolute;
  bottom: -32px;
  left: -32px;
  width: 192px;
  height: 192px;
  background: radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%);
  transform: rotate(-12deg);
  pointer-events: none;
}

#obsah-karty {
  position: relative;
  z-index: 1;
}

#badge-systemu {
  display: inline-block;
  padding: 4px 12px;
  background-color: rgba(99,102,241,0.12);
  color: #6366f1;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

#nazev-systemu {
  font-size: 36px;
  font-weight: 900;
  color: #111827;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

#popis-systemu {
  font-size: 17px;
  color: #4b5563;
  max-width: 700px;
  line-height: 1.7;
  font-weight: 500;
  margin: 0 0 32px 0;
}

#meta-systemu {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

#jazyk-systemu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  border: 1px solid rgba(229,231,235,0.6);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

#ikona-jazyka-systemu {
  font-size: 18px;
}

#popisek-jazyka-systemu {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
`,
  js: ``,
  js_click: ``,
  sql: {},
  sql_click: {},
});
