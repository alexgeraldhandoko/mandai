import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioDeviceCard } from '@/components/audio-device-card';
import {
  responseLengthOptions,
  speechRateOptions,
  useSettings,
} from '@/context/settings-context';
import { colors, radii, spacing } from '@/theme';

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  const previewVoice = () => {
    Speech.stop();
    Speech.speak(
      settings.language === 'id-ID'
        ? 'Ini adalah kecepatan suara WildSight.'
        : 'This is how WildSight will sound.',
      {
        language: settings.language,
        rate: settings.speechRate,
      },
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>WILDSIGHT</Text>
            <Text style={styles.title}>Settings</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close settings"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <Ionicons name="close" size={30} color={colors.white} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <SettingsGroup
            title="Response length"
            description="The first answer always remains below 70 words.">
            {responseLengthOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                description={option.description}
                selected={settings.responseLength === option.value}
                onPress={() => updateSettings({ responseLength: option.value })}
              />
            ))}
          </SettingsGroup>

          <SettingsGroup
            title="Speech speed"
            description="Choose the pace used for status and answer speech.">
            {speechRateOptions.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                description={`${option.value.toFixed(1)} times normal speed`}
                selected={settings.speechRate === option.value}
                onPress={() => updateSettings({ speechRate: option.value })}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={previewVoice}
              style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}>
              <Ionicons name="volume-high-outline" size={23} color={colors.ink} />
              <Text style={styles.previewText}>Preview voice</Text>
            </Pressable>
          </SettingsGroup>

          <SettingsGroup
            title="Language"
            description="Changes transcription, AI response and spoken voice.">
            <OptionRow
              label="English"
              description="English (Singapore)"
              selected={settings.language === 'en-US'}
              onPress={() => updateSettings({ language: 'en-US' })}
            />
            <OptionRow
              label="Bahasa Indonesia"
              description="Indonesian"
              selected={settings.language === 'id-ID'}
              onPress={() => updateSettings({ language: 'id-ID' })}
            />
          </SettingsGroup>

          <AudioDeviceCard />

          <View style={styles.safetyCard}>
            <Ionicons name="shield-checkmark-outline" size={27} color={colors.lime} />
            <View style={styles.safetyCopy}>
              <Text style={styles.safetyTitle}>Designed for description, not navigation</Text>
              <Text style={styles.safetyText}>
                WildSight cannot safely detect roads, steps, barriers or other hazards. Keep using
                your normal mobility aids and official visitor guidance.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type SettingsGroupProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingsGroup({ title, description, children }: SettingsGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <Text style={styles.groupDescription}>{description}</Text>
      <View style={styles.options}>{children}</View>
    </View>
  );
}

type OptionRowProps = {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

function OptionRow({ label, description, selected, onPress }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}, ${description}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}>
      <View style={styles.optionCopy}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioCenter} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.lime,
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '900',
  },
  title: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 3,
  },
  closeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  groupDescription: {
    color: colors.soft,
    fontSize: 15,
    lineHeight: 21,
  },
  options: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    gap: 1,
    backgroundColor: colors.border,
  },
  option: {
    minHeight: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
  },
  optionSelected: {
    backgroundColor: colors.teal,
  },
  optionCopy: {
    flex: 1,
  },
  optionLabel: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  optionDescription: {
    color: colors.soft,
    fontSize: 14,
    marginTop: 2,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.lime,
  },
  radioCenter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.lime,
  },
  previewButton: {
    minHeight: 56,
    backgroundColor: colors.lime,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  safetyCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.teal,
  },
  safetyCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  safetyTitle: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  safetyText: {
    color: colors.soft,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
});
