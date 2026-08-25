import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_PROGRESS, type Progress } from '@/logic/progress';

const KEY = 'flowlab:progress:v1';

/**
 * Camada de disco. Toda a REGRA de progresso mora em `@/logic/progress` —
 * aqui só entra ler e gravar, para que a regra continue testável sem I/O.
 *
 * Falha de leitura devolve progresso vazio em vez de estourar: perder o
 * recorde é ruim, mas não abrir o jogo é pior.
 */
export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_PROGRESS;
    return parsed as Progress;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Silencioso de propósito: gravar é melhor-esforço e não deve
    // interromper a partida em curso.
  }
}
