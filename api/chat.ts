interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message?: unknown;
  pageUrl?: unknown;
  calculatorName?: unknown;
  resultSummary?: unknown;
  history?: unknown;
}

// Simple in-memory rate limit — resets on cold start.
// Replace with Redis-backed store (e.g. Upstash) for production rate limiting.
const ipCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_OUTPUT_TOKENS = 600;
const HISTORY_LIMIT = 10;

const SYSTEM_PROMPT = `You are Digi, a friendly virtual assistant from Digibly, supporting users of ResearchCalcHub. Help users find appropriate calculators, understand formulas, interpret statistical and research results, upload and analyse data, export reports, and navigate ResearchCalcHub confidently.

Available calculators on ResearchCalcHub:
- Cohen's Kappa (/calculators/cohens-kappa): inter-rater reliability for categorical data
- Fleiss' Kappa (/calculators/fleiss-kappa): multi-rater reliability
- Cronbach's Alpha (/calculators/cronbach-alpha): internal consistency of a scale
- Sample Size (/calculators/sample-size): determine required sample size
- Likert Scale (/calculators/likert-scale): analyse survey Likert data
- Correlation (/calculators/correlation): Pearson and Spearman correlation
- Standard Deviation (/calculators/standard-deviation): measure data spread
- Mean / Median / Mode (/calculators/mean-median-mode): descriptive statistics
- Z-Score (/calculators/z-score): standardise values
- Confidence Interval (/calculators/confidence-interval): estimate population parameters
- Maturity Model Score (/calculators/maturity-model): organisational maturity
- AHP Weight (/calculators/ahp-weight): Analytic Hierarchy Process weighting
- Delphi Consensus (/calculators/delphi-consensus): expert consensus measurement
- Risk Matrix (/calculators/risk-matrix): risk likelihood × impact
- Decision Matrix (/calculators/decision-matrix): weighted decision making
- Weighted Scoring (/calculators/weighted-scoring): score and rank options
- Survey Response Rate (/calculators/survey-response-rate): response rate calculation
- Inter-Coder Agreement (/calculators/inter-coder-agreement): coder agreement stats
- Qualitative Thematic Analysis (/calculators/qualitative-thematic-analysis): guided thematic analysis
- Data Upload Workspace (/data-upload): upload CSV or Excel data for analysis
- Stat Analyzer (/stat-analyzer): advanced statistical analysis of uploaded data

Do not pretend to replace a qualified statistician, supervisor, or professional consultant. Encourage users to verify important academic, medical, legal, financial, or professional results. Keep responses concise and practical. When recommending calculators, include the page path so users can navigate directly.`;

function getClientIp(request: any): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return request.headers['x-real-ip'] || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

function parseBody(raw: unknown): ChatRequestBody {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return (raw || {}) as ChatRequestBody;
}

function isValidHistoryEntry(entry: unknown): entry is HistoryEntry {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'role' in entry &&
    'content' in entry &&
    (entry as any).role === 'user' || (entry as any).role === 'assistant' &&
    typeof (entry as any).content === 'string'
  );
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return response.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[chat] Missing OPENAI_API_KEY environment variable.');
      return response.status(500).json({ error: 'AI service is not configured. Please contact the site administrator.' });
    }

    const body = parseBody(request.body);
    const { message, pageUrl, calculatorName, resultSummary, history } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return response.status(400).json({ error: 'Message is required.' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return response.status(400).json({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` });
    }

    // Build context-aware instructions
    const contextParts: string[] = [];
    if (typeof pageUrl === 'string' && pageUrl.trim()) contextParts.push(`Current page: ${pageUrl.trim()}`);
    if (typeof calculatorName === 'string' && calculatorName.trim()) contextParts.push(`Calculator in use: ${calculatorName.trim()}`);
    if (typeof resultSummary === 'string' && resultSummary.trim()) contextParts.push(`Result summary: ${resultSummary.trim()}`);

    const instructions = contextParts.length > 0
      ? `${SYSTEM_PROMPT}\n\nUser context: ${contextParts.join(' | ')}`
      : SYSTEM_PROMPT;

    // Build input array from history + current message
    const inputMessages: HistoryEntry[] = [];

    if (Array.isArray(history)) {
      const validHistory = history.filter(isValidHistoryEntry).slice(-HISTORY_LIMIT);
      inputMessages.push(...validHistory);
    }

    inputMessages.push({ role: 'user', content: trimmedMessage });

    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        instructions,
        input: inputMessages,
        max_output_tokens: MAX_OUTPUT_TOKENS,
      }),
    });

    if (!openaiResponse.ok) {
      const errBody = await openaiResponse.json().catch(() => null);
      console.error('[chat] OpenAI error:', openaiResponse.status, JSON.stringify(errBody));
      return response.status(502).json({ error: 'AI service error. Please try again in a moment.' });
    }

    const data = await openaiResponse.json();

    const assistantMessage: string =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      '';

    if (!assistantMessage.trim()) {
      console.error('[chat] Empty response from OpenAI:', JSON.stringify(data));
      return response.status(502).json({ error: 'Received an empty response from the AI service. Please try again.' });
    }

    return response.status(200).json({ message: assistantMessage });
  } catch (error) {
    console.error('[chat] Unexpected error:', error);
    return response.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
}
