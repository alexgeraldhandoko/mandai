import { z } from 'zod';

export const fieldsSchema = z.object({
  sessionId: z.string().uuid().optional(),
  responseLength: z.enum(['brief', 'standard', 'detailed']).default('standard'),
  language: z.enum(['en-US', 'id-ID']).default('en-US')
});

export const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]);

export const allowedAudioTypes = new Set([
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/aac'
]);

