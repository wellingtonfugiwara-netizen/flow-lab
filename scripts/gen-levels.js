/**
 * Gerador de níveis do Flow Lab.
 *
 * A ideia: um nível é solúvel POR CONSTRUÇÃO. Traçamos um caminho hamiltoniano
 * (passa por todas as células exatamente uma vez) e cortamos em k pedaços
 * contíguos. Cada pedaço vira uma cor, e suas pontas viram os pontos fixos.
 * Como os pedaços juntos cobrem o tabuleiro e não se cruzam, a solução original
 * é uma solução válida — não existe nível impossível saindo daqui.
 *
 * O teste em src/logic/__tests__/levels.test.ts ainda roda o solver de verdade
 * em cima do resultado, como segunda barreira.
 *
 * Uso: node scripts/gen-levels.js > src/logic/levels.ts
 */

// PRNG com semente, pra que rodar de novo dê exatamente os mesmos níveis.
function makeRng(seed) {
  let s = seed >>> 0;
  return function rng() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function neighbors(size, [r, c]) {
  const out = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < size - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < size - 1) out.push([r, c + 1]);
  return out;
}

/**
 * Caminho hamiltoniano por backtracking, guiado pela heurística de Warnsdorff
 * (visitar primeiro o vizinho com menos saídas). Sem essa heurística o
 * backtracking em 7x7 fica lento demais.
 */
function hamiltonian(size, rng, maxSteps = 5_000_000) {
  const total = size * size;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const path = [];
  let steps = 0;

  const start = [Math.floor(rng() * size), Math.floor(rng() * size)];

  function degree(cell) {
    return neighbors(size, cell).filter(([r, c]) => !visited[r][c]).length;
  }

  function walk(cell) {
    if (steps++ > maxSteps) return false;
    const [r, c] = cell;
    visited[r][c] = true;
    path.push(cell);
    if (path.length === total) return true;

    const options = shuffle(
      neighbors(size, cell).filter(([nr, nc]) => !visited[nr][nc]),
      rng,
    ).sort((a, b) => degree(a) - degree(b));

    for (const next of options) {
      if (walk(next)) return true;
    }

    visited[r][c] = false;
    path.pop();
    return false;
  }

  return walk(start) ? path : null;
}

/** Corta o caminho em k pedaços de tamanho parecido, cada um com 2+ células. */
function cut(path, k) {
  const n = path.length;
  const base = Math.floor(n / k);
  if (base < 2) return null;

  const sizes = Array(k).fill(base);
  let leftover = n - base * k;
  for (let i = 0; leftover > 0; i = (i + 1) % k, leftover--) sizes[i]++;

  const segments = [];
  let at = 0;
  for (const len of sizes) {
    segments.push(path.slice(at, at + len));
    at += len;
  }
  return segments;
}

const PALETTE = ['rose', 'mint', 'sky', 'amber', 'violet', 'coral', 'lime'];

function buildLevel(id, size, colorCount, seed) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const rng = makeRng(seed + attempt * 7919);
    const path = hamiltonian(size, rng);
    if (!path) continue;
    const segments = cut(path, colorCount);
    if (!segments) continue;

    const pairs = segments.map((seg, i) => ({
      color: PALETTE[i],
      a: { row: seg[0][0], col: seg[0][1] },
      b: { row: seg[seg.length - 1][0], col: seg[seg.length - 1][1] },
    }));

    // Par cujas pontas se tocam vira caminho de 2 células — sem graça.
    const trivial = pairs.some(
      (p) => Math.abs(p.a.row - p.b.row) + Math.abs(p.a.col - p.b.col) < 2,
    );
    if (trivial) continue;

    return { id, size, pairs };
  }
  throw new Error(`nao consegui gerar ${id}`);
}

const SPECS = [
  ['5-1', 5, 4, 101],
  ['5-2', 5, 4, 202],
  ['5-3', 5, 5, 303],
  ['6-1', 6, 5, 404],
  ['6-2', 6, 5, 505],
  ['7-1', 7, 5, 606],
  ['7-2', 7, 6, 707],
  ['7-3', 7, 6, 808],
];

const levels = SPECS.map(([id, size, k, seed]) => buildLevel(id, size, k, seed));

const body = levels
  .map((l) => {
    const pairs = l.pairs
      .map(
        (p) =>
          `      { color: '${p.color}', a: { row: ${p.a.row}, col: ${p.a.col} }, b: { row: ${p.b.row}, col: ${p.b.col} } },`,
      )
      .join('\n');
    return `  {\n    id: '${l.id}',\n    size: ${l.size},\n    pairs: [\n${pairs}\n    ],\n  },`;
  })
  .join('\n');

process.stdout.write(`// GERADO POR scripts/gen-levels.js — não editar à mão.
//
// Cada nível nasce de um caminho que cobre o tabuleiro inteiro, cortado em
// pedaços. Isso garante que existe solução. Rode o gerador de novo para
// regenerar; a semente é fixa, então o resultado é sempre o mesmo.

import type { Level } from './types';

export const LEVELS: readonly Level[] = [
${body}
] as const;

export function levelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
`);
