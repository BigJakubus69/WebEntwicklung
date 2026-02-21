import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await esbuild.build({
    entryPoints: [path.join(__dirname, 'public/js/app.js')],
    bundle: true,
    outfile: path.join(__dirname, 'public/dist/bundle.js'),
    format: 'esm',
    sourcemap: true,
    target: ['chrome58', 'firefox57'],
    loader: {
        '.js': 'jsx'
    }
});

console.log('Build abgeschlossen!');
