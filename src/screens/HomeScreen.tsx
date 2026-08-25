import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LEVELS } from '@/logic/levels';
import {
  bestMoves,
  completedCount,
  isCompleted,
  isUnlocked,
  type Progress,
} from '@/logic/progress';
import { theme } from '@/themes/theme';
import { fontSize, radius, spacing } from '@/themes/tokens';

interface Props {
  progress: Progress;
  onPick: (index: number) => void;
}

export function HomeScreen({ progress, onPick }: Props) {
  const done = completedCount(progress);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>
        FLOW <Text style={styles.brandAccent}>LAB</Text>
      </Text>
      <Text style={styles.sub}>N.º 04 — NIOL</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {done}/{LEVELS.length}
          </Text>
          <Text style={styles.statKey}>Níveis</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {LEVELS[0].size}×{LEVELS[0].size}
          </Text>
          <Text style={styles.statKey}>Começa em</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Escolha um nível</Text>

      <View style={styles.grid}>
        {LEVELS.map((level, index) => {
          const unlocked = isUnlocked(LEVELS, progress, index);
          const complete = isCompleted(progress, level.id);
          const record = bestMoves(progress, level.id);

          return (
            <Pressable
              key={level.id}
              disabled={!unlocked}
              onPress={() => onPick(index)}
              style={[styles.tile, complete && styles.tileDone, !unlocked && styles.tileLocked]}
            >
              <Text style={[styles.tileNumber, complete && styles.tileNumberDone]}>
                {index + 1}
              </Text>
              <Text style={styles.tileMeta}>
                {!unlocked
                  ? 'travado'
                  : complete
                    ? `${record} mov.`
                    : `${level.size}×${level.size}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>
        Ligue cada par de cor sem cruzar os caminhos. O nível só fecha quando não sobrar espaço
        vazio.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: spacing.xl, paddingTop: spacing.xxxl + spacing.md },
  brand: { color: theme.text, fontSize: fontSize.display, fontWeight: '800', letterSpacing: 1 },
  brandAccent: { color: theme.accent },
  sub: { color: theme.textDim, fontSize: fontSize.xs, letterSpacing: 2, marginTop: spacing.xs },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { color: theme.text, fontSize: fontSize.xl, fontWeight: '800' },
  statKey: { color: theme.textDim, fontSize: fontSize.xs, marginTop: spacing.xs },
  sectionTitle: {
    color: theme.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '22%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  tileDone: { borderColor: theme.accent },
  tileLocked: { opacity: 0.32 },
  tileNumber: { color: theme.text, fontSize: fontSize.lg, fontWeight: '800' },
  tileNumberDone: { color: theme.accent },
  tileMeta: { color: theme.textDim, fontSize: 9, marginTop: 2 },
  hint: {
    color: theme.textDim,
    fontSize: fontSize.sm,
    marginTop: spacing.xxl,
    lineHeight: 20,
  },
});
