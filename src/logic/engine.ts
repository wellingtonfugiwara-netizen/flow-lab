import {
  areAdjacent,
  cellKey,
  colorsOf,
  endpointAt,
  isEndpointOf,
  isInside,
  partnerEndpoint,
  sameCell,
  totalCells,
} from './grid';
import type { Cell, ColorId, GameState, Level, Occupant, Path, Paths } from './types';

export function createInitialState(level: Level): GameState {
  const paths: Record<ColorId, Path> = {};
  for (const color of colorsOf(level)) paths[color] = [];
  return { level, paths, activeColor: null, moves: 0 };
}

/** Quem ocupa a célula, se alguém. Pontos fixos só contam quando já ligados. */
export function occupantAt(state: GameState, cell: Cell): Occupant | null {
  for (const color of Object.keys(state.paths)) {
    const path = state.paths[color];
    for (let i = 0; i < path.length; i++) {
      if (sameCell(path[i], cell)) return { color, index: i };
    }
  }
  return null;
}

/** Caminho fechado: liga os dois pontos fixos da sua cor. */
export function isPairComplete(state: GameState, color: ColorId): boolean {
  const path = state.paths[color];
  if (path.length < 2) return false;
  const first = path[0];
  const last = path[path.length - 1];
  const pair = endpointAt(state.level, first);
  if (!pair || pair.color !== color) return false;
  return sameCell(last, partnerEndpoint(pair, first));
}

export function filledCount(state: GameState): number {
  const seen = new Set<string>();
  for (const color of Object.keys(state.paths)) {
    for (const cell of state.paths[color]) seen.add(cellKey(cell));
  }
  return seen.size;
}

/**
 * Nível resolvido exige as DUAS condições: todo par ligado e nenhuma célula
 * vazia. Ligar todos os pares deixando buraco no tabuleiro não conta.
 */
export function isSolved(state: GameState): boolean {
  const everyPairDone = colorsOf(state.level).every((c) => isPairComplete(state, c));
  return everyPairDone && filledCount(state) === totalCells(state.level);
}

function withPath(state: GameState, color: ColorId, path: Path): Paths {
  return { ...state.paths, [color]: path };
}

/**
 * Encosta o dedo. Só acontece algo em ponto fixo ou em cima de caminho já
 * desenhado — tocar célula vazia não começa nada, porque não haveria cor.
 */
export function beginStroke(state: GameState, cell: Cell): GameState {
  if (!isInside(state.level, cell)) return state;

  const pair = endpointAt(state.level, cell);
  if (pair) {
    // Recomeça a cor a partir do ponto tocado, descartando o traço anterior.
    return {
      ...state,
      paths: withPath(state, pair.color, [cell]),
      activeColor: pair.color,
    };
  }

  const occupant = occupantAt(state, cell);
  if (occupant) {
    // Retoma de onde o dedo encostou, jogando fora o resto do traço.
    const truncated = state.paths[occupant.color].slice(0, occupant.index + 1);
    return {
      ...state,
      paths: withPath(state, occupant.color, truncated),
      activeColor: occupant.color,
    };
  }

  return state;
}

/**
 * Arrasta o dedo para a célula vizinha. Devolve o estado inalterado quando o
 * movimento é inválido — assim o gesto pode chamar isto a cada quadro sem
 * precisar validar antes.
 */
export function extendStroke(state: GameState, cell: Cell): GameState {
  const color = state.activeColor;
  if (color === null) return state;
  if (!isInside(state.level, cell)) return state;

  const path = state.paths[color];
  if (path.length === 0) return state;

  const head = path[path.length - 1];
  if (sameCell(head, cell)) return state;
  if (!areAdjacent(head, cell)) return state;

  // Voltar sobre o próprio rastro encurta o caminho em vez de duplicá-lo.
  const ownIndex = path.findIndex((c) => sameCell(c, cell));
  if (ownIndex !== -1) {
    return { ...state, paths: withPath(state, color, path.slice(0, ownIndex + 1)) };
  }

  // Caminho já fechado não cresce mais; para continuar é preciso reiniciar.
  if (isPairComplete(state, color)) return state;

  // Ponto fixo alheio é intransponível.
  const pairHere = endpointAt(state.level, cell);
  if (pairHere && pairHere.color !== color) return state;

  let paths = state.paths;

  // Cruzar caminho de outra cor corta o dela a partir do ponto invadido.
  const occupant = occupantAt(state, cell);
  if (occupant && occupant.color !== color) {
    const cut = paths[occupant.color].slice(0, occupant.index);
    paths = { ...paths, [occupant.color]: cut };
  }

  return { ...state, paths: { ...paths, [color]: [...path, cell] } };
}

/** Levanta o dedo. Conta movimento só quando o traço saiu do lugar. */
export function endStroke(state: GameState): GameState {
  if (state.activeColor === null) return state;
  const drew = state.paths[state.activeColor].length > 1;
  return { ...state, activeColor: null, moves: drew ? state.moves + 1 : state.moves };
}

/** Apaga o traço de uma cor. */
export function clearColor(state: GameState, color: ColorId): GameState {
  if (!(color in state.paths)) return state;
  return { ...state, paths: withPath(state, color, []) };
}

export function resetLevel(state: GameState): GameState {
  return createInitialState(state.level);
}

/** Progresso de preenchimento, de 0 a 1 — é o número que a HUD mostra. */
export function fillRatio(state: GameState): number {
  return filledCount(state) / totalCells(state.level);
}

export function isEndpoint(level: Level, color: ColorId, cell: Cell): boolean {
  return isEndpointOf(level, color, cell);
}
