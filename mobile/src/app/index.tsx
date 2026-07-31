import { AudioModule } from 'expo-audio';
import { useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioDeviceCard } from '@/components/audio-device-card';
import { PrimaryButton } from '@/components/primary-button';
import { colors, radii, spacing } from '@/theme';

export default function HomeScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphoneGranted, setMicrophoneGranted] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AudioModule.getRecordingPermissionsAsync().then((permission) => {
      setMicrophoneGranted(permission.granted);
    });
  }, []);

  const grantPermissions = async () => {
    setRequesting(true);
    setError(null);
    try {
      const camera = cameraPermission?.granted
        ? cameraPermission
        : await requestCameraPermission();
      const microphone = microphoneGranted
        ? { granted: true }
        : await AudioModule.requestRecordingPermissionsAsync();
      setMicrophoneGranted(microphone.granted);

      if (camera.granted && microphone.granted) {
        router.push({ pathname: '/camera', params: { demo: '0' } });
        return;
      }
      setError(
        'Camera and microphone access are both needed for live animal questions. You can change permissions in phone settings or use the bundled demo.',
      );
    } catch {
      setError('WildSight could not request permissions. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const bothDeniedPermanently =
    cameraPermission?.canAskAgain === false && microphoneGranted === false;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#163F39', colors.ink, colors.ink]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow} accessible accessibilityRole="header">
            <View style={styles.logo}>
              <Ionicons name="eye-outline" size={30} color={colors.ink} />
            </View>
            <Text style={styles.brand}>WILDSIGHT</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>SEE THE WILD, YOUR WAY</Text>
            <Text style={styles.title}>The wildlife in front of you, described aloud.</Text>
            <Text style={styles.subtitle}>
              Point your camera, hold one large button, ask a question, and hear a concise
              description.
            </Text>
          </View>

          <View style={styles.permissionCard}>
            <Text style={styles.cardTitle}>Before we begin</Text>
            <PermissionRow
              icon="camera-outline"
              title="Camera"
              description="Captures one photo when you release the ask button."
              granted={cameraPermission?.granted ?? null}
            />
            <View style={styles.divider} />
            <PermissionRow
              icon="mic-outline"
              title="Microphone"
              description="Records only while you hold the ask button."
              granted={microphoneGranted}
            />
          </View>

          {error ? (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Ionicons name="alert-circle-outline" size={24} color={colors.sun} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {bothDeniedPermanently ? (
            <PrimaryButton
              label="Open phone settings"
              icon="settings-outline"
              onPress={() => Linking.openSettings()}
              variant="secondary"
            />
          ) : (
            <PrimaryButton
              label={
                requesting
                  ? 'Requesting access…'
                  : cameraPermission?.granted && microphoneGranted
                    ? 'Open camera'
                    : 'Allow camera & microphone'
              }
              icon={requesting ? undefined : 'arrow-forward'}
              onPress={grantPermissions}
              disabled={requesting}
              trailing={requesting ? <ActivityIndicator color={colors.ink} /> : undefined}
              accessibilityHint="Requests camera and microphone access, then opens WildSight"
            />
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open bundled animal demo"
            accessibilityHint="Uses local sample images and approved animal facts without an AI backend"
            onPress={() => router.push({ pathname: '/camera', params: { demo: '1' } })}
            style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}>
            <Ionicons name="images-outline" size={22} color={colors.mint} />
            <Text style={styles.demoText}>Try bundled demo</Text>
          </Pressable>

          <AudioDeviceCard />

          <Text style={styles.privacy}>
            WildSight sends one photo and one short recording for each question. It is not a
            navigation or hazard-detection tool.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type PermissionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  granted: boolean | null;
};

function PermissionRow({ icon, title, description, granted }: PermissionRowProps) {
  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionIcon}>
        <Ionicons name={icon} size={24} color={colors.mint} />
      </View>
      <View style={styles.permissionCopy}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionDescription}>{description}</Text>
      </View>
      <Ionicons
        name={granted ? 'checkmark-circle' : 'ellipse-outline'}
        size={25}
        color={granted ? colors.lime : colors.muted}
        accessibilityLabel={granted ? 'Granted' : 'Not granted'}
      />
    </View>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lime,
  },
  brand: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2.4,
  },
  hero: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.lime,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    color: colors.white,
    fontSize: 39,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  subtitle: {
    color: colors.soft,
    fontSize: 18,
    lineHeight: 27,
  },
  permissionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionCopy: {
    flex: 1,
    gap: 2,
  },
  permissionTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  permissionDescription: {
    color: colors.soft,
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.errorBackground,
  },
  errorText: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  demoButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  demoText: {
    color: colors.mint,
    fontSize: 17,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  privacy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
