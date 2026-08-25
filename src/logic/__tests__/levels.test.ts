import { createInitialState, isSolved } from '../engine';
import { cellKey, isInside } from '../grid';
import { LEVELS, levelById } from '../levels';
import { solve } from '../solver';
import type { Cell, Level } from '../types';

/**
 * Estes testes são a rede de segurança do conteúdo do jogo. Um nível sem
 * solução é o pior defeito possível aqui: o jogador tenta, não consegue, e
 * conclui que o problema é ele. O gerador já garante solubilidade por
 * construção — isto confere de novo, por um caminho independente.
 */

function eachCell(level: Level, fn: (c: Cell) => void) {
  for (let r = 0; r < level.size; r++) {
    for (let c = 0; c < level.size; c++) fn({ row: r, col: c });
  }
}

describe('catálogo de níveis', () => {
  it('não está vazio', () => {
    expect(LEVELS.length).toBeGreaterThan(0);
  });

  it('tem ids únicos', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('acha nível por id e devolve undefined pro que não existe', () => {
    expect(levelById(LEVELS[0].id)).toBe(LEVELS[0]);
    expect(levelById('nao-existe')).toBeUndefined();
  });
});

describe.each(LEVELS.map((l) => [l.id, l] as const))('nível %s', (_id, level) => {
  it('tem pelo menos dois pares', () => {
    expect(level.pairs.length).toBeGreaterThanOrEqual(2);
  });

  it('usa cores distintas', () => {
    const colors = level.pairs.map((p) => p.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('mantém todos os pontos dentro do tabuleiro', () => {
    for (const pair of level.pairs) {
      expect(isInside(level, pair.a)).toBe(true);
      expect(isInside(level, pair.b)).toBe(true);
    }
  });

  it('não repete célula entre pontos fixos', () => {
    const keys: string[] = [];
    for (const pair of level.pairs) {
      keys.push(cellKey(pair.a), cellKey(pair.b));
    }
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('não tem par com as duas pontas coladas', () => {
    for (const pair of level.pairs) {
      const dist = Math.abs(pair.a.row - pair.b.row) + Math.abs(pair.a.col - pair.b.col);
      expect(dist).toBeGreaterThanOrEqual(2);
    }
  });

  it('tem solução que cobre o tabuleiro inteiro', () => {
    const result = solve(level);
    expect(result.solved).toBe(true);

    // A solução do solver precisa mesmo fechar o nível segundo o motor do jogo.
    const covered = new Set<string>();
    for (const color of Object.keys(result.paths)) {
      for (const cell of result.paths[color]) covered.add(cellKey(cell));
    }
    let expected = 0;
    eachCell(level, () => expected++);
    expect(covered.size).toBe(expected);
  });

  it('começa não resolvido', () => {
    expect(isSolved(createInitialState(level))).toBe(false);
  });
});
