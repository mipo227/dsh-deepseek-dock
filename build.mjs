import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
};

const css = read('src/style.css');
const svg = read('src/whale.svg');
let whale = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
whale = whale.replace(/\sid="[^"]*"/g, '').replace(/fill="#000"/g, 'fill="currentColor"');

const client = read('src/client.js')
  .replace('__CSS__', () => JSON.stringify(css))
  .replace('__WHALE__', () => JSON.stringify(whale));
write('lib/client.js', client);

const preview = read('src/preview.html')
  .replace(/__CSS__/g, () => css)
  .replace(/__WHALE__/g, () => whale);
write('preview.html', preview);

console.log('built lib/client.js (%d bytes) and preview.html (%d bytes)', client.length, preview.length);
