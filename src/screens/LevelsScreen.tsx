import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LEVELS } from '@/logic/levels';
import type { Level } from '@/logic/types';
import type { Progress } from '@/storage/progress';
import { pathColor, theme } from '@/themes/theme';
import { fontSize, radius, spacing } from '@/themes/tokens';

interface Props {
  progress: Progress;
  onPick: (level: Level) => void;
}

export default function LevelsScreen({ progress, onPick }: Props) {
  const sizes = [...new Set(LEVELS.map((l) => l.size))];
  const done = LEVELS.filter((l) => progress[l.id] !== undefined).length;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.brand}>FLOW LAB</Text>
      <Text style={styles.sub}>
        {done} de {LEVELS.length} níveis fechados
      </Text>

      {sizes.map((size) => (
        <Fragment key={size}>
          <Text style={styles.group}>
            {size}×{size}
          </Text>
          <View style={styles.grid}>
            {LEVELS.filter((l) => l.size === size).map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                best={progress[level.id]}
                onPress={() => onPick(level)}
              />
            ))}
          </View>
        </Fragment>
      ))}
    </ScrollView>
  );
}

function LevelCard({ level, best, onPress }: { level: Level; best?: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Nível ${level.id}${best === undefined ? '' : `, fechado em ${best} movimentos`}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.dots}>
        {level.pairs.map((p) => (
          <View key={p.color} style={[styles.dot, { backgroundColor: pathColor(p.color) }]} />
        ))}
      </View>
      <Text style={styles.cardId}>{level.id}</Text>
      <Text style={styles.cardBest}>
        {level.pairs.length} cores{best === undefined ? '' : ` · ✓ ${best}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  brand: {
    color: theme.text,
    fontSize: fontSize.display,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sub: {
    color: theme.textDim,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  group: {
    color: theme.textDim,
    fontSize: fontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: 96,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    gap: spacing.xs,
  },
  cardPressed: {
    backgroundColor: theme.surfaceAlt,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  cardId: {
    color: theme.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  cardBest: {
    color: theme.textDim,
    fontSize: fontSize.xs,
  },
});
