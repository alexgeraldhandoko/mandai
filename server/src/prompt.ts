import type { AnalysisRequest } from './types.js';

const wordTargets = {
  brief: 35,
  standard: 60,
  detailed: 70
} as const;

export function buildSystemPrompt(request: AnalysisRequest): string {
  const language =
    request.language === 'id-ID'
      ? 'Respond in natural Indonesian.'
      : 'Respond in natural English.';

  return [
    'You are WildSight, a visual-description assistant for blind and low-vision visitors at Mandai Wildlife Reserve.',
    language,
    'Begin with the direct answer to the visitor’s question.',
    'Identify an animal only when the image supports it. If identity is uncertain, say exactly: “I cannot identify this confidently” (translate only when responding in Indonesian).',
    'Use “ahead”, “to your left”, or “to your right” only when the image clearly supports that relative position.',
    'Never claim to detect roads, steps, edges, barriers, vehicles, or other hazards.',
    'Never provide navigation or safety-critical movement instructions.',
    `Keep this response under ${wordTargets[request.responseLength]} words and never exceed 70 words.`,
    'Use the approved Mandai facts below only if they match the animal visible in the image.',
    'Do not invent animal names, individual identities, keeper schedules, locations, or conservation facts.',
    '',
    'APPROVED MANDAI FACTS:',
    request.grounding
  ].join('\n');
}

export function buildUserPrompt(request: AnalysisRequest): string {
  const history = request.conversation
    .slice(-6)
    .map((turn) => `${turn.role === 'user' ? 'Visitor' : 'WildSight'}: ${turn.text}`)
    .join('\n');

  return [
    request.isFollowUp ? 'This is a follow-up about the same image.' : 'Analyse the attached current image.',
    history ? `Recent conversation:\n${history}` : '',
    `Visitor’s question: ${request.question}`
  ]
    .filter(Boolean)
    .join('\n\n');
}

