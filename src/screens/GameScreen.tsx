import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import Board from '@/components/Board';
import Button from '@/components/Button';
import Hud from '@/components/Hud';
import {
  beginStroke,
  createInitialState,
  endStroke,
  extendStroke,
  fillRatio,
  isPairComplete,
  isSolved,
  resetLevel,
} from '@/logic/engine';
import type { Cell, Level } from '@/logic/types';
import { theme } from '@/themes/theme';
import { fontSize, radius, spacing } from '@/themes/tokens';
import { stepsBetween } from '@/ui/geometry';

interface Props {
  level: Level;
  bestMoves?: number;
  hasNext: boolean;
  onSolved: (levelId: string, moves: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GameScreen({ level, bestMoves, hasNext, onSolved, onNext, onBack }: Props) {
  const [state, setState] = useState(() => createInitialState(level));
  const { width, height } = useWindowDimensions();

  const solved = isSolved(state);
  useEffect(() => {
    if (solved) onSolved(level.id, state.moves);
  }, [solved, level.id, state.moves, onSolved]);

  const onBegin = useCallback((cell: Cell) => setState((s) => beginStroke(s, cell)), []);

  // O dedo corre mais que os eventos do gesto: entre dois avisos ele pode ter
  // pulado três células. Andar da ponta ATUAL até onde o dedo está — dentro do
  // próprio setState, com o estado mais recente — é o que impede o traço de
  // falhar no arrasto rápido. Fazer essa conta no componente leria a ponta do
  // render anterior, que em gesto ligeiro já está velha.
  const onExtend = useCallback(
    (cell: Cell) =>
      setState((s) => {
        if (!s.activeColor) return s;
        const path = s.paths[s.activeColor];
        if (path.length === 0) return s;
        let next = s;
        for (const step of stepsBetween(path[path.length - 1], cell)) {
          next = extendStroke(next, step);
        }
        return next;
      }),
    [],
  );
  const onEnd = useCallback(() => setState((s) => endStroke(s)), []);
  const onReset = useCallback(() => setState((s) => resetLevel(s)), []);

  const pairsDone = useMemo(
    () => level.pairs.filter((p) => isPairComplete(state, p.color)).length,
    [level.pairs, state],
  );

  // O tabuleiro é quadrado e não pode estourar nem a largura nem a altura —
  // em tela baixa o que sobra é a altura, não a largura.
  const boardSize = Math.floor(Math.min(width - spacing.lg * 2, height * 0.56));

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" hitSlop={spacing.md}>
          <Text style={styles.back}>‹ Níveis</Text>
        </Pressable>
        <Text style={styles.title}>
          Nível {level.id} · {level.size}×{level.size}
        </Text>
        <Text style={styles.best}>{bestMoves === undefined ? '' : `recorde ${bestMoves}`}</Text>
      </View>

      <Hud
        pairsDone={pairsDone}
        pairsTotal={level.pairs.length}
        fillPercent={Math.round(fillRatio(state) * 100)}
        moves={state.moves}
      />

      <Board state={state} size={boardSize} onBegin={onBegin} onExtend={onExtend} onEnd={onEnd} />

      {solved ? (
        <View style={styles.done}>
          <Text style={styles.doneTitle}>Nível fechado</Text>
          <Text style={styles.doneSub}>
            {state.moves} {state.moves === 1 ? 'movimento' : 'movimentos'}
            {bestMoves !== undefined && bestMoves < state.moves ? ` · recorde ${bestMoves}` : ''}
          </Text>
          <View style={styles.actions}>
            <Button label="Refazer" onPress={onReset} />
            {hasNext ? <Button label="Próximo" onPress={onNext} variant="primary" /> : null}
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <Button label="Reiniciar" onPress={onReset} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    color: theme.textDim,
    fontSize: fontSize.md,
  },
  title: {
    color: theme.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  best: {
    color: theme.textDim,
    fontSize: fontSize.xs,
    minWidth: 64,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  done: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  doneTitle: {
    color: theme.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  doneSub: {
    color: theme.textDim,
    fontSize: fontSize.sm,
  },
});
