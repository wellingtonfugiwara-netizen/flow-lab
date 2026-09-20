import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/themes/theme';
import { fontSize, radius, spacing } from '@/themes/tokens';

interface Props {
  pairsDone: number;
  pairsTotal: number;
  fillPercent: number;
  moves: number;
}

/**
 * Os três números que o jogador precisa: pares fechados, quanto do tabuleiro
 * está preenchido e movimentos. O preenchimento é o que separa este jogo de
 * "ligar pontos" — ligar tudo com buraco sobrando não fecha o nível.
 */
export default function Hud({ pairsDone, pairsTotal, fillPercent, moves }: Props) {
  return (
    <View style={styles.row}>
      <Item label="Pares" value={`${pairsDone}/${pairsTotal}`} />
      <Item label="Preenchido" value={`${fillPercent}%`} />
      <Item label="Movimentos" value={String(moves)} />
    </View>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: theme.surface,
    borderRadius: radius.md,
  },
  value: {
    color: theme.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  label: {
    color: theme.textDim,
    fontSize: fontSize.xs,
    marginTop: spacing.xs / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
