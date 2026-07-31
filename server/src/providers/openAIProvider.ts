import OpenAI, { toFile } from 'openai';

import { config } from '../config.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import type {
  AnalysisRequest,
  SupportedLanguage,
  TranscriptionProvider,
  VisionProvider
} from '../types.js';

function extensionFor(mimeType: string): string {
  const subtype = mimeType.split('/')[1]?.split(';')[0] ?? 'm4a';
  if (subtype === 'x-m4a') return 'm4a';
  return subtype;
}

function requireOpenAIKey(): string {
  if (!config.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for the configured provider.');
  }
  return config.OPENAI_API_KEY;
}

export class OpenAIVisionProvider implements VisionProvider {
  readonly name = 'openai';
  private readonly client = new OpenAI({ apiKey: requireOpenAIKey() });

  async analyse(request: AnalysisRequest): Promise<string> {
    const response = await this.client.responses.create({
      model: config.OPENAI_VISION_MODEL,
      instructions: buildSystemPrompt(request),
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: buildUserPrompt(request) },
            {
              type: 'input_image',
              image_url: `data:${request.imageMimeType};base64,${request.image.toString('base64')}`,
              detail: 'high'
            }
          ]
        }
      ],
      max_output_tokens: 180,
      temperature: 0.1
    });

    if (!response.output_text) {
      throw new Error('OpenAI returned no text response.');
    }
    return response.output_text;
  }
}

export class OpenAITranscriptionProvider implements TranscriptionProvider {
  readonly name = 'openai';
  private readonly client = new OpenAI({ apiKey: requireOpenAIKey() });

  async transcribe(
    audio: Buffer,
    mimeType: string,
    language: SupportedLanguage
  ): Promise<string> {
    const file = await toFile(audio, `question.${extensionFor(mimeType)}`, {
      type: mimeType
    });
    const result = await this.client.audio.transcriptions.create({
      file,
      model: config.OPENAI_TRANSCRIPTION_MODEL,
      language: language === 'id-ID' ? 'id' : 'en',
      prompt:
        'The recording may begin with an automated app cue saying "Listening" or "Mendengarkan". Omit that cue and transcribe only the visitor’s question.'
    });

    const text = result.text.trim();
    if (!text) {
      throw new Error('No speech was detected in the recording.');
    }
    return text;
  }
}
