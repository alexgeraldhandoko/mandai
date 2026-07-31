import { Platform } from 'react-native';

import type { Language, ResponseLength } from '@/context/settings-context';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/u, '');

type AskRequest = {
  imageUri?: string;
  audioUri: string;
  sessionId?: string;
  responseLength: ResponseLength;
  language: Language;
};

type AskResponse = {
  sessionId: string;
  question: string;
  answer: string;
  provider: {
    vision: string;
    transcription: string;
  };
};

type ErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

function mimeType(uri: string, kind: 'image' | 'audio'): string {
  const extension = uri.split('?')[0]?.split('.').pop()?.toLowerCase();
  if (kind === 'image') {
    if (extension === 'png') return 'image/png';
    if (extension === 'webp') return 'image/webp';
    return 'image/jpeg';
  }
  if (extension === 'webm') return 'audio/webm';
  if (extension === 'wav') return 'audio/wav';
  if (extension === 'mp3') return 'audio/mpeg';
  return 'audio/m4a';
}

async function appendFile(
  form: FormData,
  field: string,
  uri: string,
  kind: 'image' | 'audio',
) {
  const type = mimeType(uri, kind);
  const extension = type.split('/')[1].replace('mpeg', 'mp3').replace('jpeg', 'jpg');
  const name = `${field}.${extension}`;

  if (Platform.OS === 'web') {
    const blob = await fetch(uri).then((response) => response.blob());
    form.append(field, blob, name);
    return;
  }

  form.append(
    field,
    {
      uri,
      name,
      type,
    } as unknown as Blob,
  );
}

export async function askWildSight(request: AskRequest): Promise<AskResponse> {
  if (!apiUrl) {
    throw new Error(
      'No backend URL is configured. Return to the welcome screen and open the bundled demo, or set EXPO_PUBLIC_API_URL.',
    );
  }

  const form = new FormData();
  await appendFile(form, 'audio', request.audioUri, 'audio');
  if (request.imageUri) {
    await appendFile(form, 'image', request.imageUri, 'image');
  }
  if (request.sessionId) form.append('sessionId', request.sessionId);
  form.append('responseLength', request.responseLength);
  form.append('language', request.language);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${apiUrl}/api/v1/ask`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as ErrorPayload;
      throw new Error(
        payload.error?.message ??
          `WildSight’s server returned an error (${response.status}).`,
      );
    }

    return (await response.json()) as AskResponse;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The analysis took too long. Check the connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

