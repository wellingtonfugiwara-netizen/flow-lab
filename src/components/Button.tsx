import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/themes/theme';
import { fontSize, radius, spacing } from '@/themes/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}

export default function Button({ label, onPress, variant = 'ghost' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.ghost,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, primary && styles.labelPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primary: {
    backgroundColor: theme.accent,
  },
  ghost: {
    backgroundColor: theme.surfaceAlt,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: theme.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  labelPrimary: {
    color: theme.onAccent,
    fontWeight: '700',
  },
});
