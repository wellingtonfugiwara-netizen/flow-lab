/**
 * Modelo de domínio do Flow Lab.
 *
 * Vocabulário: um NÍVEL tem PARES de pontos coloridos. O jogador desenha um
 * CAMINHO ligando os dois pontos de cada par. O nível fecha quando todos os
 * pares estão ligados E nenhuma célula ficou vazia — as duas condições, não só
 * a primeira. É essa segunda regra que faz o jogo ser um quebra-cabeça e não um
 * exercício de ligar pontos.
 */

/** Posição no tabuleiro. Origem no canto superior esquerdo. */
export interface Cell {
  readonly row: number;
  readonly col: number;
}

/** Identificador de cor. O valor visual mora no tema, não aqui. */
export type ColorId = string;

/** Os dois pontos fixos de uma cor. */
export interface Pair {
  readonly color: ColorId;
  readonly a: Cell;
  readonly b: Cell;
}

export interface Level {
  readonly id: string;
  /** Tabuleiro é sempre quadrado. */
  readonly size: number;
  readonly pairs: readonly Pair[];
}

/**
 * Caminho desenhado para uma cor: sequência ordenada e contígua de células,
 * começando sempre em um dos pontos do par. Vazio quer dizer "não desenhado".
 */
export type Path = readonly Cell[];

/** Caminhos por cor. Toda cor do nível tem entrada, mesmo que vazia. */
export type Paths = Readonly<Record<ColorId, Path>>;

export interface GameState {
  readonly level: Level;
  readonly paths: Paths;
  /** Cor sendo desenhada no momento; null quando o dedo não está na tela. */
  readonly activeColor: ColorId | null;
  /** Traços concluídos, para o placar de movimentos. */
  readonly moves: number;
}

/** O que ocupa uma célula, quando ocupada. */
export interface Occupant {
  readonly color: ColorId;
  /** Índice da célula dentro do caminho daquela cor. */
  readonly index: number;
}
