// A stand-in for Boundary during `npm run dev`: it answers every query with the sample rows
// below and logs the processes and spans that the page opens. It is for layout work only. Try
// your SQL with `baml query --environment <name> "SELECT ..."`.

const SAMPLE_ROWS: Record<string, unknown>[] = [
  { process_id: 'p1', status: 'success', entry: 'user.ExtractResume', start_time: '2026-01-01T10:00:00Z', duration: 1_500_000_000 },
  { process_id: 'p2', status: 'error', entry: 'user.ClassifyTicket', start_time: '2026-01-01T09:58:00Z', duration: 320_000_000 },
  { process_id: 'p3', status: 'success', entry: 'user.Summarize', start_time: '2026-01-01T09:50:00Z', duration: null },
];

// The variables that Boundary sets, with its dark theme.
const PALETTE: Record<string, string> = {
  '--bg': '#09090a',
  '--panel': '#101012',
  '--fg': '#ededef',
  '--muted': '#72727b',
  '--line': '#212126',
  '--accent': '#c8f03c',
  '--bad': '#d03b3b',
  '--font': 'ui-sans-serif, system-ui, sans-serif',
};

export function installDevBoundary(): void {
  const root = document.documentElement;
  root.dataset.theme = 'dark';
  for (const [name, value] of Object.entries(PALETTE)) root.style.setProperty(name, value);
  window.boundary = {
    query: async (sql) => {
      console.info('boundary.query', sql);
      const failedOnly = sql.includes("<> 'success'");
      const rows = SAMPLE_ROWS.filter((row) => !failedOnly || row.status !== 'success');
      return { rows: rows as never, columns: [], outcome: { status: 'complete', elapsedMs: 0 } };
    },
    openProcess: (processId) => console.info('boundary.openProcess', processId),
    openSpan: (spanId) => console.info('boundary.openSpan', spanId),
  };
}
