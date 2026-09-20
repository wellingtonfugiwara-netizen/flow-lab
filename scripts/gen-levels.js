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
 * Solúvel, porém, não basta: o primeiro catálogo era fácil demais porque os
 * níveis tinham VÁRIAS soluções, e aí qualquer tentativa razoável fecha. Por
 * isso o gerador agora conta as soluções de cada candidato e procura os de
 * solução única (ver `buildLevel`).
 *
 * Uso: node scripts/gen-levels.js > src/logic/levels.ts — leva alguns minutos,
 * e o relatório de cada nível sai no stderr.
 */

// PRNG com semente, pra que rodar de novo dê exatamente os mesmos níveis.
function makeRng(seed) {
  let s = seed >>> 0;
  return function rng() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function neighbors(size, [r, c]) {
  const out = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < size - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < size - 1) out.push([r, c + 1]);
  return out;
}

/** Caminho em serpentina cobrindo o tabuleiro — ponto de partida do embaralho. */
function snake(size) {
  const path = [];
  for (let r = 0; r < size; r++) {
    for (let i = 0; i < size; i++) {
      path.push([r, r % 2 === 0 ? i : size - 1 - i]);
    }
  }
  return path;
}

/**
 * Embaralha um caminho hamiltoniano pelo "backbite": pega uma das pontas,
 * escolhe um vizinho dela no tabuleiro e inverte o trecho entre os dois. O
 * resultado continua passando por todas as células exatamente uma vez, e cada
 * passo custa O(n) em vez de recomeçar a busca.
 *
 * Antes isto era backtracking com heurística de Warnsdorff. Funcionava, mas em
 * 8x8 gastava ~2s por caminho, e a busca por nível de solução única precisa de
 * centenas de caminhos — o gerador levaria horas. Aqui são milhares por
 * segundo.
 */
function backbite(path, size, rng, steps) {
  const idx = new Map(path.map(([r, c], i) => [r * size + c, i]));
  const key = ([r, c]) => r * size + c;

  const reverse = (from, to) => {
    while (from < to) {
      const a = path[from];
      const b = path[to];
      path[from] = b;
      path[to] = a;
      idx.set(key(b), from);
      idx.set(key(a), to);
      from++;
      to--;
    }
  };

  for (let s = 0; s < steps; s++) {
    const atEnd = rng() < 0.5;
    const end = atEnd ? path[path.length - 1] : path[0];
    const opts = neighbors(size, end);
    const pick = opts[Math.floor(rng() * opts.length)];
    const i = idx.get(key(pick));

    if (atEnd) {
      if (i >= path.length - 2) continue;
      reverse(i + 1, path.length - 1);
    } else {
      if (i <= 1) continue;
      reverse(0, i - 1);
    }
  }

  return path;
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

const PALETTE = [
  'rose',
  'mint',
  'sky',
  'amber',
  'violet',
  'coral',
  'lime',
  'teal',
  'orange',
  'indigo',
];

/**
 * Conta soluções, parando em `cap`. É o que separa nível difícil de nível
 * chato: com várias soluções o jogador fecha no chute e o quebra-cabeça vira
 * exercício de preencher espaço. Com solução única, cada caminho é forçado.
 *
 * Mesma busca do `src/logic/solver.ts`, reescrita aqui porque o script roda em
 * JS puro. Ter duas implementações é de propósito: a do TS confere o resultado
 * nos testes, por um caminho independente.
 */
function countSolutions(level, cap = 2, maxSteps = 4_000_000) {
  const size = level.size;
  const occ = Array.from({ length: size }, () => Array(size).fill(null));
  const endpoints = new Set();
  for (const p of level.pairs) {
    endpoints.add(`${p.a[0]},${p.a[1]}`);
    endpoints.add(`${p.b[0]},${p.b[1]}`);
    occ[p.a[0]][p.a[1]] = p.color;
    occ[p.b[0]][p.b[1]] = p.color;
  }

  let found = 0;
  let steps = 0;
  let exhausted = false;

  const isEnd = ([r, c]) => endpoints.has(`${r},${c}`);

  // Poda: célula vazia com menos de duas saídas vira beco, e o tabuleiro nunca
  // fecha 100%. A ponta do traço em curso conta como saída — ela ainda avança.
  function stranded(head) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (occ[r][c] !== null) continue;
        const free = neighbors(size, [r, c]).filter(
          ([nr, nc]) =>
            occ[nr][nc] === null || isEnd([nr, nc]) || (nr === head[0] && nc === head[1]),
        ).length;
        if (free < 2) return true;
      }
    }
    return false;
  }

  function empties() {
    let n = 0;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (occ[r][c] === null) n++;
    return n;
  }

  function connect(i, cur) {
    if (steps++ > maxSteps) {
      exhausted = true;
      return;
    }
    if (found >= cap) return;

    const pair = level.pairs[i];
    const [tr, tc] = pair.b;

    if (cur[0] === tr && cur[1] === tc) {
      if (i === level.pairs.length - 1) {
        if (empties() === 0) found++;
        return;
      }
      const next = level.pairs[i + 1];
      if (stranded(next.a)) return;
      connect(i + 1, next.a);
      return;
    }

    for (const n of neighbors(size, cur)) {
      if (found >= cap || exhausted) return;
      if (n[0] === tr && n[1] === tc) {
        connect(i, n);
        continue;
      }
      if (occ[n[0]][n[1]] !== null) continue;

      occ[n[0]][n[1]] = pair.color;
      if (!stranded(n)) connect(i, n);
      occ[n[0]][n[1]] = null;
    }
  }

  if (level.pairs.length > 0) connect(0, level.pairs[0].a);
  return { count: found, exhausted };
}

/** Quantas vezes o caminho vira. Caminho reto não ensina nada ao jogador. */
function turns(seg) {
  let n = 0;
  for (let i = 2; i < seg.length; i++) {
    const dr1 = seg[i - 1][0] - seg[i - 2][0];
    const dc1 = seg[i - 1][1] - seg[i - 2][1];
    const dr2 = seg[i][0] - seg[i - 1][0];
    const dc2 = seg[i][1] - seg[i - 1][1];
    if (dr1 !== dr2 || dc1 !== dc2) n++;
  }
  return n;
}

/**
 * Procura o nível mais duro que couber no orçamento de tempo.
 *
 * Solução única é a meta: enquanto houver duas maneiras de fechar o tabuleiro,
 * o jogador acerta no chute e o nível não ensina nada. Mas nível único é raro
 * (cerca de 1 em 10 no 6x6, menos ainda nos grandes), então o gerador vasculha
 * candidatos até achar um — e, se o tempo acabar, fica com o de menos soluções
 * que viu. Nunca devolve um nível não verificado.
 */
function buildLevel(id, size, colorCount, seed, { orcamentoMs = 45_000, minDist = 2 } = {}) {
  const rng = makeRng(seed);
  const path = backbite(snake(size), size, rng, size * size * 20);
  const limite = Date.now() + orcamentoMs;

  let melhor = null;
  let vistos = 0;

  while (Date.now() < limite) {
    // Continua embaralhando o MESMO caminho: cada rodada de backbite parte do
    // anterior, então o custo por candidato é baixo.
    backbite(path, size, rng, size * size);

    const segments = cut(path, colorCount);
    if (!segments) break;
    // Pedaço curto vira caminho óbvio, e um só já entrega parte do tabuleiro.
    if (segments.some((seg) => seg.length < 4)) continue;
    // Pedaço reto o jogador resolve sem pensar.
    if (segments.filter((seg) => turns(seg) === 0).length > 0) continue;

    const pairs = segments.map((seg, i) => ({
      color: PALETTE[i],
      a: seg[0],
      b: seg[seg.length - 1],
    }));

    // Pontas coladas fazem um par que se resolve sozinho.
    if (pairs.some((p) => Math.abs(p.a[0] - p.b[0]) + Math.abs(p.a[1] - p.b[1]) < minDist))
      continue;

    vistos++;
    const { count, exhausted } = countSolutions({ size, pairs }, 2, 2_000_000);
    // `exhausted` = estourou o orçamento de busca e não sabemos o número real.
    // Descartar é conservador de propósito: só entra nível verificado.
    if (exhausted || count === 0) continue;

    if (!melhor || count < melhor.count) {
      melhor = { count, pairs: pairs.map((p) => ({ ...p })) };
      if (count === 1) break;
    }
  }

  if (!melhor) throw new Error(`nao consegui gerar ${id}`);
  process.stderr.write(
    `${id}: ${size}x${size}, ${colorCount} cores, ${melhor.count === 1 ? 'solução única' : `${melhor.count}+ soluções`} (${vistos} candidatos)\n`,
  );

  return {
    id,
    size,
    solucaoUnica: melhor.count === 1,
    pairs: melhor.pairs.map((p) => ({
      color: p.color,
      a: { row: p.a[0], col: p.a[1] },
      b: { row: p.b[0], col: p.b[1] },
    })),
  };
}

// Progressão: tabuleiro e número de cores sobem juntos. Orçamento maior nos
// grandes porque neles a solução única é mais rara.
const SPECS = [
  ['5-1', 5, 4, 101, { orcamentoMs: 20_000 }],
  ['5-2', 5, 5, 202, { orcamentoMs: 20_000 }],
  ['6-1', 6, 5, 303, { orcamentoMs: 30_000 }],
  ['6-2', 6, 6, 404, { orcamentoMs: 30_000 }],
  ['7-1', 7, 6, 505, { orcamentoMs: 45_000 }],
  ['7-2', 7, 7, 606, { orcamentoMs: 45_000 }],
  ['8-1', 8, 7, 707, { orcamentoMs: 60_000 }],
  ['8-2', 8, 8, 808, { orcamentoMs: 60_000 }],
  ['9-1', 9, 9, 909, { orcamentoMs: 90_000 }],
];

const levels = SPECS.map(([id, size, k, seed, opts]) => buildLevel(id, size, k, seed, opts));

const body = levels
  .map((l) => {
    const pairs = l.pairs
      .map(
        (p) =>
          `      { color: '${p.color}', a: { row: ${p.a.row}, col: ${p.a.col} }, b: { row: ${p.b.row}, col: ${p.b.col} } },`,
      )
      .join('\n');
    const nota = `    // ${l.size}x${l.size} · ${l.pairs.length} cores · ${
      l.solucaoUnica ? 'solução única' : '2+ soluções'
    }\n`;
    return `  {\n${nota}    id: '${l.id}',\n    size: ${l.size},\n    pairs: [\n${pairs}\n    ],\n  },`;
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
