import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  trailing?: ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  accessibilityHint?: string;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  trailing,
  disabled = false,
  variant = 'primary',
  accessibilityHint,
}: PrimaryButtonProps) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
      <View style={styles.trailing}>
        {trailing ??
          (icon ? (
            <Ionicons
              name={icon}
              size={24}
              color={secondary ? colors.white : colors.ink}
            />
          ) : null)}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryLabel: {
    color: colors.white,
  },
  trailing: {
    minWidth: 32,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.65,
  },
});

