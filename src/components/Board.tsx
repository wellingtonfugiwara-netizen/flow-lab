import { useMemo } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { isEndpoint, isPairComplete, occupantAt } from '@/logic/engine';
import type { Cell, GameState } from '@/logic/types';
import { pathColor, theme } from '@/themes/theme';
import { radius } from '@/themes/tokens';
import { cellCenter, pointToCell } from '@/ui/geometry';

interface Props {
  state: GameState;
  /** Lado do tabuleiro em pixels. A célula sai daqui, nunca de número fixo. */
  size: number;
  onBegin: (cell: Cell) => void;
  /** Célula sob o dedo agora. Quem completa o caminho é o dono do estado. */
  onExtend: (cell: Cell) => void;
  onEnd: () => void;
}

/** Espessura do traço como fração da célula. Abaixo de ~0.3 some no tabuleiro. */
const STROKE = 0.36;
/** Diâmetro do ponto fixo como fração da célula. */
const DOT = 0.62;

export default function Board({ state, size, onBegin, onExtend, onEnd }: Props) {
  const cellSize = size / state.level.size;

  // Recriado a cada render de propósito: assim os handlers enxergam o estado
  // deste quadro. Criar uma vez e ler por ref daria o tabuleiro do primeiro
  // render, e `PanResponder.create` é barato.
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    // Segura o gesto: sem isto, a rolagem de uma tela mãe rouba o dedo no meio
    // do traço.
    onPanResponderTerminationRequest: () => false,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Margem zero no toque inicial: encostar na beirada do ponto fixo tem que
      // valer, senão o jogador acha que o jogo não respondeu.
      const cell = pointToCell(locationX, locationY, cellSize, state.level.size, 0);
      if (cell) onBegin(cell);
    },

    // Só reporta onde o dedo está. Quem sabe quais células foram puladas é
    // quem tem o estado na mão — dois eventos podem chegar antes de um render,
    // e aqui eles enxergariam a mesma ponta velha.
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const cell = pointToCell(locationX, locationY, cellSize, state.level.size);
      if (cell) onExtend(cell);
    },

    onPanResponderRelease: onEnd,
    onPanResponderTerminate: onEnd,
  });

  const stroke = cellSize * STROKE;
  const dot = cellSize * DOT;

  const grid = useMemo(() => {
    const cells = [];
    for (let row = 0; row < state.level.size; row++) {
      for (let col = 0; col < state.level.size; col++) {
        cells.push(
          <View
            key={`g${row}-${col}`}
            pointerEvents="none"
            style={[
              styles.gridCell,
              {
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize,
                height: cellSize,
              },
            ]}
          />,
        );
      }
    }
    return cells;
  }, [state.level.size, cellSize]);

  const trails = [];
  for (const color of Object.keys(state.paths)) {
    const path = state.paths[color];
    const tint = pathColor(color);

    // Uma peça quadrada e arredondada em cada célula: é ela que arredonda as
    // curvas e fecha a ponta do traço. Os retângulos entre centros só emendam.
    for (let i = 0; i < path.length; i++) {
      const { x, y } = cellCenter(path[i], cellSize);
      trails.push(
        <View
          key={`j${color}-${i}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: x - stroke / 2,
            top: y - stroke / 2,
            width: stroke,
            height: stroke,
            borderRadius: stroke / 2,
            backgroundColor: tint,
          }}
        />,
      );

      if (i === 0) continue;
      const from = cellCenter(path[i - 1], cellSize);
      const horizontal = path[i].row === path[i - 1].row;
      trails.push(
        <View
          key={`s${color}-${i}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: horizontal ? Math.min(from.x, x) : x - stroke / 2,
            top: horizontal ? y - stroke / 2 : Math.min(from.y, y),
            width: horizontal ? Math.abs(x - from.x) : stroke,
            height: horizontal ? stroke : Math.abs(y - from.y),
            backgroundColor: tint,
          }}
        />,
      );
    }
  }

  const dots = state.level.pairs.flatMap((pair) => {
    const tint = pathColor(pair.color);
    const done = isPairComplete(state, pair.color);
    return [pair.a, pair.b].map((cell, i) => {
      const { x, y } = cellCenter(cell, cellSize);
      return (
        <View
          key={`d${pair.color}-${i}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: x - dot / 2,
            top: y - dot / 2,
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: tint,
            // Par fechado ganha um miolo escuro: dá pra ver o que falta sem
            // conferir cor por cor.
            borderWidth: done ? dot * 0.18 : 0,
            borderColor: theme.bg,
          }}
        />
      );
    });
  });

  // Ponta do traço que está sendo desenhado — o jogador precisa saber de onde o
  // caminho continua quando o dedo sai da tela.
  let head = null;
  const active = state.activeColor;
  if (active) {
    const path = state.paths[active];
    const tip = path[path.length - 1];
    if (tip && !isEndpoint(state.level, active, tip) && occupantAt(state, tip)) {
      const { x, y } = cellCenter(tip, cellSize);
      const d = cellSize * 0.5;
      head = (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: x - d / 2,
            top: y - d / 2,
            width: d,
            height: d,
            borderRadius: d / 2,
            borderWidth: Math.max(2, cellSize * 0.06),
            borderColor: theme.bg,
          }}
        />
      );
    }
  }

  return (
    <View style={[styles.board, { width: size, height: size }]} {...pan.panHandlers}>
      {grid}
      {trails}
      {dots}
      {head}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: theme.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  gridCell: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.cell,
  },
});
