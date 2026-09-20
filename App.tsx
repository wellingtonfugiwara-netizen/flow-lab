import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar as RNStatusBar, StyleSheet } from 'react-native';

import { LEVELS } from '@/logic/levels';
import type { Level } from '@/logic/types';
import { EMPTY, loadProgress, Progress, saveProgress, withResult } from '@/storage/progress';
import GameScreen from '@/screens/GameScreen';
import LevelsScreen from '@/screens/LevelsScreen';
import { theme } from '@/themes/theme';

/**
 * São duas telas e nenhum estado compartilhado além do progresso — navegação
 * de biblioteca aqui custaria cinco dependências para resolver um `useState`.
 * Quando houver terceira tela ou link externo, aí sim vale trocar.
 */
export default function App() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [level, setLevel] = useState<Level | null>(null);

  useEffect(() => {
    void loadProgress().then(setProgress);
  }, []);

  const onSolved = useCallback((levelId: string, moves: number) => {
    setProgress((current) => {
      const next = withResult(current, levelId, moves);
      if (next !== current) void saveProgress(next);
      return next;
    });
  }, []);

  const index = level ? LEVELS.findIndex((l) => l.id === level.id) : -1;
  const next = index >= 0 ? LEVELS[index + 1] : undefined;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {level ? (
        <GameScreen
          level={level}
          bestMoves={progress[level.id]}
          hasNext={next !== undefined}
          onSolved={onSolved}
          onNext={() => next && setLevel(next)}
          onBack={() => setLevel(null)}
        />
      ) : (
        <LevelsScreen progress={progress} onPick={setLevel} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    // SafeAreaView só recua no iOS; no Android a barra de status fica por cima.
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
});
