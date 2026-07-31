import { describe, expect, it } from 'vitest';

import { countWords, formatResponse } from '../src/formatResponse.js';

describe('formatResponse', () => {
  it('returns the uncertainty sentence for an empty provider response', () => {
    expect(formatResponse('   ')).toBe('I cannot identify this confidently.');
  });

  it('removes markdown that would sound awkward through text-to-speech', () => {
    expect(formatResponse('## Answer\n- An Asian elephant is ahead.')).toBe(
      'Answer An Asian elephant is ahead.'
    );
  });

  it('caps a long first response at 70 words', () => {
    const longAnswer = Array.from({ length: 90 }, (_, index) => `word${index}`).join(' ');
    expect(countWords(formatResponse(longAnswer))).toBeLessThanOrEqual(70);
  });

  it('replaces dangerous movement instructions with a safety refusal', () => {
    expect(formatResponse('Walk forward and take 12 steps toward the tiger.')).toBe(
      'I can describe the animal or exhibit, but I cannot provide navigation or hazard guidance.'
    );
  });
});
