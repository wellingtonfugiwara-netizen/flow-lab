import type { Level } from './types';

/**
 * Progresso do jogador. Funções puras — a gravação em disco fica em
 * `src/storage/`, para que a regra possa ser testada sem mexer em I/O.
 */

export interface LevelRecord {
  /** Menor número de traços com que o nível já foi fechado. */
  readonly bestMoves: number;
}

export type Progress = Readonly<Record<string, LevelRecord>>;

export const EMPTY_PROGRESS: Progress = {};

export function isCompleted(progress: Progress, levelId: string): boolean {
  return levelId in progress;
}

export function bestMoves(progress: Progress, levelId: string): number | null {
  return progress[levelId]?.bestMoves ?? null;
}

/**
 * Registra a conclusão. Só substitui o recorde quando o novo resultado é
 * melhor — refazer um nível com desempenho pior não deve apagar o recorde.
 */
export function recordCompletion(progress: Progress, levelId: string, moves: number): Progress {
  const current = progress[levelId];
  if (current && current.bestMoves <= moves) return progress;
  return { ...progress, [levelId]: { bestMoves: moves } };
}

export function completedCount(progress: Progress): number {
  return Object.keys(progress).length;
}

/**
 * Um nível está liberado quando é o primeiro ou quando o anterior já foi
 * vencido. Evita que alguém caia direto num 7x7 sem ter pegado o jeito.
 */
export function isUnlocked(levels: readonly Level[], progress: Progress, index: number): boolean {
  if (index <= 0) return true;
  const previous = levels[index - 1];
  return previous !== undefined && isCompleted(progress, previous.id);
}

/** Índice do próximo nível a jogar — o primeiro ainda não vencido. */
export function nextLevelIndex(levels: readonly Level[], progress: Progress): number {
  const index = levels.findIndex((l) => !isCompleted(progress, l.id));
  return index === -1 ? levels.length - 1 : index;
}
