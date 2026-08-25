// GERADO POR scripts/gen-levels.js — não editar à mão.
//
// Cada nível nasce de um caminho que cobre o tabuleiro inteiro, cortado em
// pedaços. Isso garante que existe solução. Rode o gerador de novo para
// regenerar; a semente é fixa, então o resultado é sempre o mesmo.

import type { Level } from './types';

export const LEVELS: readonly Level[] = [
  {
    id: '5-1',
    size: 5,
    pairs: [
      { color: 'rose', a: { row: 2, col: 4 }, b: { row: 0, col: 0 } },
      { color: 'mint', a: { row: 1, col: 0 }, b: { row: 4, col: 2 } },
      { color: 'sky', a: { row: 4, col: 3 }, b: { row: 3, col: 1 } },
      { color: 'amber', a: { row: 2, col: 1 }, b: { row: 1, col: 3 } },
    ],
  },
  {
    id: '5-2',
    size: 5,
    pairs: [
      { color: 'rose', a: { row: 1, col: 3 }, b: { row: 0, col: 0 } },
      { color: 'mint', a: { row: 1, col: 0 }, b: { row: 2, col: 4 } },
      { color: 'sky', a: { row: 3, col: 4 }, b: { row: 4, col: 2 } },
      { color: 'amber', a: { row: 4, col: 1 }, b: { row: 2, col: 0 } },
    ],
  },
  {
    id: '5-3',
    size: 5,
    pairs: [
      { color: 'rose', a: { row: 1, col: 3 }, b: { row: 0, col: 2 } },
      { color: 'mint', a: { row: 1, col: 2 }, b: { row: 1, col: 0 } },
      { color: 'sky', a: { row: 2, col: 0 }, b: { row: 2, col: 4 } },
      { color: 'amber', a: { row: 3, col: 4 }, b: { row: 3, col: 2 } },
      { color: 'violet', a: { row: 4, col: 2 }, b: { row: 4, col: 0 } },
    ],
  },
  {
    id: '6-1',
    size: 6,
    pairs: [
      { color: 'rose', a: { row: 2, col: 1 }, b: { row: 0, col: 2 } },
      { color: 'mint', a: { row: 0, col: 3 }, b: { row: 2, col: 3 } },
      { color: 'sky', a: { row: 2, col: 2 }, b: { row: 3, col: 1 } },
      { color: 'amber', a: { row: 3, col: 0 }, b: { row: 5, col: 4 } },
      { color: 'violet', a: { row: 5, col: 5 }, b: { row: 2, col: 4 } },
    ],
  },
  {
    id: '6-2',
    size: 6,
    pairs: [
      { color: 'rose', a: { row: 2, col: 0 }, b: { row: 0, col: 5 } },
      { color: 'mint', a: { row: 1, col: 5 }, b: { row: 4, col: 4 } },
      { color: 'sky', a: { row: 3, col: 4 }, b: { row: 4, col: 3 } },
      { color: 'amber', a: { row: 5, col: 3 }, b: { row: 1, col: 1 } },
      { color: 'violet', a: { row: 2, col: 1 }, b: { row: 4, col: 1 } },
    ],
  },
  {
    id: '7-1',
    size: 7,
    pairs: [
      { color: 'rose', a: { row: 3, col: 1 }, b: { row: 1, col: 2 } },
      { color: 'mint', a: { row: 0, col: 2 }, b: { row: 5, col: 0 } },
      { color: 'sky', a: { row: 6, col: 0 }, b: { row: 5, col: 6 } },
      { color: 'amber', a: { row: 5, col: 5 }, b: { row: 3, col: 4 } },
      { color: 'violet', a: { row: 2, col: 4 }, b: { row: 2, col: 6 } },
    ],
  },
  {
    id: '7-2',
    size: 7,
    pairs: [
      { color: 'rose', a: { row: 4, col: 6 }, b: { row: 6, col: 0 } },
      { color: 'mint', a: { row: 5, col: 0 }, b: { row: 0, col: 2 } },
      { color: 'sky', a: { row: 0, col: 3 }, b: { row: 3, col: 5 } },
      { color: 'amber', a: { row: 2, col: 5 }, b: { row: 2, col: 2 } },
      { color: 'violet', a: { row: 2, col: 3 }, b: { row: 5, col: 1 } },
      { color: 'coral', a: { row: 5, col: 2 }, b: { row: 4, col: 4 } },
    ],
  },
  {
    id: '7-3',
    size: 7,
    pairs: [
      { color: 'rose', a: { row: 4, col: 0 }, b: { row: 3, col: 1 } },
      { color: 'mint', a: { row: 4, col: 1 }, b: { row: 0, col: 4 } },
      { color: 'sky', a: { row: 0, col: 5 }, b: { row: 3, col: 3 } },
      { color: 'amber', a: { row: 4, col: 3 }, b: { row: 6, col: 2 } },
      { color: 'violet', a: { row: 6, col: 3 }, b: { row: 2, col: 6 } },
      { color: 'coral', a: { row: 2, col: 5 }, b: { row: 4, col: 4 } },
    ],
  },
] as const;

export function levelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
