import { describe, expect, it } from 'vitest';

import { fieldsSchema } from '../src/validation.js';

describe('API field validation', () => {
  it('applies accessible response defaults', () => {
    expect(fieldsSchema.parse({})).toEqual({
      responseLength: 'standard',
      language: 'en-US'
    });
  });

  it('rejects an unsupported language', () => {
    expect(() => fieldsSchema.parse({ language: 'fr-FR' })).toThrow();
  });

  it('rejects malformed session identifiers', () => {
    expect(() => fieldsSchema.parse({ sessionId: 'not-a-uuid' })).toThrow();
  });
});

