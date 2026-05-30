import { Component } from "~/model/Component";

export const sessionSupervisorsListComponent = new Component({
  id: "seznam-vedoucich-turnusu",
  name: "Seznam vedoucích turnusu",
  tags: ["turnusy"],
  description: `Vypisuje vedoucí turnusu s iniciálami avataru, jménem a e-mailem. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div id="seznam-vedoucich-turnusu">
  <ul id="seznam-vedoucich-turnusu-{{ idTurnusu }}"></ul>
</div>
`,
  css: `
#seznam-vedoucich-turnusu {
  width: 100%;
}

#seznam-vedoucich-turnusu ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#seznam-vedoucich-turnusu li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-vedouciho-turnusu {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f6f2ff;
  color: #b79dff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.jmeno-vedouciho-turnusu {
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
}
`,
  js: `
  const inicialy = []
  for (let i = 0; i < jmena.length; i++) {
    const jmeno = (jmena[i] ?? '').trim();
    const castiJmena = jmeno.split(/\\s+/).filter(Boolean);
    const prvniCast = castiJmena[0] ?? '';
    const posledniCast = castiJmena.length > 1 ? castiJmena[castiJmena.length - 1] : '';

    if (prvniCast && posledniCast) {
      inicialy.push((prvniCast.charAt(0) + posledniCast.charAt(0)).toUpperCase());
      continue;
    }

    if (prvniCast) {
      inicialy.push(prvniCast.slice(0, 2).toUpperCase());
      continue;
    }

    inicialy.push('');
  }
  
  const list = document.querySelector('#seznam-vedoucich-turnusu-' + idTurnusu);
  if (list) {
    list.innerHTML = '';

    jmena.forEach(function(text, index) {
      const li = document.createElement('li');

      const avatar = document.createElement('span');
      avatar.className = 'avatar-vedouciho-turnusu';
      avatar.textContent = inicialy[index] ?? '';

      const jmeno = document.createElement('span');
      jmeno.className = 'jmeno-vedouciho-turnusu';
      jmeno.textContent = text;

      li.appendChild(avatar);
      li.appendChild(jmeno);
      list.appendChild(li);
    });
  }`,
  js_click: ``,
  sql: {
    "seznam-vedoucich-turnusu": `SELECT jmeno as jmena FROM vedouci v JOIN vedouci_turnusy vt ON v.id_vedouciho = vt.id_vedouciho WHERE vt.id_turnusu = idTurnusu`
  },
  sql_click: {}
});
