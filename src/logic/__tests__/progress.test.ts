import {
  EMPTY_PROGRESS,
  bestMoves,
  completedCount,
  isCompleted,
  isUnlocked,
  nextLevelIndex,
  recordCompletion,
} from '../progress';
import type { Level } from '../types';

const mk = (id: string): Level => ({
  id,
  size: 3,
  pairs: [{ color: 'a', a: { row: 0, col: 0 }, b: { row: 2, col: 2 } }],
});

const LEVELS: Level[] = [mk('l1'), mk('l2'), mk('l3')];

describe('isCompleted e bestMoves', () => {
  it('não conhece nível nunca jogado', () => {
    expect(isCompleted(EMPTY_PROGRESS, 'l1')).toBe(false);
    expect(bestMoves(EMPTY_PROGRESS, 'l1')).toBeNull();
  });

  it('reconhece nível já vencido', () => {
    const p = recordCompletion(EMPTY_PROGRESS, 'l1', 7);
    expect(isCompleted(p, 'l1')).toBe(true);
    expect(bestMoves(p, 'l1')).toBe(7);
  });
});

describe('recordCompletion', () => {
  it('guarda o primeiro resultado', () => {
    expect(recordCompletion(EMPTY_PROGRESS, 'l1', 9).l1.bestMoves).toBe(9);
  });

  it('substitui quando o novo resultado é melhor', () => {
    let p = recordCompletion(EMPTY_PROGRESS, 'l1', 9);
    p = recordCompletion(p, 'l1', 5);
    expect(p.l1.bestMoves).toBe(5);
  });

  it('preserva o recorde quando o novo resultado é pior', () => {
    let p = recordCompletion(EMPTY_PROGRESS, 'l1', 5);
    const before = p;
    p = recordCompletion(p, 'l1', 12);
    expect(p).toBe(before);
    expect(p.l1.bestMoves).toBe(5);
  });

  it('preserva o recorde quando empata', () => {
    const p = recordCompletion(EMPTY_PROGRESS, 'l1', 5);
    expect(recordCompletion(p, 'l1', 5)).toBe(p);
  });

  it('não mexe nos outros níveis', () => {
    let p = recordCompletion(EMPTY_PROGRESS, 'l1', 4);
    p = recordCompletion(p, 'l2', 6);
    expect(completedCount(p)).toBe(2);
    expect(p.l1.bestMoves).toBe(4);
  });
});

describe('isUnlocked', () => {
  it('libera sempre o primeiro', () => {
    expect(isUnlocked(LEVELS, EMPTY_PROGRESS, 0)).toBe(true);
  });

  it('trava o seguinte enquanto o anterior não cair', () => {
    expect(isUnlocked(LEVELS, EMPTY_PROGRESS, 1)).toBe(false);
  });

  it('libera o seguinte depois de vencer o anterior', () => {
    const p = recordCompletion(EMPTY_PROGRESS, 'l1', 3);
    expect(isUnlocked(LEVELS, p, 1)).toBe(true);
    expect(isUnlocked(LEVELS, p, 2)).toBe(false);
  });

  it('trata índice fora da lista sem quebrar', () => {
    expect(isUnlocked(LEVELS, EMPTY_PROGRESS, 99)).toBe(false);
    expect(isUnlocked(LEVELS, EMPTY_PROGRESS, -1)).toBe(true);
  });
});

describe('nextLevelIndex', () => {
  it('começa no primeiro', () => {
    expect(nextLevelIndex(LEVELS, EMPTY_PROGRESS)).toBe(0);
  });

  it('pula os já vencidos', () => {
    let p = recordCompletion(EMPTY_PROGRESS, 'l1', 3);
    p = recordCompletion(p, 'l2', 3);
    expect(nextLevelIndex(LEVELS, p)).toBe(2);
  });

  it('fica no último quando tudo foi vencido', () => {
    let p = EMPTY_PROGRESS;
    for (const l of LEVELS) p = recordCompletion(p, l.id, 3);
    expect(nextLevelIndex(LEVELS, p)).toBe(2);
  });
});
