export type ConversationTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export type ResponseLength = 'brief' | 'standard' | 'detailed';
export type SupportedLanguage = 'en-US' | 'id-ID';

export type AnalysisRequest = {
  image: Buffer;
  imageMimeType: string;
  question: string;
  conversation: ConversationTurn[];
  grounding: string;
  responseLength: ResponseLength;
  language: SupportedLanguage;
  isFollowUp: boolean;
};

export interface VisionProvider {
  readonly name: string;
  analyse(request: AnalysisRequest): Promise<string>;
}

export interface TranscriptionProvider {
  readonly name: string;
  transcribe(audio: Buffer, mimeType: string, language: SupportedLanguage): Promise<string>;
}

export type Session = {
  id: string;
  image: Buffer;
  imageMimeType: string;
  conversation: ConversationTurn[];
  updatedAt: number;
};

