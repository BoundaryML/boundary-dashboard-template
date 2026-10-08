# Boundary dashboard template

A custom dashboard for [Boundary](https://cloud.boundaryml.com) is one HTML file. You upload the file, and Boundary hosts it next to your traces. The file queries the traces of your BAML functions with SQL and draws what you want.

This repository has two starters with the same example, a list of recent processes with two views:

| Starter | Use it when |
| --- | --- |
| [`dashboard.html`](dashboard.html) | You want one file with no build step. It is the template of Boundary's Dashboards page. |
| [`react/`](react) | You want React and TypeScript. Vite builds it to one HTML file. |

## Make a dashboard

1. Copy `dashboard.html`, or the `react` folder.
2. Change the query and the page. The comment at the top of `dashboard.html` is the full reference.
3. For React, build the file (see [React](#react)).
4. In Boundary, open a project and an environment, then **Dashboards**. Upload the file as a new dashboard, or as a new version of a dashboard that exists.

Every environment of the project shares the dashboard. It runs against the environment that is selected in Boundary, and each viewer sees that environment's data with their own access.

## The API

Boundary defines `boundary` before your scripts run.

| Call | What it does |
| --- | --- |
| `boundary.query(sql)` | Runs one read-only `SELECT` and resolves to `{ rows, columns, outcome }`. `rows` are objects keyed by column name. It rejects with an `Error` that says why the query failed. |
| `boundary.openProcess(processId)` | Opens the process in Boundary. |
| `boundary.openSpan(spanId)` | Opens the span, in its process. |

The SQL is the SQL of `baml query`. The tables are `processes`, `spans`, `span_announcements` and `profiler`.

```bash
baml query --schema                 # the tables
baml query --schema --table spans   # the columns of one table
baml query --environment <name> "SELECT ..."   # try a query before you put it in the file
```

## Deep links

There are two kinds of link.

**From the dashboard into Boundary.** Call `boundary.openProcess(row.process_id)` or `boundary.openSpan(row.span_id)` in a click handler. Both starters do this for each row of the table.

**Into the dashboard.** The `#` part of the page's address is kept in Boundary's URL. A copied link opens the dashboard at the same place, and back and forward move through it.

- Route on the hash, for example `#/user/u_123`.
- Change the view by setting `location.hash` in a click handler.
- Do not use a plain `<a href="#...">`: it navigates the frame away.

Both starters show this with the views "All" and "Failed": the "Failed" button sets the hash to `#/failed`, and the page reads the hash to pick its query. In React the hook is `useHash()` in [`react/src/useHash.ts`](react/src/useHash.ts). The pattern, with an item in the path:

```js
function render() {
  const [, view, item] = location.hash.split('/');   // "#/user/u_123" -> "user", "u_123"
  // draw the view
}
window.addEventListener('hashchange', render);
render();

row.onclick = () => { location.hash = `#/user/${encodeURIComponent(userId)}`; };
```

## Theme

`<html data-theme="light|dark">` follows the theme of Boundary, and so do these CSS variables:

`--bg` `--panel` `--fg` `--muted` `--line` `--accent` `--bad` `--font`

## Rules

- **No network access.** `fetch`, and scripts, styles, fonts and images from other origins are blocked. Put everything in the one file (`data:` URLs work for images).
- **No cookies, `localStorage` or forms.**
- **Size limit:** 5 MiB by default.
- **Use `textContent`, not `innerHTML`,** for query results. The results hold whatever your functions logged.
- Captured values (`input_args`, `output_value`, ...) arrive whole. Stored files and media bytes cannot be read.

## React

```sh
cd react
npm install
npm run build      # writes dist/index.html: upload this file
```

- `src/App.tsx` is the example. `src/boundary.d.ts` has the types of `window.boundary`.
- `npm run dev` serves the page locally with a stand-in for Boundary (`src/dev-boundary.ts`): it answers every query with a few sample rows, so you can work on the layout. It is not part of the built file. Try your SQL with `baml query`.
- `vite-plugin-singlefile` puts the scripts and styles inside the one file, because a dashboard has no network access.

Any other tool that builds to one self-contained HTML file works too.
