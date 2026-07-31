import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

type ResponseCardProps = {
  answer: string;
  question: string;
  isDemo: boolean;
  onReplay: () => void;
  onFollowUp: () => void;
  onTryAgain: () => void;
};

export function ResponseCard({
  answer,
  question,
  isDemo,
  onReplay,
  onFollowUp,
  onTryAgain,
}: ResponseCardProps) {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.topRow}>
        <View style={styles.soundIcon}>
          <Ionicons name="volume-high" size={24} color={colors.ink} />
        </View>
        <View style={styles.topCopy}>
          <Text style={styles.label}>{isDemo ? 'DEMO DESCRIPTION' : 'WILDSIGHT SAYS'}</Text>
          <Text style={styles.question} numberOfLines={2}>
            “{question}”
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.answerScroll}
        contentContainerStyle={styles.answerContent}
        nestedScrollEnabled>
        <Text style={styles.answer}>{answer}</Text>
      </ScrollView>

      {isDemo ? (
        <Text style={styles.demoNote}>
          Bundled sample + approved local facts. No AI identification was claimed.
        </Text>
      ) : null}

      <View style={styles.actions}>
        <ActionButton icon="refresh-outline" label="Replay" onPress={onReplay} />
        <ActionButton icon="mic-outline" label="Ask follow-up" onPress={onFollowUp} primary />
        <ActionButton icon="camera-outline" label="Try again" onPress={onTryAgain} />
      </View>
    </View>
  );
}

type ActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
};

function ActionButton({ icon, label, onPress, primary = false }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary && styles.primaryAction,
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={23} color={primary ? colors.ink : colors.white} />
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    maxHeight: '72%',
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(4, 17, 15, 0.96)',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  soundIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCopy: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  question: {
    color: colors.soft,
    fontSize: 14,
    lineHeight: 19,
  },
  answerScroll: {
    maxHeight: 190,
  },
  answerContent: {
    paddingVertical: spacing.xs,
  },
  answer: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '600',
  },
  demoNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    gap: spacing.sm,
  },
  action: {
    minHeight: 54,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  primaryAction: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  actionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  primaryActionText: {
    color: colors.ink,
  },
  pressed: {
    opacity: 0.72,
  },
});
