import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

describe('WildSight API validation', () => {
  let app: Express;

  beforeAll(async () => {
    process.env.OPENAI_API_KEY = 'test-only-key';
    process.env.AI_PROVIDER = 'openai';
    const module = await import('../src/app.js');
    app = module.createApp();
  });

  it('reports provider readiness without returning secrets', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.ready).toBe(true);
    expect(JSON.stringify(response.body)).not.toContain('test-only-key');
  });

  it('rejects a new request without an audio file', async () => {
    const response = await request(app)
      .post('/api/v1/ask')
      .attach('image', Buffer.from('not-read-because-audio-is-missing'), {
        filename: 'animal.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('AUDIO_REQUIRED');
  });

  it('rejects unsupported audio before invoking a provider', async () => {
    const response = await request(app)
      .post('/api/v1/ask')
      .attach('audio', Buffer.from('plain text'), {
        filename: 'question.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(415);
    expect(response.body.error.code).toBe('AUDIO_TYPE_UNSUPPORTED');
  });
});
