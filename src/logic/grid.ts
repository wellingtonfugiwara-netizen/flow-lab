import type { Cell, Level, ColorId, Pair } from './types';

/** Chave estável de célula, para usar em Set/Map. */
export function cellKey(cell: Cell): string {
  return `${cell.row},${cell.col}`;
}

export function sameCell(a: Cell, b: Cell): boolean {
  return a.row === b.row && a.col === b.col;
}

/** Vizinhança ortogonal — caminho no Flow nunca anda na diagonal. */
export function areAdjacent(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr + dc === 1;
}

export function isInside(level: Level, cell: Cell): boolean {
  return cell.row >= 0 && cell.col >= 0 && cell.row < level.size && cell.col < level.size;
}

export function neighbors(level: Level, cell: Cell): Cell[] {
  const candidates: Cell[] = [
    { row: cell.row - 1, col: cell.col },
    { row: cell.row + 1, col: cell.col },
    { row: cell.row, col: cell.col - 1 },
    { row: cell.row, col: cell.col + 1 },
  ];
  return candidates.filter((c) => isInside(level, c));
}

/**
 * Se a célula é ponto fixo, devolve o par a que pertence. Ponto fixo é
 * intocável: nenhum caminho de outra cor pode passar por cima dele.
 */
export function endpointAt(level: Level, cell: Cell): Pair | null {
  for (const pair of level.pairs) {
    if (sameCell(pair.a, cell) || sameCell(pair.b, cell)) return pair;
  }
  return null;
}

export function isEndpointOf(level: Level, color: ColorId, cell: Cell): boolean {
  const pair = endpointAt(level, cell);
  return pair !== null && pair.color === color;
}

/** O outro extremo do par — usado para saber se o caminho fechou. */
export function partnerEndpoint(pair: Pair, cell: Cell): Cell {
  return sameCell(pair.a, cell) ? pair.b : pair.a;
}

export function colorsOf(level: Level): ColorId[] {
  return level.pairs.map((p) => p.color);
}

export function totalCells(level: Level): number {
  return level.size * level.size;
}
