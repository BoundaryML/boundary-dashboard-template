import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

// `window.boundary` exists only inside Boundary. `npm run dev` has a stand-in with sample rows,
// which is not part of the built file.
if (import.meta.env.DEV && !('boundary' in window)) {
  const { installDevBoundary } = await import('./dev-boundary');
  installDevBoundary();
}

createRoot(root).render(
  <StrictMode>
    {'boundary' in window ? <App /> : <p>Upload this file to Boundary to query an environment.</p>}
  </StrictMode>,
);
