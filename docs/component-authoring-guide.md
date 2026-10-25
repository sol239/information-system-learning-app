# Component Authoring Guide

This guide explains how to create `SystemComponent` `.ts` files — the building blocks rendered by `ComponentWrapper` on every page.

---

## 1. Where components live

```
app/model/SystemComponents/
├── dashboard/          # Stats cards, hero card
├── sessions/           # Per-session cards
├── participants/       # Per-participant cards
├── supervisors/        # Per-supervisor cards
├── meals/              # Per-meal cards
└── meal-plan/          # Meal-plan accordion rows
```

Create a new subfolder for each page/domain. Every `.ts` file in any subfolder is auto-discovered and registered by `app/plugins/init-components.ts` — no manual import needed.

---

## 2. Anatomy of a component file

```ts
import { Component } from "~/model/Component";

export const myComponent = new Component({
  id: "my-component-id", // unique kebab-case, used by getComponentById()
  name: "My Component", // human-readable label
  tags: ["sessions"], // page/domain grouping
  description: `Short description. Mention required generalVariables here.`,

  html: `
<div id="my-root">
  <span id="my-value">sql_column_alias</span>
</div>
`,

  css: `
#my-root {
  display: flex;
  gap: 8px;
}

#my-value {
  font-weight: 700;
}
`,

  js: ``, // runs on mount; declared variables become jsVariables
  js_click: ``, // runs when the component is clicked

  sql: {
    "query-name": `SELECT my_column AS sql_column_alias FROM my_table WHERE id = generalVarName`,
  },

  sql_click: {}, // SQL executed on click (optional)
});
```

---

## 3. The rendering pipeline

```
SQL query executes
       ↓
Column aliases become sqlVariables  (e.g. `sql_column_alias`)
       ↓
generalVariables are merged in       (e.g. `sessionId`)
       ↓
HtmlHandler replaces every occurrence
of a variable name in html/css with its value
       ↓
ComponentWrapper renders v-html
```

**Key rule:** whatever alias you name a SQL column, write that exact name verbatim in your HTML. No `{{ }}` braces needed — plain text works.

---

## 4. generalVariables — per-instance data

Use `generalVariables` when the same component is rendered many times with different input (e.g. once per session card).

**Convention:** suffix the component `id` with `-genvar` to signal it requires injection.

### In the component file

Use the variable name directly in SQL:

```ts
sql: {
  "my-query": `SELECT jmeno FROM ucastnici WHERE id_ucastnika = participantId`
}
```

And in HTML:

```html
<span id="ptcp-name">jmeno</span>
```

### In the page

```vue
<ComponentWrapper
  :component="cardInfoComponent"
  :generalVariables="[new Variable('participantId', participantId)]"
/>
```

Multiple variables:

```vue
:generalVariables="[new Variable('mealId', mealId), new Variable('dayDate',
date)]"
```

---

## 5. Injecting HTML via SQL (dynamic pills / lists)

SQL can generate HTML markup directly. The column alias is replaced in the template:

```ts
html: `<div id="wrapper">allergen_html</div>`,

sql: {
  "my-query": `
    SELECT GROUP_CONCAT(
      '<span class="pill">' || a.jmeno || '</span>', ''
    ) AS allergen_html
    FROM alergeny a
    JOIN jidla_alergeny ja ON a.id_alergenu = ja.id_alergenu
    WHERE ja.id_jidla = mealId
  `
}
```

> **Note:** CSS classes used inside SQL-generated HTML must be defined globally (not scoped), usually inside the component's `css` field (which is injected into `<head>` as a `<style>` tag by `ComponentWrapper`).

---

## 6. Conditional styling via SQL

Use a `CASE` expression to emit different CSS classes:

```ts
sql: {
  "status": `
    SELECT '<span class="badge badge-' ||
      CASE WHEN enrolled >= capacity THEN 'full' ELSE 'available' END ||
      '">' ||
      CASE WHEN enrolled >= capacity THEN 'FULL' ELSE 'AVAILABLE' END ||
      '</span>' AS status_html
    FROM ...
  `
}
```

```ts
css: `
.badge { ... }
.badge-available { background: #dcfce7; color: #16a34a; }
.badge-full      { background: #fee2e2; color: #dc2626; }
`;
```

---

## 7. JS variables

Declare constants in the `js` field — they become `jsVariables` available in HTML templates:

```ts
js: `
const greeting = "Hello";
const count = 42;
`,
html: `<div>greeting — count items</div>`
```

JS click actions can also read `sqlVariables` as pre-declared constants (shown as a protected header in the editor).

---

## 8. Click SQL actions

`sql_click` is a record of SQL statements executed when the component is clicked:

```ts
sql_click: {
  "delete": `DELETE FROM ucastnici WHERE id_ucastnika = participantId`
}
```

`js_click` is arbitrary JS executed on click. Both have access to all current variables.

---

## 9. Tags

Tags are auto-enriched with technology tags (`html`, `css`, `js`, `sql`) based on non-empty fields. Add at least one domain tag for filtering in the component browser:

```ts
tags: ["sessions"]; // → stored as ["sessions", "html", "css", "sql"]
```

---

## 10. Registering to a page

1. Create the `.ts` file anywhere under `app/model/SystemComponents/**/*.ts`.
2. The plugin auto-registers it on next dev server start / hot reload.
3. In the page, retrieve it via the store and pass to `ComponentWrapper`:

```ts
const myComp = computed(() => systemsStore.getComponentById("my-component-id"));
```

```vue
<ComponentWrapper :component="myComp" />
<!-- or with generalVariables: -->
<ComponentWrapper
  :component="myComp"
  :generalVariables="[new Variable('sessionId', sessionId)]"
/>
```

---

## 11. Naming conventions

| Thing              | Convention                                        | Example                          |
| ------------------ | ------------------------------------------------- | -------------------------------- |
| File name          | `PascalCase` + `Component.ts`                     | `SessionStatusBadgeComponent.ts` |
| Exported constant  | `camelCase` + `Component`                         | `sessionStatusBadgeComponent`    |
| Component `id`     | `kebab-case`, suffix `-genvar` if needs injection | `session-status-badge-genvar`    |
| SQL query keys     | same as `id` or short descriptive name            | `"session-status-badge-genvar"`  |
| HTML element `id`s | short prefix + descriptor, no generic names       | `#sess-status-wrapper`           |
| CSS classes in SQL | prefix matching the component                     | `.sess-status-badge`             |

---

## 12. Full minimal example

```ts
import { Component } from "~/model/Component";

export const sessionDayCountBadgeComponent = new Component({
  id: "session-day-count-badge-genvar",
  name: "Session Day Count Badge",
  tags: ["sessions"],
  description:
    "Shows how many days a session lasts. Requires generalVariable: sessionId.",

  html: `
<div id="day-count-badge">
  📅 Number of Days: sess_days
</div>
`,

  css: `
#day-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: #16a34a;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}
`,

  js: ``,
  js_click: ``,

  sql: {
    "session-day-count-badge-genvar": `
      SELECT CAST(julianday(datum_do) - julianday(datum_od) + 1 AS INTEGER) AS sess_days
      FROM turnusy
      WHERE id_turnusu = sessionId
    `,
  },

  sql_click: {},
});
```

Usage in a page:

```vue
<ComponentWrapper
  :component="dayCountComponent"
  :generalVariables="[new Variable('sessionId', sessionId)]"
/>
```
