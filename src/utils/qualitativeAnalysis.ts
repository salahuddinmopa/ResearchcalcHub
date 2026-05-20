export const stopWords = new Set([
  'the', 'and', 'is', 'are', 'of', 'to', 'in', 'for', 'with', 'a', 'an', 'that', 'this', 'it', 'as', 'on', 'by', 'at', 'from', 'or', 'but', 'if', 'while', 'be', 'been', 'was', 'were', 'has', 'have', 'had', 'do', 'does', 'did'
]);

/**
 * Basic text statistics.
 */
export function getTextStats(text: string) {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);
  const chars = text.replace(/\s/g, '').length;
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
  return {
    wordCount: words.length,
    charCount: chars,
    paragraphCount: paragraphs,
    readingTimeMinutes: Math.ceil(words.length / 200) // assume 200 wpm
  };
}

/**
 * Return word frequency map (excluding stopwords) sorted descending.
 */
export function getWordFrequencies(text: string) {
  const freq: Record<string, number> = {};
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w && !stopWords.has(w));
  for (const w of words) {
    freq[w] = (freq[w] ?? 0) + 1;
  }
  const entries = Object.entries(freq).map(([word, count]) => ({
    word,
    count,
    percentage: (count / words.length) * 100
  }));
  entries.sort((a, b) => b.count - a.count);
  return entries;
}

/**
 * Very simple initial code suggestion: take top N frequent phrases (bi-grams).
 */
export function generateInitialCodes(text: string, topN = 10) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w && !stopWords.has(w));
  const phraseFreq: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    phraseFreq[phrase] = (phraseFreq[phrase] ?? 0) + 1;
  }
  const entries = Object.entries(phraseFreq)
    .map(([phrase, count]) => ({
      codeName: phrase,
      description: `Frequent phrase: "${phrase}"`,
      frequency: count,
      exampleQuote: ''
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, topN);
  return entries;
}
