import { config } from '../config.js';
import type { TranscriptionProvider, VisionProvider } from '../types.js';
import { BedrockVisionProvider } from './bedrockVisionProvider.js';
import {
  OpenAITranscriptionProvider,
  OpenAIVisionProvider
} from './openAIProvider.js';

export function createVisionProvider(): VisionProvider {
  if (config.AI_PROVIDER === 'openai') {
    return new OpenAIVisionProvider();
  }
  return new BedrockVisionProvider();
}

export function createTranscriptionProvider(): TranscriptionProvider {
  return new OpenAITranscriptionProvider();
}

