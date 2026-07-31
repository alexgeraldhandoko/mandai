import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { ZodError } from 'zod';

import { config, getReadiness } from './config.js';
import { formatResponse } from './formatResponse.js';
import { getAnimals, getGroundingText } from './grounding.js';
import { createTranscriptionProvider, createVisionProvider } from './providers/index.js';
import { SessionStore } from './sessionStore.js';
import { allowedAudioTypes, allowedImageTypes, fieldsSchema } from './validation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
    files: 2,
    fields: 5
  }
});

type UploadedFiles = {
  image?: Express.Multer.File[];
  audio?: Express.Multer.File[];
};

export function createApp() {
  const app = express();
  const sessions = new SessionStore();

  app.disable('x-powered-by');
  app.use(cors({ origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_request, response) => {
    response.json({
      service: 'wildsight-api',
      ...getReadiness()
    });
  });

  app.get('/api/v1/animals', (_request, response) => {
    response.json({ animals: getAnimals() });
  });

  app.post(
    '/api/v1/ask',
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'audio', maxCount: 1 }
    ]),
    async (request, response, next) => {
      try {
        const readiness = getReadiness();
        if (!readiness.ready) {
          return response.status(503).json({
            error: {
              code: 'PROVIDER_NOT_CONFIGURED',
              message: `The backend is not ready. Missing: ${readiness.missing.join(', ')}. Use the mobile app’s bundled demo mode or configure server/.env.`
            }
          });
        }

        const fields = fieldsSchema.parse(request.body);
        const files = request.files as UploadedFiles | undefined;
        const image = files?.image?.[0];
        const audio = files?.audio?.[0];

        if (!audio) {
          return response.status(400).json({
            error: { code: 'AUDIO_REQUIRED', message: 'Attach one audio recording.' }
          });
        }
        if (!allowedAudioTypes.has(audio.mimetype)) {
          return response.status(415).json({
            error: { code: 'AUDIO_TYPE_UNSUPPORTED', message: 'Use M4A, MP4, MP3, WAV, WebM, OGG or AAC audio.' }
          });
        }

        let session;
        let isFollowUp = false;
        if (fields.sessionId) {
          session = sessions.get(fields.sessionId);
          if (!session) {
            return response.status(404).json({
              error: { code: 'SESSION_EXPIRED', message: 'That conversation has expired. Take another picture to continue.' }
            });
          }
          isFollowUp = true;
        } else {
          if (!image) {
            return response.status(400).json({
              error: { code: 'IMAGE_REQUIRED', message: 'Attach one image for a new question.' }
            });
          }
          if (!allowedImageTypes.has(image.mimetype)) {
            return response.status(415).json({
              error: { code: 'IMAGE_TYPE_UNSUPPORTED', message: 'Use a JPEG, PNG, GIF or WebP image.' }
            });
          }
          if (image.size > 8 * 1024 * 1024) {
            return response.status(413).json({
              error: { code: 'IMAGE_TOO_LARGE', message: 'The image must be 8 MB or smaller.' }
            });
          }
          session = sessions.create(image.buffer, image.mimetype);
        }

        const transcriptionProvider = createTranscriptionProvider();
        const visionProvider = createVisionProvider();
        const question = await transcriptionProvider.transcribe(
          audio.buffer,
          audio.mimetype,
          fields.language
        );

        const rawAnswer = await visionProvider.analyse({
          image: session.image,
          imageMimeType: session.imageMimeType,
          question,
          conversation: session.conversation,
          grounding: getGroundingText(),
          responseLength: fields.responseLength,
          language: fields.language,
          isFollowUp
        });
        const answer = formatResponse(rawAnswer, 70, fields.language);

        session.conversation.push(
          { role: 'user', text: question },
          { role: 'assistant', text: answer }
        );
        session.updatedAt = Date.now();

        return response.json({
          sessionId: session.id,
          question,
          answer,
          provider: {
            vision: visionProvider.name,
            transcription: transcriptionProvider.name
          }
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction
    ) => {
      if (error instanceof ZodError) {
        return response.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: 'One or more request fields are invalid.',
            details: error.flatten()
          }
        });
      }
      if (error instanceof multer.MulterError) {
        return response.status(413).json({
          error: { code: 'UPLOAD_REJECTED', message: error.message }
        });
      }

      console.error(error);
      return response.status(500).json({
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'WildSight could not analyse this image. Please try again.'
        }
      });
    }
  );

  return app;
}
