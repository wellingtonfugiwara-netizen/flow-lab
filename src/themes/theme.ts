import type { ColorId } from '@/logic/types';

/**
 * Paleta do Flow Lab.
 *
 * A decisão de identidade: neste jogo a cor É o conteúdo — cada caminho tem a
 * sua. Por isso a moldura (fundo, texto, bordas) recua para um violeta sóbrio
 * quase neutro, e a saturação toda fica reservada para as peças. É o oposto do
 * Sudoku Lab, onde o âmbar da marca aparece na interface inteira.
 */
export const theme = {
  bg: '#0d0c14',
  surface: '#171526',
  surfaceAlt: '#1e1b30',
  line: '#231f33',
  text: '#ece9f5',
  textDim: '#6b6383',
  accent: '#8b5cf6',
  onAccent: '#12081f',
  cell: '#171526',
} as const;

/** Cores dos caminhos. As chaves batem com os `color` dos níveis gerados. */
export const PATH_COLORS: Readonly<Record<ColorId, string>> = {
  rose: '#f0567a',
  mint: '#4ade80',
  sky: '#38bdf8',
  amber: '#fbbf24',
  violet: '#a78bfa',
  coral: '#fb7185',
  lime: '#a3e635',
};

/** Fallback explícito: cor desconhecida vira o acento, nunca `undefined`. */
export function pathColor(id: ColorId): string {
  return PATH_COLORS[id] ?? theme.accent;
}
