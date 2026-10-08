import { useEffect, useState } from 'react';
import { goTo, useHash } from './useHash';

// An example: the latest 20 processes, all of them or the failed ones, each opening in Boundary.
// Replace it with your own queries and views.

type Process = {
  process_id: string;
  status: string | null;
  entry: string | null;
  start_time: string | null;
  duration: number | null;
};

const VIEWS = [
  { place: '', label: 'All' },
  { place: '/failed', label: 'Failed' },
];

const recent = (failedOnly: boolean) => `
  SELECT p.process_id, p.status, s.span_name AS entry, s.start_time, s.duration
  FROM processes p
  JOIN spans s ON s.process_id = p.process_id
  WHERE s.parent_span_id IS NULL AND s.span_name <> 'baml.gc'
    ${failedOnly ? "AND p.status <> 'success'" : ''}
  ORDER BY s.start_time DESC
  LIMIT 20`;

const seconds = (ns: number | null) => (ns === null ? '-' : `${(ns / 1e9).toFixed(2)}s`);

type Loaded = { processes: Process[] } | { error: string } | null;

export function App() {
  // A place that is not in the list shows all processes.
  const place = useHash();
  const failedOnly = place === '/failed';
  const [loaded, setLoaded] = useState<Loaded>(null);

  useEffect(() => {
    // A slow answer for a view that the viewer has left is dropped.
    let current = true;
    setLoaded(null);
    boundary.query<Process>(recent(failedOnly)).then(
      ({ rows }) => current && setLoaded({ processes: rows }),
      (failure: Error) => current && setLoaded({ error: failure.message }),
    );
    return () => {
      current = false;
    };
  }, [failedOnly]);

  return (
    <main>
      <h1>Recent processes</h1>
      <nav>
        {VIEWS.map((view) => (
          <button
            key={view.place}
            type="button"
            aria-pressed={view.place === (failedOnly ? '/failed' : '')}
            onClick={() => goTo(view.place)}
          >
            {view.label}
          </button>
        ))}
      </nav>
      {loaded === null && <p className="muted">Loading...</p>}
      {loaded && 'error' in loaded && <p>{loaded.error}</p>}
      {loaded && 'processes' in loaded && (
        <table>
          <thead>
            <tr>
              <th>Entry</th>
              <th>Status</th>
              <th>Started</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {loaded.processes.map((process) => (
              <tr key={process.process_id} onClick={() => boundary.openProcess(process.process_id)}>
                <td>{process.entry ?? '-'}</td>
                <td className={process.status === 'success' ? undefined : 'failed'}>{process.status ?? '-'}</td>
                <td>{process.start_time ?? '-'}</td>
                <td>{seconds(process.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
