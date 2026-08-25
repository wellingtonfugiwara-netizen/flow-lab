import { cellKey, neighbors, sameCell, totalCells } from './grid';
import type { Cell, ColorId, Level, Path } from './types';

/**
 * Solver de força bruta com poda. Não é para o jogo em si — serve para PROVAR
 * que um nível empacotado tem solução antes de ele chegar ao jogador. Nível
 * sem solução é o pior bug possível num jogo assim: o jogador não tem como
 * saber que a culpa não é dele.
 *
 * Estratégia: liga um par de cada vez, sempre pelo caminho mais restrito
 * primeiro, e poda assim que o tabuleiro fica impossível.
 */

const DEFAULT_MAX_STEPS = 2_000_000;

interface SolveResult {
  readonly solved: boolean;
  readonly paths: Record<ColorId, Path>;
  readonly steps: number;
}

export function solve(level: Level, maxSteps: number = DEFAULT_MAX_STEPS): SolveResult {
  const size = level.size;
  // occupancy[r][c] = cor que ocupa, ou null.
  const occupancy: (ColorId | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );

  const endpointKeys = new Set<string>();
  for (const pair of level.pairs) {
    endpointKeys.add(cellKey(pair.a));
    endpointKeys.add(cellKey(pair.b));
    occupancy[pair.a.row][pair.a.col] = pair.color;
    occupancy[pair.b.row][pair.b.col] = pair.color;
  }

  const result: Record<ColorId, Path> = {};
  let steps = 0;

  const at = (c: Cell): ColorId | null => occupancy[c.row][c.col];
  const isEndpoint = (c: Cell): boolean => endpointKeys.has(cellKey(c));

  /**
   * Poda barata: toda célula vazia precisa ter pelo menos dois vizinhos por
   * onde um caminho possa entrar e sair. Com menos que isso ela vira beco sem
   * saída e o tabuleiro nunca fecha 100%.
   *
   * "Acessível" é célula vazia, ponto fixo, ou a PONTA do traço em construção
   * — desta última o caminho ainda vai avançar. Esquecer a ponta torna a poda
   * incorreta: ela descartaria becos que o próprio traço em curso preencheria.
   * Célula tomada por traço já concluído não conta. A regra é deliberadamente
   * permissiva: podar de menos só custa tempo, podar de mais perde solução.
   */
  function hasStrandedCell(head: Cell): boolean {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (occupancy[r][c] !== null) continue;
        const reachable = neighbors(level, { row: r, col: c }).filter(
          (n) => at(n) === null || isEndpoint(n) || sameCell(n, head),
        ).length;
        if (reachable < 2) return true;
      }
    }
    return false;
  }

  function connect(pairIndex: number, current: Cell, path: Cell[]): boolean {
    if (steps++ > maxSteps) return false;

    const pair = level.pairs[pairIndex];
    const target = pair.b;

    if (sameCell(current, target)) {
      result[pair.color] = [...path];
      if (pairIndex === level.pairs.length - 1) {
        // Último par ligado: só vale se não sobrou célula vazia.
        return countEmpty() === 0;
      }
      const next = level.pairs[pairIndex + 1];
      if (hasStrandedCell(next.a)) return false;
      return connect(pairIndex + 1, next.a, [next.a]);
    }

    for (const n of neighbors(level, current)) {
      if (sameCell(n, target)) {
        path.push(n);
        if (connect(pairIndex, n, path)) return true;
        path.pop();
        continue;
      }
      if (at(n) !== null) continue;

      occupancy[n.row][n.col] = pair.color;
      path.push(n);
      if (!hasStrandedCell(n) && connect(pairIndex, n, path)) return true;
      path.pop();
      occupancy[n.row][n.col] = null;
    }
    return false;
  }

  function countEmpty(): number {
    let n = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) if (occupancy[r][c] === null) n++;
    }
    return n;
  }

  if (level.pairs.length === 0) {
    return { solved: totalCells(level) === 0, paths: {}, steps };
  }

  const first = level.pairs[0];
  const solved = connect(0, first.a, [first.a]);
  return { solved, paths: result, steps };
}

/** Atalho de leitura para os testes. */
export function isSolvable(level: Level, maxSteps?: number): boolean {
  return solve(level, maxSteps).solved;
}
