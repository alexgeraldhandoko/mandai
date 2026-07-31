import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('*'),
  AI_PROVIDER: z.enum(['bedrock', 'openai']).default('bedrock'),
  TRANSCRIPTION_PROVIDER: z.enum(['openai']).default('openai'),
  AWS_REGION: z.string().default('us-east-1'),
  BEDROCK_MODEL_ID: z.string().default('amazon.nova-lite-v1:0'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_VISION_MODEL: z.string().default('gpt-4.1-mini'),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default('gpt-4o-mini-transcribe')
});

export const config = configSchema.parse(process.env);

export function getReadiness() {
  const missing: string[] = [];

  if (config.AI_PROVIDER === 'openai' && !config.OPENAI_API_KEY) {
    missing.push('OPENAI_API_KEY');
  }

  if (config.TRANSCRIPTION_PROVIDER === 'openai' && !config.OPENAI_API_KEY) {
    missing.push('OPENAI_API_KEY');
  }

  return {
    ready: missing.length === 0,
    visionProvider: config.AI_PROVIDER,
    transcriptionProvider: config.TRANSCRIPTION_PROVIDER,
    missing: [...new Set(missing)]
  };
}

