// What Boundary gives a dashboard: `window.boundary`, defined before the dashboard's own scripts
// run. A dashboard has no network access; its data comes only through `query`, which runs SQL on
// the environment that is selected in Boundary, with the access of whoever is viewing it.

/** A result column: its name and its type. */
export interface BoundaryColumn {
  name: string;
  type: string;
}

/** How a query ended. */
export interface BoundaryOutcome {
  /** `complete`, or why not: `truncated`, `incomplete`, ... */
  status: string;
  elapsedMs: number;
}

/** A query's result. Give two columns of the same name different aliases. */
export interface BoundaryResult<Row = Record<string, unknown>> {
  /** One object for each row, keyed by column name. */
  rows: Row[];
  columns: BoundaryColumn[];
  outcome: BoundaryOutcome;
}

export interface Boundary {
  /**
   * Runs one read-only SELECT over the environment's `processes`, `spans`, `span_announcements`
   * and `profiler`: the same SQL as `baml query`. Rejects with an `Error` whose message says why
   * the query failed.
   */
  query<Row = Record<string, unknown>>(sql: string): Promise<BoundaryResult<Row>>;
  /** Opens a process in Boundary. */
  openProcess(processId: string): void;
  /** Opens a span in Boundary, in its process. */
  openSpan(spanId: string): void;
}

declare global {
  interface Window {
    boundary: Boundary;
  }
  const boundary: Boundary;
}
