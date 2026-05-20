interface ContactPayload {
  type?: 'contact' | 'error' | 'suggestion';
  subject?: string;
  replyTo?: string;
  fields?: Record<string, string>;
}

function json(response: any, status: number, body: { success: boolean; error?: string }) {
  return response.status(status).json(body);
}

function parsePayload(body: unknown): ContactPayload {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return (body || {}) as ContactPayload;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderEmail(payload: Required<ContactPayload>) {
  const rows = Object.entries(payload.fields)
    .map(([label, value]) => `
      <tr>
        <th style="text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;background:#f8fafc;width:220px;">${escapeHtml(label)}</th>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;white-space:pre-wrap;">${escapeHtml(value || 'Not provided')}</td>
      </tr>
    `)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
      <h1 style="font-size:20px;margin:0 0 16px;">${escapeHtml(payload.subject)}</h1>
      <p style="margin:0 0 16px;color:#475569;">Message type: ${escapeHtml(payload.type)}</p>
      <table style="border-collapse:collapse;width:100%;max-width:760px;border:1px solid #e2e8f0;">
        ${rows}
      </table>
    </div>
  `;
}

function formatProviderError(status: number, statusText: string, providerError: unknown) {
  const providerMessage = typeof providerError === 'object' && providerError !== null && 'message' in providerError
    ? String((providerError as { message?: unknown }).message)
    : '';
  const providerDetails = providerError
    ? JSON.stringify(providerError)
    : statusText;

  return providerMessage
    ? `Resend error ${status}: ${providerMessage}. Details: ${providerDetails}`
    : `Resend error ${status}: ${providerDetails}`;
}

function validatePayload(payload: ContactPayload) {
  if (!payload.type || !['contact', 'error', 'suggestion'].includes(payload.type)) {
    return 'Message type is missing or invalid.';
  }
  if (!payload.subject?.trim()) return 'Email subject is required.';
  if (!payload.replyTo?.trim()) return 'Reply-to email is required.';
  if (!payload.fields || typeof payload.fields !== 'object') return 'Message fields are required.';

  const requiredFields: Record<string, string[]> = {
    contact: ['Name', 'Email', 'Subject', 'Message'],
    error: ['Name', 'Email', 'Calculator/Page', 'Problem Type', 'Error Details'],
    suggestion: ['Name', 'Email', 'Suggested Calculator Name', 'Category', 'Why it is useful'],
  };

  for (const field of requiredFields[payload.type]) {
    if (!payload.fields[field]?.trim()) return `${field} is required.`;
  }

  return null;
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[contact] Missing RESEND_API_KEY environment variable.');
      return json(response, 500, { success: false, error: 'Email service is not configured. Missing RESEND_API_KEY.' });
    }

    const payload = parsePayload(request.body);
    const validationError = validatePayload(payload);
    if (validationError) {
      console.error('[contact] Validation error:', validationError, payload);
      return json(response, 400, { success: false, error: validationError });
    }

    const validPayload = payload as Required<ContactPayload>;
    const to = process.env.CONTACT_EMAIL || 'recalhub@gmail.com';
    const from = 'ResearchCalcHub <reports@researchcalchub.com>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: validPayload.replyTo,
        subject: validPayload.subject,
        html: renderEmail(validPayload),
        text: Object.entries(validPayload.fields)
          .map(([label, value]) => `${label}: ${value || 'Not provided'}`)
          .join('\n'),
      }),
    });

    if (!resendResponse.ok) {
      const providerError = await resendResponse.json().catch(() => null);
      const errorMessage = formatProviderError(resendResponse.status, resendResponse.statusText, providerError);
      console.error('[contact] Resend error:', errorMessage);
      return json(response, 502, {
        success: false,
        error: errorMessage,
      });
    }

    return json(response, 200, { success: true });
  } catch (error) {
    console.error('[contact] Unexpected error:', error);
    return json(response, 500, { success: false, error: 'Unexpected server error while sending email.' });
  }
}
