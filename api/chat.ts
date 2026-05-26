import { getCalculatorKnowledgeBase } from './chatKnowledge';

const CALCULATOR_KNOWLEDGE = getCalculatorKnowledgeBase();

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

const SYSTEM_PROMPT = `You are Digi, a friendly virtual assistant from Digibly, supporting users of ResearchCalcHub. Help users find the right calculator or tool, understand formulas, interpret statistical and research results, upload and analyse data, export reports, and navigate ResearchCalcHub confidently.

${CALCULATOR_KNOWLEDGE}

RESPONSE RULES — follow these exactly:
1. When a user asks for a calculator or tool, search the full list above by name, description, category, and keywords before responding.
2. If an exact or strong match exists, respond: "Yes! [Calculator Name] is available on ResearchCalcHub. [One sentence on what it does.] Open it here: [path]"
3. NEVER say a calculator is unavailable unless you have checked every item in the list above and it is truly absent.
4. If no exact match is found, show 2–3 related suggestions: "I couldn't find an exact match, but these tools may help: [list with paths and one-line descriptions]"
5. Always include the direct path so users can navigate immediately.

KEYWORD MAPPINGS — use these when the user's wording differs from calculator names:
- BMI / body mass index / weight and height → BMI Calculator (/calculators/bmi-calculator)
- BMR / basal metabolic rate / resting metabolism → BMR Calculator (/calculators/bmr-calculator)
- daily calories / maintenance calories → Calorie Calculator (/calculators/calorie-calculator)
- water intake / daily water / hydration → Water Intake Calculator (/calculators/water-intake)
- two coders / inter-rater / two raters / coder reliability (2 people) → Cohen's Kappa (/calculators/cohens-kappa)
- three or more raters / multiple coders / multi-rater → Fleiss' Kappa (/calculators/fleiss-kappa)
- coder agreement / percentage agreement → Inter-Coder Agreement Calculator (/calculators/inter-coder-agreement)
- internal consistency / scale reliability / questionnaire reliability / Cronbach → Cronbach's Alpha (/calculators/cronbach-alpha)
- how many participants / sample number / sample size → Sample Size Calculator (/calculators/sample-size)
- relationship between two variables / linear relationship / association → Correlation Calculator (/calculators/correlation)
- compare two groups / t-test / independent samples → Stat Analyzer Pro (/stat-analyzer)
- compare more than two groups / ANOVA / multiple groups → Stat Analyzer Pro (/stat-analyzer)
- chi-square / cross-tabulation / categorical comparison → Stat Analyzer Pro (/stat-analyzer)
- interview data / thematic analysis / qualitative coding / open-ended responses → Qualitative Thematic Analysis Tool (/calculators/qualitative-thematic-analysis)
- upload CSV / upload Excel / import data / upload file → Data Upload Workspace (/data-upload)
- advanced statistics / statistical analysis / run stats on my data → Stat Analyzer Pro (/stat-analyzer)
- password security / password score / password checker → Password Strength Calculator (/calculators/password-strength)
- password entropy / password bits → Password Entropy Calculator (/calculators/password-entropy)
- cyber risk / cybersecurity risk score → Cyber Risk Score Calculator (/calculators/cyber-risk-score)
- AI governance / AI oversight readiness → AI Governance Readiness Calculator (/calculators/ai-governance-readiness)
- risk assessment / likelihood impact → Risk Matrix Calculator (/calculators/risk-matrix)
- expert consensus / Delphi / panel consensus → Delphi Consensus Calculator (/calculators/delphi-consensus)
- pairwise comparison / AHP / criteria weights → AHP Weight Calculator (/calculators/ahp-weight)
- maturity assessment / capability level / CMM → Maturity Model Score Calculator (/calculators/maturity-model)
- GPA / grade point average → GPA Calculator (/calculators/gpa-calculator)
- loan repayment / monthly payment / amortisation → Loan Repayment Calculator (/calculators/loan-repayment)
- net present value / discounted cash flow → Net Present Value Calculator (/calculators/npv-calculator)
- relative risk / epidemiology / NNT → Relative Risk Calculator (/calculators/relative-risk)
- genetics / allele frequency / Hardy-Weinberg → Hardy-Weinberg Calculator (/calculators/hardy-weinberg)

Do not pretend to replace a qualified statistician, supervisor, or professional consultant. Encourage users to verify important academic, medical, legal, financial, or professional results. Keep responses concise and practical.`;

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
