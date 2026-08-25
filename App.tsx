import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LEVELS } from '@/logic/levels';
import { bestMoves, EMPTY_PROGRESS, recordCompletion, type Progress } from '@/logic/progress';
import { GameScreen } from '@/screens/GameScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { loadProgress, saveProgress } from '@/storage/progress';
import { theme } from '@/themes/theme';

/**
 * Navegação em estado simples, sem biblioteca. São duas telas e um caminho de
 * ida e volta entre elas — trazer um roteador aqui custaria configuração
 * nativa sem entregar nada que este fluxo precise. Se surgir uma terceira tela
 * com histórico próprio, aí vale trocar.
 */
export default function App() {
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  const handleSolved = useCallback(
    (moves: number) => {
      if (playing === null) return;
      const levelId = LEVELS[playing].id;
      setProgress((current) => {
        const updated = recordCompletion(current, levelId, moves);
        if (updated !== current) void saveProgress(updated);
        return updated;
      });
    },
    [playing],
  );

  const handleNext = useCallback(() => {
    setPlaying((index) => (index !== null && index + 1 < LEVELS.length ? index + 1 : index));
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {playing === null ? (
        <HomeScreen progress={progress} onPick={setPlaying} />
      ) : (
        <GameScreen
          level={LEVELS[playing]}
          levelNumber={playing + 1}
          bestMoves={bestMoves(progress, LEVELS[playing].id)}
          hasNext={playing + 1 < LEVELS.length}
          onBack={() => setPlaying(null)}
          onSolved={handleSolved}
          onNext={handleNext}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
});
