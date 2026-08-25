// Design tokens do Flow Lab. Escalas invariantes — cores ficam em `theme.ts`.
// Mesma política do Sudoku Lab: nada de número solto em StyleSheet.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 32,
} as const;

export const fontFamily = {
  display: 'Baloo2_800ExtraBold',
  heading: 'Baloo2_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

/**
 * Tempos de animação. O traço precisa acompanhar o dedo sem atraso perceptível
 * — por isso `trail` é curto: acima de ~120ms o caminho parece arrastar atrás
 * do toque, que é a queixa número um em jogos deste gênero.
 */
export const animation = {
  trail: 90,
  cellPop: 140,
  levelComplete: 420,
} as const;
