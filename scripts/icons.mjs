#!/usr/bin/env node
/**
 * Material Symbols Outlined se carga como subconjunto: index.html pide a Google
 * Fonts solo los iconos que usa la app (`icon_names=…`), unos pocos KB en vez
 * de 324 KB. Este script mantiene esa lista al día.
 *
 *   node scripts/icons.mjs           → falla si falta o sobra algún icono
 *   node scripts/icons.mjs --write   → reescribe la lista en src/index.html
 *
 * Qué cuenta como uso:
 *   - en plantillas (.html y plantillas inline de .ts):  <mat-icon …>nombre</mat-icon>,
 *     fontIcon="nombre"  y la entrada  matIcon="nombre"  de componentes propios
 *   - en TypeScript, para iconos dinámicos:  matIcon: 'nombre'  /  matIcon = 'nombre'
 * Un <mat-icon>{{ expr }}</mat-icon> dinámico debe leer de una propiedad `matIcon`.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const APP = join(ROOT, 'src/app');
const INDEX = join(ROOT, 'src/index.html');
const WRITE = process.argv.includes('--write');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(html|ts)$/.test(entry) && !entry.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

const used = new Map(); // nombre → primer archivo que lo usa
const add = (name, file) => { if (!used.has(name)) used.set(name, relative(ROOT, file)); };

for (const file of walk(APP)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/<mat-icon\b[^>]*>\s*([a-z0-9_]+)\s*<\/mat-icon>/g)) add(m[1], file);
  for (const m of src.matchAll(/fontIcon="([a-z0-9_]+)"/g)) add(m[1], file);
  // Entradas de componentes propios que reciben el nombre del icono: matIcon="nombre"
  for (const m of src.matchAll(/\bmatIcon="([a-z0-9_]+)"/g)) add(m[1], file);
  if (file.endsWith('.ts')) {
    for (const m of src.matchAll(/matIcon\s*[:=]\s*'([a-z0-9_]+)'/g)) add(m[1], file);
  }
}

const html = readFileSync(INDEX, 'utf8');
const re = /(family=Material\+Symbols\+Outlined[^"]*?&icon_names=)([a-z0-9_,]*)/;
const m = html.match(re);
if (!m) {
  console.error('✖ src/index.html no tiene el enlace de Material Symbols con icon_names=');
  process.exit(1);
}

const wanted = [...used.keys()].sort();   // Google Fonts exige orden alfabético
const listed = m[2] ? m[2].split(',') : [];

if (WRITE) {
  writeFileSync(INDEX, html.replace(re, `$1${wanted.join(',')}`));
  console.log(`✓ index.html: ${wanted.length} iconos de Material Symbols`);
  process.exit(0);
}

const missing = wanted.filter(n => !listed.includes(n));
const extra = listed.filter(n => !used.has(n));
const unsorted = listed.join(',') !== [...listed].sort().join(',');

if (missing.length || extra.length || unsorted) {
  if (missing.length) {
    console.error(`\n✖ ${missing.length} icono(s) usados que faltan en index.html:`);
    for (const n of missing) console.error(`  ${n}  (${used.get(n)})`);
  }
  if (extra.length) console.error(`\n✖ Iconos en index.html que ya no se usan: ${extra.join(', ')}`);
  if (unsorted) console.error('\n✖ La lista icon_names de index.html no está en orden alfabético');
  console.error('\nArréglalo con: node scripts/icons.mjs --write\n');
  process.exit(1);
}

console.log(`✓ Material Symbols OK — ${wanted.length} iconos, todos en index.html.`);
