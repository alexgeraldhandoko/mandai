# WildSight backend API

Local base URL: `http://localhost:4000`

The production service must be served over HTTPS.

## `GET /health`

Returns provider readiness without exposing secrets.

Example:

```json
{
  "service": "wildsight-api",
  "ready": true,
  "visionProvider": "bedrock",
  "transcriptionProvider": "openai",
  "missing": []
}
```

## `GET /api/v1/animals`

Returns the current approved grounding dataset. This endpoint is useful for content review and demo tooling.

## `POST /api/v1/ask`

Content type: `multipart/form-data`

### New question fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `image` | JPEG, PNG, GIF or WebP | yes | One current camera photograph, maximum 8 MB |
| `audio` | M4A, MP4, MP3, WAV, WebM, OGG or AAC | yes | The visitor’s spoken question, maximum 12 MB |
| `responseLength` | `brief`, `standard`, `detailed` | no | Defaults to `standard`; the first answer is always capped at 70 words |
| `language` | `en-US`, `id-ID` | no | Defaults to `en-US` |

Example:

```bash
curl -X POST http://localhost:4000/api/v1/ask \
  -F image=@elephant.jpg \
  -F audio=@question.m4a \
  -F responseLength=standard \
  -F language=en-US
```

### Follow-up fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `sessionId` | UUID returned by the first request | yes | Selects the retained image and conversation |
| `audio` | supported audio file | yes | New spoken follow-up |
| `responseLength` | enum | no | Same meaning as above |
| `language` | enum | no | Same meaning as above |

Do not attach a new image for a follow-up:

```bash
curl -X POST http://localhost:4000/api/v1/ask \
  -F sessionId=5a887c09-c5d9-456e-bf85-6fca7f12ec67 \
  -F audio=@follow-up.m4a
```

### Success response

```json
{
  "sessionId": "5a887c09-c5d9-456e-bf85-6fca7f12ec67",
  "question": "What am I looking at?",
  "answer": "You are looking at an Asian elephant standing beside a pool. It appears to be lifting grass with its trunk.",
  "provider": {
    "vision": "bedrock",
    "transcription": "openai"
  }
}
```

### Error response

Every handled error has a stable machine code and a visitor-safe message:

```json
{
  "error": {
    "code": "IMAGE_REQUIRED",
    "message": "Attach one image for a new question."
  }
}
```

Relevant status codes:

- `400` invalid field, missing image or missing audio
- `404` expired follow-up session
- `413` upload too large
- `415` unsupported media type
- `503` AI/transcription credentials are not configured
- `500` provider or analysis failure

## Provider boundary

`VisionProvider` accepts an image, transcribed question, recent conversation and approved grounding. `TranscriptionProvider` accepts only audio plus the requested language. This boundary lets the MVP use:

- Bedrock vision + OpenAI transcription, or
- OpenAI vision + OpenAI transcription

Adding Amazon Transcribe later does not require changing the route or mobile app; it requires another `TranscriptionProvider` implementation.

