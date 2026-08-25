import { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import type { Cell, GameState } from '@/logic/types';
import { pathColor, theme } from '@/themes/theme';
import { radius } from '@/themes/tokens';

interface Props {
  state: GameState;
  /** Lado do tabuleiro em pixels. O componente é quadrado. */
  size: number;
  onTouchCell: (cell: Cell) => void;
  onTouchMoveCell: (cell: Cell) => void;
  onRelease: () => void;
}

/**
 * Desenha o tabuleiro e traduz o gesto em células.
 *
 * O traço é desenhado como retângulos ligando centro a centro, e não como um
 * quadrado por célula: assim a linha fica contínua nas curvas, sem os degraus
 * que apareceriam se cada célula fosse pintada isoladamente.
 */
export function Board({ state, size, onTouchCell, onTouchMoveCell, onRelease }: Props) {
  const n = state.level.size;
  const cell = size / n;
  const stroke = cell * 0.34;
  const dot = cell * 0.56;

  // Guarda a última célula visitada para não disparar um evento por pixel.
  const lastCell = useRef<string | null>(null);

  const toCell = (x: number, y: number): Cell | null => {
    const col = Math.floor(x / cell);
    const row = Math.floor(y / cell);
    if (row < 0 || col < 0 || row >= n || col >= n) return null;
    return { row, col };
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const c = toCell(e.nativeEvent.locationX, e.nativeEvent.locationY);
          if (!c) return;
          lastCell.current = `${c.row},${c.col}`;
          onTouchCell(c);
        },
        onPanResponderMove: (e) => {
          const c = toCell(e.nativeEvent.locationX, e.nativeEvent.locationY);
          if (!c) return;
          const key = `${c.row},${c.col}`;
          if (key === lastCell.current) return;
          lastCell.current = key;
          onTouchMoveCell(c);
        },
        onPanResponderRelease: () => {
          lastCell.current = null;
          onRelease();
        },
        onPanResponderTerminate: () => {
          lastCell.current = null;
          onRelease();
        },
      }),
    // Recria quando muda o tamanho da célula — o fechamento captura `cell`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cell, n],
  );

  const center = (index: number) => index * cell + cell / 2;

  // Segmentos do traço: um retângulo por par de células vizinhas.
  const segments = useMemo(() => {
    const out: { key: string; style: object }[] = [];
    for (const color of Object.keys(state.paths)) {
      const path = state.paths[color];
      const tint = pathColor(color);
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];
        const ax = center(a.col);
        const ay = center(a.row);
        const bx = center(b.col);
        const by = center(b.row);
        const horizontal = ay === by;
        out.push({
          key: `${color}-${i}`,
          style: {
            position: 'absolute' as const,
            backgroundColor: tint,
            borderRadius: stroke / 2,
            left: horizontal ? Math.min(ax, bx) - stroke / 2 : ax - stroke / 2,
            top: horizontal ? ay - stroke / 2 : Math.min(ay, by) - stroke / 2,
            width: horizontal ? Math.abs(bx - ax) + stroke : stroke,
            height: horizontal ? stroke : Math.abs(by - ay) + stroke,
          },
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.paths, cell, stroke]);

  return (
    <View style={[styles.board, { width: size, height: size }]} {...pan.panHandlers}>
      {/* Casas vazias, só para dar a grade. */}
      {Array.from({ length: n * n }, (_, i) => {
        const row = Math.floor(i / n);
        const col = i % n;
        return (
          <View
            key={`c-${i}`}
            style={{
              position: 'absolute',
              left: col * cell + 1,
              top: row * cell + 1,
              width: cell - 2,
              height: cell - 2,
              borderRadius: radius.sm,
              backgroundColor: theme.cell,
            }}
          />
        );
      })}

      {segments.map((s) => (
        <View key={s.key} style={s.style} pointerEvents="none" />
      ))}

      {/* Pontos fixos por cima do traço, para continuarem visíveis. */}
      {state.level.pairs.flatMap((pair) =>
        [pair.a, pair.b].map((c, i) => (
          <View
            key={`${pair.color}-e${i}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: center(c.col) - dot / 2,
              top: center(c.row) - dot / 2,
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: pathColor(pair.color),
            }}
          />
        )),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderRadius: radius.lg,
    backgroundColor: theme.bg,
  },
});
