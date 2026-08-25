import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { LEVELS } from '@/logic/levels';
import { theme } from '@/themes/theme';
import { fontSize, spacing } from '@/themes/tokens';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Text style={styles.brand}>FLOW LAB</Text>
      <Text style={styles.sub}>{LEVELS.length} níveis prontos · motor e solver validados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
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
    marginTop: spacing.sm,
  },
});
