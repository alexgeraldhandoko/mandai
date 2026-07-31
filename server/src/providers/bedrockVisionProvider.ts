import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock
} from '@aws-sdk/client-bedrock-runtime';

import { config } from '../config.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import type { AnalysisRequest, VisionProvider } from '../types.js';

function imageFormat(mimeType: string): 'jpeg' | 'png' | 'gif' | 'webp' {
  const format = mimeType.split('/')[1]?.toLowerCase();
  if (format === 'jpg' || format === 'jpeg') return 'jpeg';
  if (format === 'png' || format === 'gif' || format === 'webp') return format;
  throw new Error(`Unsupported image type for Bedrock: ${mimeType}`);
}

export class BedrockVisionProvider implements VisionProvider {
  readonly name = 'bedrock';
  private readonly client = new BedrockRuntimeClient({ region: config.AWS_REGION });

  async analyse(request: AnalysisRequest): Promise<string> {
    const content: ContentBlock[] = [
      {
        image: {
          format: imageFormat(request.imageMimeType),
          source: { bytes: request.image }
        }
      },
      { text: buildUserPrompt(request) }
    ];

    const response = await this.client.send(
      new ConverseCommand({
        modelId: config.BEDROCK_MODEL_ID,
        system: [{ text: buildSystemPrompt(request) }],
        messages: [{ role: 'user', content }],
        inferenceConfig: {
          maxTokens: 180,
          temperature: 0.1
        }
      })
    );

    const text = response.output?.message?.content?.find((block) => block.text)?.text;
    if (!text) {
      throw new Error('Bedrock returned no text response.');
    }
    return text;
  }
}

