import { createApp } from './app.js';
import { config, getReadiness } from './config.js';

const app = createApp();

app.listen(config.PORT, () => {
  const readiness = getReadiness();
  console.log(`WildSight API listening on http://localhost:${config.PORT}`);
  console.log(
    readiness.ready
      ? `Providers ready: vision=${readiness.visionProvider}, transcription=${readiness.transcriptionProvider}`
      : `Provider setup incomplete. Missing: ${readiness.missing.join(', ')}`
  );
});

