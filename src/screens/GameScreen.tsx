import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Board } from '@/components/Board';
import {
  beginStroke,
  createInitialState,
  endStroke,
  extendStroke,
  fillRatio,
  isSolved,
  resetLevel,
} from '@/logic/engine';
import type { Cell, Level } from '@/logic/types';
import { theme } from '@/themes/theme';
import { fontSize, radius, spacing } from '@/themes/tokens';

interface Props {
  level: Level;
  levelNumber: number;
  bestMoves: number | null;
  onBack: () => void;
  onSolved: (moves: number) => void;
  onNext: () => void;
  hasNext: boolean;
}

export function GameScreen({
  level,
  levelNumber,
  bestMoves,
  onBack,
  onSolved,
  onNext,
  hasNext,
}: Props) {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - spacing.xl * 2, 420);

  const [state, setState] = useState(() => createInitialState(level));
  const solved = isSolved(state);

  // Recomeça do zero quando o nível muda.
  useEffect(() => {
    setState(createInitialState(level));
  }, [level]);

  // Avisa o app UMA vez por conclusão, mesmo que o componente re-renderize.
  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (solved && reported.current !== level.id) {
      reported.current = level.id;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onSolved(state.moves);
    }
    if (!solved && reported.current === level.id) reported.current = null;
  }, [solved, level.id, state.moves, onSolved]);

  const handleTouch = useCallback((cell: Cell) => {
    setState((s) => beginStroke(s, cell));
  }, []);

  const handleMove = useCallback((cell: Cell) => {
    setState((s) => extendStroke(s, cell));
  }, []);

  const handleRelease = useCallback(() => {
    setState((s) => endStroke(s));
  }, []);

  const percent = Math.round(fillRatio(state) * 100);

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Níveis</Text>
        </Pressable>
        <Text style={styles.title}>Nível {levelNumber}</Text>
        <Text style={styles.meta}>
          {level.size}×{level.size}
        </Text>
      </View>

      <View style={styles.hud}>
        <Text style={styles.hudItem}>
          <Text style={styles.hudValue}>{state.moves}</Text> movimentos
        </Text>
        <Text style={styles.hudItem}>
          {bestMoves === null ? 'sem recorde' : `recorde ${bestMoves}`}
        </Text>
      </View>

      <Board
        state={state}
        size={boardSize}
        onTouchCell={handleTouch}
        onTouchMoveCell={handleMove}
        onRelease={handleRelease}
      />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{percent}% preenchido</Text>

      {solved ? (
        <View style={styles.actions}>
          <Text style={styles.solved}>Nível completo</Text>
          {hasNext ? (
            <Pressable style={styles.primary} onPress={onNext}>
              <Text style={styles.primaryText}>Próximo nível</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.primary} onPress={onBack}>
              <Text style={styles.primaryText}>Voltar aos níveis</Text>
            </Pressable>
          )}
          <Pressable style={styles.ghost} onPress={() => setState(resetLevel(state))}>
            <Text style={styles.ghostText}>Refazer com menos movimentos</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.ghost} onPress={() => setState(resetLevel(state))}>
            <Text style={styles.ghostText}>Reiniciar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  back: { color: theme.textDim, fontSize: fontSize.md },
  title: { color: theme.text, fontSize: fontSize.lg, fontWeight: '700' },
  meta: { color: theme.textDim, fontSize: fontSize.sm },
  hud: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  hudItem: { color: theme.textDim, fontSize: fontSize.sm },
  hudValue: { color: theme.accent, fontWeight: '700' },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: theme.surface,
    borderRadius: radius.full,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: theme.accent },
  progressLabel: {
    color: theme.textDim,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  actions: { width: '100%', marginTop: spacing.xl, alignItems: 'center' },
  solved: {
    color: theme.accent,
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  primary: {
    width: '100%',
    backgroundColor: theme.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  primaryText: { color: theme.onAccent, fontSize: fontSize.md, fontWeight: '700' },
  ghost: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.line,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ghostText: { color: theme.text, fontSize: fontSize.sm },
});
