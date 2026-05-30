import { Component } from "~/model/Component";

export const sessionParticipantsListComponent = new Component({
  id: "seznam-ucastniku-turnusu",
  name: "Seznam účastníků turnusu",
  tags: ["turnusy"],
  description: `Vypisuje účastníky turnusu s iniciálami avatara a jménem. Vyžaduje generalVariable: idTurnusu.`,
  html: `
<div id="seznam-ucastniku-turnusu">
  <ul id="seznam-ucastniku-turnusu-{{ idTurnusu }}"></ul>
</div>
`,
  css: `
#seznam-ucastniku-turnusu {
  width: 100%;
}

#seznam-ucastniku-turnusu ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#seznam-ucastniku-turnusu li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-ucastnika-turnusu {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #dbeafe;
  color: #2252d9;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.jmeno-ucastnika-turnusu {
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
  
  const list = document.querySelector('#seznam-ucastniku-turnusu-' + idTurnusu);
  if (list) {
    list.innerHTML = '';

    jmena.forEach(function(text, index) {
      const li = document.createElement('li');

      const avatar = document.createElement('span');
      avatar.className = 'avatar-ucastnika-turnusu';
      avatar.textContent = inicialy[index] ?? '';

      const jmeno = document.createElement('span');
      jmeno.className = 'jmeno-ucastnika-turnusu';
      jmeno.textContent = text;

      li.appendChild(avatar);
      li.appendChild(jmeno);
      list.appendChild(li);
    });
  }`,
  js_click: ``,
  sql: {
    "seznam-ucastniku-turnusu": `SELECT jmeno as jmena FROM ucastnici u JOIN turnusy_ucastnici tu ON u.id_ucastnika = tu.id_ucastnika WHERE tu.id_turnusu = idTurnusu`
  },
  sql_click: {}
});
