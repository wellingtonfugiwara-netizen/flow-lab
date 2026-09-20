import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Progresso do jogador: quais níveis fecharam e em quantos movimentos.
 *
 * Único ponto de acesso ao AsyncStorage — mesma política do Sudoku Lab. Nada de
 * `AsyncStorage` solto em tela. Ler nunca lança: aparelho com armazenamento
 * cheio ou dado corrompido devolve progresso vazio, e o jogo abre.
 */

const KEY = 'flowlab:progress:v1';

/** Nível resolvido → menor número de movimentos já feito nele. */
export type Progress = Readonly<Record<string, number>>;

export const EMPTY: Progress = {};

/** Aceita só o formato esperado; qualquer outra coisa vira progresso vazio. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return EMPTY;
    const out: Record<string, number> = {};
    for (const [id, moves] of Object.entries(parsed)) {
      if (typeof moves === 'number' && Number.isFinite(moves) && moves >= 0) out[id] = moves;
    }
    return out;
  } catch {
    return EMPTY;
  }
}

/** Guarda o resultado só quando ele é melhor do que o que já estava lá. */
export function withResult(progress: Progress, levelId: string, moves: number): Progress {
  const best = progress[levelId];
  if (best !== undefined && best <= moves) return progress;
  return { ...progress, [levelId]: moves };
}

export async function loadProgress(): Promise<Progress> {
  try {
    return parseProgress(await AsyncStorage.getItem(KEY));
  } catch {
    return EMPTY;
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Perder o recorde é ruim; travar o jogo por causa disso é pior.
  }
}
