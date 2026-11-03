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
  external: [
    'better-sqlite3',
    'nodemailer',
    'multer',
    'express',
    'cors',
    'ioredis',
    'fsevents',
  ],
  format: 'esm',
  banner: {
    js: `
import { createRequire as __createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname2 } from 'path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname2(__filename);
`.trim(),
  },
}).catch(e => { console.error(e); process.exit(1); });

console.log('Server bundled → dist/server.js');