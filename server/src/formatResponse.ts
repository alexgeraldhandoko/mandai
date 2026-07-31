const UNCERTAIN = 'I cannot identify this confidently.';
const unsafeNavigation =
  /\b(?:walk|move|turn|cross|proceed|go)\s+(?:forward|backward|left|right|ahead|toward|towards|across)\b|\b(?:take|go)\s+\d+\s+steps?\b|\b(?:jalan|maju|mundur|belok|menyeberang)\s+(?:ke\s+)?(?:depan|belakang|kiri|kanan)\b|\b\d+\s+langkah\b/iu;
const unsafeHazardClaim =
  /\b(?:road|steps?|stairs?|edge|barrier|vehicles?|jalan|tangga|tepi|penghalang|kendaraan)\b.{0,35}\b(?:safe|clear|free|detected|aman|kosong|terdeteksi)\b/iu;

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}

function firstTextBlock(text: string): string {
  return text
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/^#+\s*/gmu, '')
    .replace(/^\s*[-*]\s+/gmu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function formatResponse(
  raw: string,
  maximumWords = 70,
  language: 'en-US' | 'id-ID' = 'en-US'
): string {
  const cleaned = firstTextBlock(raw);
  if (!cleaned) {
    return language === 'id-ID'
      ? 'Saya tidak dapat mengidentifikasi ini dengan yakin.'
      : UNCERTAIN;
  }

  if (unsafeNavigation.test(cleaned) || unsafeHazardClaim.test(cleaned)) {
    return language === 'id-ID'
      ? 'Saya dapat mendeskripsikan satwa atau pameran, tetapi tidak dapat memberikan petunjuk arah atau informasi bahaya.'
      : 'I can describe the animal or exhibit, but I cannot provide navigation or hazard guidance.';
  }

  const words = cleaned.split(/\s+/u);
  if (words.length <= maximumWords) {
    return cleaned;
  }

  const clipped = words.slice(0, maximumWords).join(' ');
  const lastSentenceEnd = Math.max(
    clipped.lastIndexOf('.'),
    clipped.lastIndexOf('!'),
    clipped.lastIndexOf('?')
  );

  if (lastSentenceEnd >= Math.floor(clipped.length * 0.55)) {
    return clipped.slice(0, lastSentenceEnd + 1);
  }

  return `${clipped.replace(/[,:;.!?]+$/u, '')}…`;
}
