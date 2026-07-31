import { Ionicons } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioDeviceCard } from '@/components/audio-device-card';
import { ResponseCard } from '@/components/response-card';
import { useSettings } from '@/context/settings-context';
import {
  demoAnimals,
  demoQuestions,
  getDemoAnswer,
  type DemoAnimal,
  type DemoQuestionId,
} from '@/data/demo-animals';
import { askWildSight } from '@/services/api';
import { colors, radii, spacing } from '@/theme';

type Phase = 'ready' | 'recording' | 'capturing' | 'analysing' | 'response' | 'error';

const statusCopy: Record<Phase, string> = {
  ready: 'Camera ready',
  recording: 'Listening',
  capturing: 'Taking picture',
  analysing: 'Analysing',
  response: 'Description ready',
  error: 'Something went wrong',
};

const statusCopyId: Record<Phase, string> = {
  ready: 'Kamera siap',
  recording: 'Mendengarkan',
  capturing: 'Mengambil gambar',
  analysing: 'Menganalisis',
  response: 'Deskripsi siap',
  error: 'Terjadi kesalahan',
};

export default function CameraScreen() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const isDemo = demo === '1';
  const [cameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  const startPromiseRef = useRef<Promise<void> | null>(null);
  const pressActiveRef = useRef(false);
  const recordingStartedRef = useRef(false);
  const { settings } = useSettings();

  const [phase, setPhase] = useState<Phase>('ready');
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [demoAnimal, setDemoAnimal] = useState<DemoAnimal>(demoAnimals[0]);
  const [demoQuestion, setDemoQuestion] = useState<DemoQuestionId>('identify');

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: settings.language,
      rate: settings.speechRate,
      pitch: 1,
    });
  };

  const announceStatus = (nextPhase: Phase) => {
    const message =
      settings.language === 'id-ID' ? statusCopyId[nextPhase] : statusCopy[nextPhase];
    AccessibilityInfo.announceForAccessibility(message);
    Speech.stop();
    Speech.speak(message, {
      language: settings.language,
      rate: Math.min(settings.speechRate, 1),
    });
  };

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const beginRecording = async () => {
    setError('');
    setPhase('recording');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    announceStatus('recording');

    if (isDemo) {
      recordingStartedRef.current = true;
      return;
    }

    const permission = await AudioModule.getRecordingPermissionsAsync();
    if (!permission.granted) {
      const requested = await AudioModule.requestRecordingPermissionsAsync();
      if (!requested.granted) throw new Error('Microphone permission was not granted.');
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
    recordingStartedRef.current = true;
  };

  const handlePressIn = () => {
    if (phase !== 'ready') return;
    pressActiveRef.current = true;
    const start = beginRecording().catch((recordingError: unknown) => {
      pressActiveRef.current = false;
      setPhase('error');
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : 'WildSight could not start recording.',
      );
    });
    startPromiseRef.current = start;
  };

  const handlePressOut = async () => {
    if (!pressActiveRef.current) return;
    pressActiveRef.current = false;
    await startPromiseRef.current;
    startPromiseRef.current = null;
    if (!recordingStartedRef.current) return;

    try {
      if (!isDemo) {
        await recorder.stop();
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      }
      recordingStartedRef.current = false;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const audioUri = isDemo ? `demo://${demoQuestion}` : recorder.uri;
      if (!audioUri) throw new Error('The recording could not be saved.');

      let photoUri = lastPhotoUri;
      if (!isFollowUp) {
        setPhase('capturing');
        announceStatus('capturing');
        if (isDemo) {
          photoUri = demoAnimal.assetUri;
        } else {
          if (!cameraReady || !cameraRef.current) {
            throw new Error('The camera is still getting ready. Please try again.');
          }
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.72,
            skipProcessing: false,
          });
          photoUri = photo.uri;
        }
        setLastPhotoUri(photoUri);
      }

      setPhase('analysing');
      announceStatus('analysing');

      let finalAnswer: string;
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 900));
        const selectedQuestion = demoQuestions.find((item) => item.id === demoQuestion)!;
        const demoAnswer = getDemoAnswer(
          demoAnimal,
          demoQuestion,
          settings.language,
          settings.responseLength,
        );
        setQuestion(
          settings.language === 'id-ID'
            ? selectedQuestion.labelId
            : selectedQuestion.label,
        );
        setAnswer(demoAnswer);
        finalAnswer = demoAnswer;
      } else {
        if (!photoUri) throw new Error('No picture is available for this question.');
        const result = await askWildSight({
          imageUri: isFollowUp ? undefined : photoUri,
          audioUri,
          sessionId: isFollowUp ? sessionId ?? undefined : undefined,
          responseLength: settings.responseLength,
          language: settings.language,
        });
        setSessionId(result.sessionId);
        setQuestion(result.question);
        setAnswer(result.answer);
        finalAnswer = result.answer;
      }

      setPhase('response');
      setIsFollowUp(false);
      setTimeout(() => speak(finalAnswer), 120);
    } catch (processingError) {
      setPhase('error');
      const message =
        processingError instanceof Error
          ? processingError.message
          : 'WildSight could not analyse this view. Please try again.';
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speak(message);
    }
  };

  const handleDemoWebPress = async () => {
    if (phase !== 'ready') return;
    pressActiveRef.current = true;
    startPromiseRef.current = beginRecording();
    await handlePressOut();
  };

  const replay = () => speak(answer);

  const askFollowUp = () => {
    Speech.stop();
    if (isDemo) {
      setDemoQuestion((current) =>
        current === 'identify' ? 'behaviour' : 'conservation',
      );
    }
    setIsFollowUp(true);
    setPhase('ready');
    setAnswer('');
    setQuestion('');
    AccessibilityInfo.announceForAccessibility('Ready for a follow-up about the same picture');
  };

  const tryAgain = () => {
    Speech.stop();
    setPhase('ready');
    setAnswer('');
    setQuestion('');
    setError('');
    setSessionId(null);
    setLastPhotoUri(null);
    setIsFollowUp(false);
  };

  if (!isDemo && cameraPermission && !cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.permissionFallback}>
        <Ionicons name="camera-outline" size={48} color={colors.lime} />
        <Text style={styles.fallbackTitle}>Camera permission is off</Text>
        <Text style={styles.fallbackCopy}>
          Return to the welcome screen to grant camera and microphone access.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.fallbackButton}>
          <Text style={styles.fallbackButtonText}>Back to welcome</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const showFrozenImage = (phase === 'response' || isFollowUp) && lastPhotoUri;
  const askLabel = isFollowUp ? 'Ask a follow-up' : 'Ask about what I see';

  return (
    <View style={styles.container}>
      {isDemo ? (
        <Image
          source={demoAnimal.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel={demoAnimal.alt}
        />
      ) : showFrozenImage ? (
        <Image
          source={{ uri: lastPhotoUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel="The photo retained for this conversation"
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="picture"
          onCameraReady={() => setCameraReady(true)}
          onMountError={(event) => {
            setError(event.message);
            setPhase('error');
          }}
        />
      )}
      <View style={[styles.scrim, styles.noPointerEvents]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to welcome"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={28} color={colors.white} />
          </Pressable>

          <View style={[styles.modePill, isDemo && styles.demoPill]} accessible>
            <View style={[styles.liveDot, isDemo && styles.demoDot]} />
            <Text style={styles.modeText}>{isDemo ? 'BUNDLED DEMO' : 'LIVE CAMERA'}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            accessibilityHint="Change response length, speech speed and language"
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="settings-outline" size={25} color={colors.white} />
          </Pressable>
        </View>

        {isDemo && phase === 'ready' && !isFollowUp ? (
          <View style={styles.demoControls}>
            <Text style={styles.demoHelper}>
              Demo mode uses the selected sample and approved facts. Choose the question because
              cloud speech-to-text is off.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              accessibilityLabel="Choose a demo animal">
              {demoAnimals.map((animal) => (
                <Pressable
                  key={animal.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: animal.id === demoAnimal.id }}
                  accessibilityLabel={`Show ${animal.name} sample`}
                  onPress={() => setDemoAnimal(animal)}
                  style={[
                    styles.chip,
                    animal.id === demoAnimal.id && styles.chipSelected,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      animal.id === demoAnimal.id && styles.chipTextSelected,
                    ]}>
                    {animal.shortName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              accessibilityLabel="Choose a demo question">
              {demoQuestions.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.id === demoQuestion }}
                  onPress={() => setDemoQuestion(item.id)}
                  style={[
                    styles.questionChip,
                    item.id === demoQuestion && styles.questionChipSelected,
                  ]}>
                  <Text style={styles.questionChipText}>
                    {settings.language === 'id-ID' ? item.labelId : item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.flexSpacer} />

        {(phase === 'capturing' || phase === 'analysing') && (
          <View style={styles.processingCard} accessibilityRole="alert">
            <ActivityIndicator size="large" color={colors.lime} />
            <Text style={styles.processingTitle}>{statusCopy[phase]}</Text>
            <Text style={styles.processingCopy}>
              {phase === 'capturing'
                ? 'Hold the phone steady for a moment.'
                : 'Creating a short, grounded description.'}
            </Text>
          </View>
        )}

        {phase === 'response' && (
          <ResponseCard
            answer={answer}
            question={question}
            isDemo={isDemo}
            onReplay={replay}
            onFollowUp={askFollowUp}
            onTryAgain={tryAgain}
          />
        )}

        {phase === 'error' && (
          <View style={styles.errorCard} accessibilityRole="alert">
            <View style={styles.errorTitleRow}>
              <Ionicons name="alert-circle" size={27} color={colors.sun} />
              <Text style={styles.errorTitle}>We couldn’t answer that</Text>
            </View>
            <Text style={styles.errorCopy}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={tryAgain}
              style={({ pressed }) => [styles.tryButton, pressed && styles.pressed]}>
              <Text style={styles.tryButtonText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {phase === 'ready' || phase === 'recording' ? (
          <View style={styles.askArea}>
            <View style={styles.statusRow} accessible accessibilityLiveRegion="polite">
              <View
                style={[styles.statusDot, phase === 'recording' && styles.recordingDot]}
              />
              <Text style={styles.statusText}>
                {phase === 'recording'
                  ? `${statusCopy[phase]} · ${Math.max(1, Math.round(recorderState.durationMillis / 1000))}s`
                  : isFollowUp
                    ? 'Same picture retained'
                    : statusCopy[phase]}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={askLabel}
              accessibilityHint="Press and hold while speaking. Release to send your question."
              accessibilityState={{ busy: phase === 'recording' }}
              onPress={
                isDemo && Platform.OS === 'web' ? handleDemoWebPress : undefined
              }
              onPressIn={
                isDemo && Platform.OS === 'web' ? undefined : handlePressIn
              }
              onPressOut={
                isDemo && Platform.OS === 'web' ? undefined : handlePressOut
              }
              style={({ pressed }) => [
                styles.askButton,
                phase === 'recording' && styles.askButtonRecording,
                pressed && styles.askButtonPressed,
              ]}>
              <View style={styles.micCircle}>
                <Ionicons
                  name={phase === 'recording' ? 'radio' : 'mic'}
                  size={34}
                  color={colors.ink}
                />
              </View>
              <View style={styles.askCopy}>
                <Text style={styles.askTitle}>
                  {phase === 'recording' ? 'Release to ask' : askLabel}
                </Text>
                <Text style={styles.askHint}>
                  {phase === 'recording' ? 'Keep holding while you speak' : 'Press and hold'}
                </Text>
              </View>
            </Pressable>

            <AudioDeviceCard compact />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(4, 17, 15, 0.25)',
  },
  noPointerEvents: {
    pointerEvents: 'none',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: Platform.OS === 'android' ? spacing.md : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 17, 15, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modePill: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(4, 17, 15, 0.78)',
  },
  demoPill: {
    backgroundColor: colors.teal,
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF5A5F',
  },
  demoDot: {
    backgroundColor: colors.lime,
  },
  modeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  demoControls: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(4, 17, 15, 0.82)',
  },
  demoHelper: {
    paddingHorizontal: spacing.md,
    color: colors.soft,
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  chip: {
    minHeight: 48,
    minWidth: 76,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.muted,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chipSelected: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  chipText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: colors.ink,
  },
  questionChip: {
    minHeight: 48,
    maxWidth: 210,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  questionChipSelected: {
    borderColor: colors.mint,
    backgroundColor: colors.teal,
  },
  questionChipText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  flexSpacer: {
    flex: 1,
  },
  processingCard: {
    alignSelf: 'center',
    width: '92%',
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(4, 17, 15, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  processingTitle: {
    color: colors.white,
    fontSize: 27,
    fontWeight: '800',
  },
  processingCopy: {
    color: colors.soft,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  errorCard: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(29, 37, 34, 0.96)',
    gap: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.sun,
  },
  errorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  errorCopy: {
    color: colors.soft,
    fontSize: 16,
    lineHeight: 23,
  },
  tryButton: {
    minHeight: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lime,
  },
  tryButtonText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  askArea: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  statusRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(4, 17, 15, 0.8)',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.lime,
  },
  recordingDot: {
    backgroundColor: '#FF5A5F',
  },
  statusText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  askButton: {
    minHeight: 108,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.lime,
    borderWidth: 3,
    borderColor: colors.white,
  },
  askButtonRecording: {
    backgroundColor: colors.sun,
  },
  askButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  micCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  askCopy: {
    flex: 1,
  },
  askTitle: {
    color: colors.ink,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '900',
  },
  askHint: {
    color: colors.inkMuted,
    fontSize: 15,
    marginTop: 3,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
  permissionFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.ink,
  },
  fallbackTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  fallbackCopy: {
    color: colors.soft,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
  fallbackButton: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
    justifyContent: 'center',
  },
  fallbackButtonText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
});
