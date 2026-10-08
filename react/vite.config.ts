import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained file, dist/index.html: Boundary Cloud runs a dashboard with no network
// access, so every script, style and image has to be inside it.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
