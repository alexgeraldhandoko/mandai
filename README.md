# AWS Hackathon for Mandai Wildlife Group (Team 7)

Guest Data and Interpretives Study Results: https://drive.google.com/file/d/1dod3GOczgv_BxictYbQ3uNPjULkPjQTf/view

## Challenge Statement

How might you use KIRO to create a personalised, AI-powered experience at a zoo exhibit that helps guests connect more deeply with animals and inspire greater appreciation for wildlife and nature?

**Brainstorming of solutions**
- new mobile app which serves as an audio guide to visitors, including those with visual impairment
- visitors can tailor the complexity of their audio guide based on their age.
- visitors can scan animals and have to follow a specific path to attain badges, similar to Pokemon Go.
- visitors can scan images of the animals at the echibit so that they can view animations of the animal which encapsulate the information of the exhibits. (Image-Based AR / Marker-Based AR)

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

