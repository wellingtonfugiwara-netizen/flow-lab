// GERADO POR scripts/gen-levels.js — não editar à mão.
//
// Cada nível nasce de um caminho que cobre o tabuleiro inteiro, cortado em
// pedaços. Isso garante que existe solução. Rode o gerador de novo para
// regenerar; a semente é fixa, então o resultado é sempre o mesmo.

import type { Level } from './types';

export const LEVELS: readonly Level[] = [
  {
    // 5x5 · 4 cores · solução única
    id: '5-1',
    size: 5,
    pairs: [
      { color: 'rose', a: { row: 2, col: 4 }, b: { row: 1, col: 1 } },
      { color: 'mint', a: { row: 1, col: 2 }, b: { row: 4, col: 4 } },
      { color: 'sky', a: { row: 4, col: 3 }, b: { row: 3, col: 1 } },
      { color: 'amber', a: { row: 4, col: 1 }, b: { row: 0, col: 0 } },
    ],
  },
  {
    // 5x5 · 5 cores · solução única
    id: '5-2',
    size: 5,
    pairs: [
      { color: 'rose', a: { row: 3, col: 1 }, b: { row: 2, col: 0 } },
      { color: 'mint', a: { row: 2, col: 1 }, b: { row: 0, col: 1 } },
      { color: 'sky', a: { row: 0, col: 2 }, b: { row: 2, col: 4 } },
      { color: 'amber', a: { row: 3, col: 4 }, b: { row: 2, col: 3 } },
      { color: 'violet', a: { row: 1, col: 3 }, b: { row: 4, col: 2 } },
    ],
  },
  {
    // 6x6 · 5 cores · solução única
    id: '6-1',
    size: 6,
    pairs: [
      { color: 'rose', a: { row: 3, col: 5 }, b: { row: 2, col: 3 } },
      { color: 'mint', a: { row: 3, col: 3 }, b: { row: 5, col: 5 } },
      { color: 'sky', a: { row: 5, col: 4 }, b: { row: 4, col: 1 } },
      { color: 'amber', a: { row: 3, col: 1 }, b: { row: 1, col: 1 } },
      { color: 'violet', a: { row: 2, col: 1 }, b: { row: 0, col: 5 } },
    ],
  },
  {
    // 6x6 · 6 cores · solução única
    id: '6-2',
    size: 6,
    pairs: [
      { color: 'rose', a: { row: 3, col: 1 }, b: { row: 1, col: 0 } },
      { color: 'mint', a: { row: 2, col: 0 }, b: { row: 4, col: 1 } },
      { color: 'sky', a: { row: 4, col: 2 }, b: { row: 1, col: 2 } },
      { color: 'amber', a: { row: 0, col: 2 }, b: { row: 1, col: 4 } },
      { color: 'violet', a: { row: 2, col: 4 }, b: { row: 5, col: 4 } },
      { color: 'coral', a: { row: 4, col: 4 }, b: { row: 5, col: 2 } },
    ],
  },
  {
    // 7x7 · 6 cores · 2+ soluções
    id: '7-1',
    size: 7,
    pairs: [
      { color: 'rose', a: { row: 0, col: 4 }, b: { row: 2, col: 4 } },
      { color: 'mint', a: { row: 3, col: 4 }, b: { row: 0, col: 2 } },
      { color: 'sky', a: { row: 0, col: 1 }, b: { row: 3, col: 1 } },
      { color: 'amber', a: { row: 2, col: 1 }, b: { row: 5, col: 1 } },
      { color: 'violet', a: { row: 5, col: 0 }, b: { row: 6, col: 6 } },
      { color: 'coral', a: { row: 5, col: 6 }, b: { row: 5, col: 3 } },
    ],
  },
  {
    // 7x7 · 7 cores · solução única
    id: '7-2',
    size: 7,
    pairs: [
      { color: 'rose', a: { row: 3, col: 1 }, b: { row: 5, col: 5 } },
      { color: 'mint', a: { row: 5, col: 6 }, b: { row: 5, col: 2 } },
      { color: 'sky', a: { row: 5, col: 1 }, b: { row: 2, col: 0 } },
      { color: 'amber', a: { row: 2, col: 1 }, b: { row: 1, col: 2 } },
      { color: 'violet', a: { row: 2, col: 2 }, b: { row: 4, col: 6 } },
      { color: 'coral', a: { row: 3, col: 6 }, b: { row: 1, col: 4 } },
      { color: 'lime', a: { row: 0, col: 4 }, b: { row: 3, col: 5 } },
    ],
  },
  {
    // 8x8 · 7 cores · 2+ soluções
    id: '8-1',
    size: 8,
    pairs: [
      { color: 'rose', a: { row: 6, col: 6 }, b: { row: 7, col: 4 } },
      { color: 'mint', a: { row: 6, col: 4 }, b: { row: 2, col: 2 } },
      { color: 'sky', a: { row: 2, col: 1 }, b: { row: 3, col: 6 } },
      { color: 'amber', a: { row: 3, col: 7 }, b: { row: 0, col: 2 } },
      { color: 'violet', a: { row: 0, col: 1 }, b: { row: 3, col: 4 } },
      { color: 'coral', a: { row: 4, col: 4 }, b: { row: 5, col: 1 } },
      { color: 'lime', a: { row: 4, col: 1 }, b: { row: 6, col: 3 } },
    ],
  },
  {
    // 8x8 · 8 cores · 2+ soluções
    id: '8-2',
    size: 8,
    pairs: [
      { color: 'rose', a: { row: 1, col: 7 }, b: { row: 3, col: 6 } },
      { color: 'mint', a: { row: 4, col: 6 }, b: { row: 7, col: 6 } },
      { color: 'sky', a: { row: 7, col: 5 }, b: { row: 4, col: 3 } },
      { color: 'amber', a: { row: 3, col: 3 }, b: { row: 1, col: 4 } },
      { color: 'violet', a: { row: 2, col: 4 }, b: { row: 2, col: 1 } },
      { color: 'coral', a: { row: 1, col: 1 }, b: { row: 3, col: 2 } },
      { color: 'lime', a: { row: 4, col: 2 }, b: { row: 6, col: 3 } },
      { color: 'teal', a: { row: 6, col: 2 }, b: { row: 7, col: 4 } },
    ],
  },
  {
    // 9x9 · 9 cores · 2+ soluções
    id: '9-1',
    size: 9,
    pairs: [
      { color: 'rose', a: { row: 8, col: 6 }, b: { row: 8, col: 2 } },
      { color: 'mint', a: { row: 8, col: 1 }, b: { row: 5, col: 2 } },
      { color: 'sky', a: { row: 4, col: 2 }, b: { row: 1, col: 1 } },
      { color: 'amber', a: { row: 1, col: 2 }, b: { row: 1, col: 8 } },
      { color: 'violet', a: { row: 1, col: 7 }, b: { row: 4, col: 8 } },
      { color: 'coral', a: { row: 5, col: 8 }, b: { row: 5, col: 6 } },
      { color: 'lime', a: { row: 5, col: 5 }, b: { row: 5, col: 3 } },
      { color: 'teal', a: { row: 4, col: 3 }, b: { row: 3, col: 4 } },
      { color: 'orange', a: { row: 3, col: 3 }, b: { row: 1, col: 3 } },
    ],
  },
] as const;

export function levelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
