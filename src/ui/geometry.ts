import type { Cell } from '@/logic/types';

/**
 * Conversões entre o dedo e a grade. Puro de propósito: é a única parte da
 * interface que dá para testar sem renderizar nada, e é justamente onde um erro
 * de meio pixel vira "o traço não acompanha o dedo".
 */

/** Célula sob o ponto tocado, ou null quando o dedo saiu do tabuleiro. */
export function pointToCell(
  x: number,
  y: number,
  cellSize: number,
  size: number,
  // Zona morta na borda da célula. Sem ela, arrastar em diagonal encosta de
  // raspão na célula vizinha e o caminho ganha degraus que o jogador não pediu.
  margin = 0.18,
): Cell | null {
  if (cellSize <= 0) return null;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  if (row < 0 || col < 0 || row >= size || col >= size) return null;

  const fx = x / cellSize - col;
  const fy = y / cellSize - row;
  if (fx < margin || fx > 1 - margin || fy < margin || fy > 1 - margin) return null;

  return { row, col };
}

/**
 * Caminho ortogonal de `from` até `to`, sem incluir `from`.
 *
 * O dedo anda mais rápido do que os eventos chegam: num arrasto ligeiro o
 * evento seguinte pode cair a três células de distância. O motor só aceita
 * vizinhas, então a interface preenche o meio. Anda primeiro na linha e depois
 * na coluna — é um caminho qualquer, e o motor recusa sozinho o que não valer.
 */
export function stepsBetween(from: Cell, to: Cell): Cell[] {
  const steps: Cell[] = [];
  let { row, col } = from;

  while (row !== to.row) {
    row += to.row > row ? 1 : -1;
    steps.push({ row, col });
  }
  while (col !== to.col) {
    col += to.col > col ? 1 : -1;
    steps.push({ row, col });
  }

  return steps;
}

/** Centro da célula em pixels, relativo ao canto do tabuleiro. */
export function cellCenter(cell: Cell, cellSize: number): { x: number; y: number } {
  return { x: (cell.col + 0.5) * cellSize, y: (cell.row + 0.5) * cellSize };
}
