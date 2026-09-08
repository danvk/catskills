import fs from 'fs';
import {extname, join, normalize, resolve, sep} from 'path';
import type {Plugin} from 'vite';
import {defineConfig} from 'vite';

import react from '@vitejs/plugin-react';

const MIME_TYPES: Record<string, string> = {
  '.geojson': 'application/geo+json',
  '.gpx': 'application/gpx+xml',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

/**
 * Serve the repo's assets/ directory (GPX tracks, photos) at /catskills/assets,
 * the same path Jekyll serves it from in production.
 */
function repoAssets(): Plugin {
  const assetsDir = resolve(__dirname, '../assets');
  return {
    name: 'repo-assets',
    configureServer(server) {
      server.middlewares.use('/catskills/assets', (req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
        const file = join(assetsDir, normalize(urlPath));
        if (
          !file.startsWith(assetsDir + sep) ||
          !fs.existsSync(file) ||
          !fs.statSync(file).isFile()
        ) {
          next();
          return;
        }
        const mime = MIME_TYPES[extname(file).toLowerCase()];
        res.setHeader('Content-Type', mime ?? 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), repoAssets()],
  base: '/catskills/map',
  build: {
    outDir: '../map',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        planner: resolve(__dirname, 'planner/index.html'),
      },
    },
  },
});
