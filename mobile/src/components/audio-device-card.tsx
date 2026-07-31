import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

export function AudioDeviceCard({ compact = false }: { compact?: boolean }) {
  return (
    <View
      style={[styles.card, compact && styles.compactCard]}
      accessible
      accessibilityLabel="Audio device. Connect a microphone or speaker in your phone Bluetooth settings. WildSight uses the system selected audio route.">
      <View style={[styles.icon, compact && styles.compactIcon]}>
        <Ionicons name="bluetooth" size={compact ? 18 : 23} color={colors.mint} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, compact && styles.compactTitle]}>Audio device</Text>
        <Text style={[styles.body, compact && styles.compactBody]}>
          Connect in phone Bluetooth settings. WildSight uses the current system audio route.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactCard: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(4, 17, 15, 0.84)',
    borderRadius: radii.md,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
  },
  compactIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  compactTitle: {
    fontSize: 14,
  },
  body: {
    color: colors.soft,
    fontSize: 14,
    lineHeight: 20,
  },
  compactBody: {
    fontSize: 12,
    lineHeight: 16,
  },
});

