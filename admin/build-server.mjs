import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [path.join(__dirname, 'src/server.ts')],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: path.join(__dirname, 'dist/server.js'),
  packages: 'external',
  format: 'esm',
}).catch(e => { console.error(e); process.exit(1); });

console.log('Server bundled → dist/server.js');
