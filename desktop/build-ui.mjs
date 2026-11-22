import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (file) => fs.readFileSync(file, 'utf8');

const css = read(path.join(root, 'src', 'style.css'));
const svg = read(path.join(root, 'src', 'whale.svg'));
let whale = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
whale = whale.replace(/\sid="[^"]*"/g, '').replace(/fill="#000"/g, 'fill="currentColor"');

const template = read(path.join(here, 'ui.template.html'));
const html = template
  .replace('__CSS__', () => css)
  .replace(/__WHALE__/g, () => whale);
fs.writeFileSync(path.join(here, 'index.html'), html);
console.log('built desktop/index.html (%d bytes)', html.length);
