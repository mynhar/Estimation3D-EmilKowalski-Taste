#!/usr/bin/env node
/**
 * Valida que cada referencia `var(--ds-*)` en los CSS de componentes, en las
 * hojas globales (src/styles/*, src/styles.css) y en el tema de Material
 * exista realmente como token definido en src/styles/tokens.css.
 *
 * Captura el bug "token fantasma" (p. ej. var(--ds-accent) cuando el token
 * real es --ds-action) que stylelint no detecta sin plugins ruidosos.
 * Solo inspecciona el prefijo --ds-, así que nunca da falsos positivos con
 * variables locales de componente (--sb-*, --acento, --estado-color, …).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TOKENS_FILE = join(ROOT, 'src/styles/tokens.css');
const SCAN_TARGETS = ['src/app', 'src/styles', 'src/styles.css'].map((p) => join(ROOT, p));

// 1. Recolectar los tokens --ds-* definidos (líneas "  --ds-foo: valor;")
const defined = new Set();
const tokensCss = readFileSync(TOKENS_FILE, 'utf8');
for (const m of tokensCss.matchAll(/(--ds-[a-z0-9-]+)\s*:/gi)) {
  defined.add(m[1]);
}

// 2. Recorrer recursivamente los .css (y el .scss del tema de Material) y comprobar cada var(--ds-*)
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.css') || entry.endsWith('.scss')) out.push(full);
  }
  return out;
}

const violations = [];
const files = SCAN_TARGETS.flatMap((p) => (statSync(p).isDirectory() ? walk(p) : [p]));
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/gi)) {
      const tok = m[1];
      // `var(--ds-font-*)` en un comentario es un comodín, no una referencia.
      if (tok.endsWith('-')) continue;
      if (!defined.has(tok)) {
        violations.push({ file: relative(ROOT, file), line: i + 1, tok });
      }
    }
  });
}

if (violations.length) {
  console.error(`\n✖ ${violations.length} referencia(s) a token --ds-* inexistente:\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.tok}`);
  }
  console.error(`\n(${defined.size} tokens válidos en src/styles/tokens.css)\n`);
  process.exit(1);
}

console.log(`✓ Tokens --ds-* OK — ${defined.size} definidos, ${files.length} hojas revisadas, todas las referencias resuelven.`);
