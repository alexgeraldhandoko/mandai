# AWS Hackathon for Mandai Wildlife Group (Team 7)

Guest Data and Interpretives Study Results: https://drive.google.com/file/d/1dod3GOczgv_BxictYbQ3uNPjULkPjQTf/view

## Challenge Statement

How might you use KIRO to create a personalised, AI-powered experience at a zoo exhibit that helps guests connect more deeply with animals and inspire greater appreciation for wildlife and nature?

**Brainstorming of solutions**
- new mobile app which serves as an audio guide to visitors, including those with visual impairment
- visitors can tailor the complexity of their audio guide based on their age.
- visitors can scan animals and have to follow a specific path to attain badges, similar to Pokemon Go.
- visitors can scan images of the animals at the echibit so that they can view animations of the animal which encapsulate the information of the exhibits. (Image-Based AR / Marker-Based AR)
- rfid watches that non-tech users can use to tag the rfid at different exhibits and accumulate enough 'points' to attain badges.

---

## The Problem (from Study Data)

- 76% of park guests walk past interpretives without stopping
- Guests who do stop only engage for an average of 17.3 seconds
- 62% of visitors are families with kids (82% of those have children under 13)
- Info signs are the most commonly used learning channel (~55% of mentions), but static signage has limited engagement
- Guests are motivated by: gaining knowledge, interesting visuals, personal connections, and interactivity

## Our Solution: "Mandai Explorer" App

A mobile app that transforms the zoo visit into a personalised, gamified audio-visual journey — adapting to each visitor's age, interests, and accessibility needs.

---

## Core Features

### 1. Adaptive Audio Guide

Visitors select a profile on entry that tailors all narration to their level:

| Profile | Target | Style |
|---------|--------|-------|
| Little Explorer | Kids < 7 | Simple language, sound effects, short fun facts |
| Junior Ranger | Kids 7–12 | Story-driven, quiz questions, keeper anecdotes |
| Naturalist | Teens/Adults | Conservation science, habitat ecology, research insights |
| Accessibility | Visually impaired | Rich spatial/sensory descriptions, haptic cues |

- AI generates narration dynamically based on profile and exhibit context
- Text-to-speech in multiple languages (via Amazon Polly)
- Audio triggered by proximity (geofencing/BLE beacons) so guests don't need to read signs

### 2. Scan & Discover (Animal Recognition)

- Point the camera at any animal → AI identifies the species in real-time
- A popup card appears showing:
  - Animal name and species
  - Fun facts tailored to the visitor's age profile
  - The animal's personality and keeper stories (personal connection)
  - Conservation status, threats, and habitat info
  - A short audio narration auto-plays alongside the card
- Each scanned animal is saved to the visitor's personal "Field Journal"
- Encourages guests to observe animals closely — the scan requires a steady focus on the animal

### 3. Species Collection Badges

- Visitors earn badges by scanning multiple animals from the same or related species groups
- Example badge collections:

| Badge | Requirement | Example |
|-------|-------------|---------|
| Bird Watcher | Scan 5 different bird species | Hornbill, Pelican, Flamingo, Macaw, Penguin |
| Reptile Ranger | Scan 4 different reptile species | Gharial, Komodo Dragon, Tortoise, Crocodile |
| Primate Pro | Scan 3 different primate species | Orangutan, Gibbon, Mandrill |
| Big Cat Tracker | Scan 3 different big cat species | Tiger, Lion, Cheetah |
| Ultimate Explorer | Complete all badge collections | All of the above |

- Badge progress is visible in-app — shows which species you've found and which are still missing
- Motivates visitors to explore more of the park to complete collections
- Bonus: rare "behaviour badges" for scanning an animal doing something specific (e.g., "Toolmaker" — scan an orangutan using a stick)
- Leaderboard for friendly competition among families

### 4. RFID/NFC Tap Points with AR Animations

- Physical tap points at each exhibit (replacing/augmenting static signs)
- Tap phone → plays a short animated sequence on screen showing:
  - How the animal moves, hunts, or interacts in the wild
  - Its life story at the zoo (e.g., Charlie the orangutan's journey)
  - A conservation message with a specific call-to-action
- Animations are more engaging than text panels (addresses the "interesting visuals" factor)
- Works offline once downloaded, no data needed in park

---

## How It Meets the Criteria

| Criterion | How Our App Delivers |
|-----------|---------------------|
| Adapts to age/interest/learning style | Profile selection tailors narration complexity and content |
| Encourages deeper observation | Scanning requires focusing on the animal; collecting species badges motivates visiting more exhibits |
| Enhances conservation understanding | Every encounter ends with a bite-sized conservation fact + actionable CTA |
| Creates memorable experience | Species collection badges, AR animations, Field Journal, and a personalised post-visit report |

---

## Technical Architecture (AWS)

| Component | AWS Service |
|-----------|------------|
| Animal image recognition | Amazon Rekognition / Bedrock (Claude with vision) |
| Adaptive narration generation | Amazon Bedrock (Claude) |
| Text-to-speech | Amazon Polly |
| Location/proximity triggers | BLE beacons + AWS IoT Core |
| User profiles & progress | Amazon DynamoDB + Cognito |
| App backend / APIs | AWS Lambda + API Gateway |
| AR animation assets | Amazon S3 + CloudFront |
| Analytics (engagement tracking) | Amazon Kinesis + QuickSight |

---

## User Flow

```
Entry → Select Profile (age/accessibility)
  → Approach Exhibit → Audio narration auto-plays
    → Scan animal with camera → Popup shows species info card
      → Animal saved to Field Journal
      → Check: does this complete a species collection? → Earn badge!
    → Tap NFC point → Watch AR animation
      → Move to next exhibit...
Exit → Receive "My Safari Report" (animals scanned, badges earned, conservation pledge)
```

---

## Key Differentiators

1. **Reaches the 76% who skip signs** — audio/push narration doesn't require guests to stop and read
2. **Short bursts of engagement** — designed for the 17-second attention window, with optional deep-dives
3. **Family-first design** — parents and kids can play together on shared quests
4. **Accessibility built-in** — not an afterthought, a core profile option
5. **Data-driven iteration** — analytics on which exhibits get scanned/skipped lets Mandai continuously improve

---

## Next Steps

- [ ] Build prototype of audio guide with 1 exhibit (Orangutan)
- [ ] Train animal recognition model for Singapore Zoo species
- [ ] Design 3 badge trail routes
- [ ] Create sample AR animation for RFID tap point
- [ ] User test with families

---

## Implemented MVP: WildSight

WildSight is a voice-first Expo application for blind and low-vision visitors at Mandai Wildlife Reserve. A visitor points the rear camera at an animal, holds one large button while asking a question, releases it, and hears a concise description.

This repository contains two independently runnable TypeScript applications:

- `mobile/` — React Native, Expo SDK 57 and Expo Router
- `server/` — Node.js, Express, Amazon Bedrock and an OpenAI fallback
- `data/mandaiAnimals.json` — the canonical example set of approved animal facts

The highest-priority workflow is implemented end to end:

```text
hold button → record question → release → take one photo
            → upload both to server → transcribe → analyse with image + Mandai facts
            → return concise text → display and speak it
```

Follow-up questions send a new audio recording with the prior session ID. The server keeps the previous image and the latest conversation turns in memory for 30 minutes, so it does not need a second photograph.

## What works

- Welcome screen with explicit camera and microphone permission controls
- Rear-camera preview and one-photo capture
- Press-and-hold audio recording with Expo Audio
- Haptic start/stop feedback and spoken status cues
- Multipart upload to the Express API
- OpenAI speech transcription
- Amazon Bedrock image reasoning through the Converse API
- OpenAI vision as a configurable fallback
- Mandai-specific grounding for five example animals
- Automatic text-to-speech, replay, follow-up and retry
- Response length, speech speed and English/Indonesian settings
- System-selected Bluetooth or wired audio routing
- Honest, no-credentials demo mode with five bundled sample images
- Request validation, upload limits, timeouts and accessible error states
- Unit and API-boundary tests

## Important demo-mode limitation

The bundled demo is intentionally honest. With no cloud credentials, it cannot transcribe arbitrary speech. The visitor selects one of three accessible sample questions, then uses the same press-and-hold interaction. The answer is generated from the selected bundled image’s approved local facts, and the UI explicitly says that no AI identification was claimed.

This is not a hard-coded fake server success. The real camera/audio API returns a clear configuration error when its providers are unavailable.

## Prerequisites

- Node.js `20.19.4+` or `22.13.0+`
- npm
- Expo Go or an iOS/Android development build
- A physical phone for the real camera workflow
- AWS credentials with permission to call the chosen Bedrock model
- An OpenAI API key for speech transcription

The AWS SDK reads credentials from its normal server-side credential chain, such as `aws configure`, environment variables on the backend host, or an IAM role in AWS. Never add AWS credentials to `mobile/.env`.

## 1. Start the backend

Run these commands from the repository root:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Edit `server/.env` before starting:

```dotenv
PORT=4000
AI_PROVIDER=bedrock
TRANSCRIPTION_PROVIDER=openai
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
OPENAI_API_KEY=your_server_only_key
```

`AI_PROVIDER=bedrock` uses Amazon Bedrock for the animal image. `TRANSCRIPTION_PROVIDER=openai` uses OpenAI only to turn the uploaded question into text. This separation exists because image reasoning and speech transcription are different responsibilities.

To run the full fallback through OpenAI:

```dotenv
AI_PROVIDER=openai
OPENAI_VISION_MODEL=gpt-4.1-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe
```

Verify the server:

```bash
curl http://localhost:4000/health
```

A configured server reports `"ready": true`. An unconfigured server reports the exact missing variable and does not pretend to analyse anything.

## 2. Start the mobile app

Find your computer’s local network address. On macOS, one common command is:

```bash
ipconfig getifaddr en0
```

Create `mobile/.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:4000
```

Then run:

```bash
cd mobile
npm install
npm start
```

Scan the QR code with Expo Go. The phone and computer must be able to reach each other on the same network. `localhost` on the phone means the phone itself, so it normally cannot be used for the backend URL.

If `EXPO_PUBLIC_API_URL` is absent, choose **Try bundled demo** on the welcome screen.

## Bluetooth and external audio

WildSight deliberately does not implement Bluetooth pairing. Connect the JBL speaker, earphones, bone-conduction headphones, open-ear headphones or external microphone in the phone’s Bluetooth settings. Expo then uses the audio route selected by iOS or Android.

For the hackathon, connect the JBL before opening the demo and confirm it is the selected output device. Real visitors would usually choose a private listening device.

## Tests and verification

Backend:

```bash
cd server
npm run typecheck
npm test
npm run build
```

Mobile:

```bash
cd mobile
npm run typecheck
npx expo-doctor
```

Manual device checklist:

1. Grant camera and microphone permissions.
2. Confirm the rear-camera preview appears.
3. Hold the ask button and speak for at least one second.
4. Release and confirm haptic feedback plus “Taking picture” and “Analysing”.
5. Confirm the text appears and is spoken automatically.
6. Tap Replay.
7. Tap Ask follow-up, ask about the same animal and confirm no second image is required.
8. Connect and disconnect a Bluetooth speaker in system settings and confirm output follows the system route.
9. Turn on VoiceOver or TalkBack and navigate every control.
10. Stop the backend and confirm the app shows a recoverable error instead of a success response.

## Architecture

```text
Expo mobile app
  ├─ expo-camera: preview + one cached photograph
  ├─ expo-audio: cached question recording
  ├─ expo-speech: local spoken status and answer
  └─ HTTPS multipart request (no cloud credentials)
          │
          ▼
Express backend
  ├─ validates type, size, settings and session
  ├─ TranscriptionProvider → OpenAI transcription
  ├─ VisionProvider → Bedrock Converse or OpenAI Responses
  ├─ approved Mandai JSON grounding + strict safety prompt
  ├─ 70-word formatting guard
  └─ 30-minute in-memory follow-up session
```

The in-memory session store is appropriate for a hackathon but not for horizontally scaled production. A later version would use a short-lived encrypted object store for images and a shared TTL store such as Redis for conversation state, with explicit retention and deletion policies.

## Security and privacy notes

- The mobile bundle contains only `EXPO_PUBLIC_API_URL`; it contains no AI key or AWS credential.
- The backend disables the Express technology header.
- Uploads stay in memory and are limited to two files and 12 MB per file; images receive an additional 8 MB limit.
- Responses do not include raw image or audio data.
- The current server does not log media or transcripts.
- Follow-up images and text expire from process memory after 30 minutes.
- Production must use HTTPS, a narrow CORS origin, rate limiting, abuse monitoring and an explicit privacy/retention notice.
- WildSight is a descriptive aid, not a mobility aid. It must not be used to detect roads, steps, edges, barriers or hazards.

The data in this MVP is example grounding, not a final content-approval workflow. Mandai animal-care, conservation, accessibility and legal teams should review it before a real visitor deployment.

## Dependency audit note

`expo-doctor` passes all 18 SDK checks, and the backend audit is clean. As of this build, `npm audit --omit=dev` reports a moderate `uuid` advisory through Expo’s native `xcode` build-tool chain. npm offers only a forced breaking downgrade of Expo Splash Screen, so this repository does not apply that unsafe automated fix. Recheck after the next compatible Expo patch and upgrade through Expo’s supported version workflow.

## Project map

```text
data/mandaiAnimals.json              canonical approved-facts example
mobile/src/app/index.tsx             welcome and permissions
mobile/src/app/camera.tsx            capture, record, process and follow-up state machine
mobile/src/app/settings.tsx          accessibility preferences
mobile/src/services/api.ts           multipart backend client
mobile/src/data/demo-animals.ts      honest bundled-demo descriptions
server/src/app.ts                    HTTP routes and validation
server/src/providers/                Bedrock/OpenAI provider implementations
server/src/prompt.ts                 grounding and safety rules
server/src/formatResponse.ts         spoken-response cleanup and word cap
server/API.md                        request and response contract
```
