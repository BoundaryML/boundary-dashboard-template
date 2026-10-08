# Boundary dashboard template

A custom dashboard for [Boundary](https://cloud.boundaryml.com) is one HTML file. You upload the file, and Boundary hosts it next to your traces. The file queries the traces of your BAML functions with SQL and draws what you want.

This repository holds the starter file: [`dashboard.html`](dashboard.html). It is the same file that the **Template** button of the Dashboards page downloads.

## Make a dashboard

1. Copy `dashboard.html`.
2. Change the query and the page. The comment at the top of the file is the full reference.
3. In Boundary, open a project and an environment, then **Dashboards**. Upload the file as a new dashboard, or as a new version of a dashboard that exists.

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

**From the dashboard into Boundary.** Call `boundary.openProcess(row.process_id)` or `boundary.openSpan(row.span_id)` in a click handler. The template does this for each row of its table.

**Into the dashboard.** The `#` part of the page's address is kept in Boundary's URL. A copied link opens the dashboard at the same place, and back and forward move through it.

- Route on the hash, for example `#/user/u_123`.
- Change the view by setting `location.hash` in a click handler.
- Do not use a plain `<a href="#...">`: it navigates the frame away.

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

## React or a bundler

Anything that builds to one self-contained HTML file works, for example Vite with `vite-plugin-singlefile`. Upload the built file.
