import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bug, CheckCircle2, FileText, Lightbulb, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useSEO } from '../utils/seo';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formspreeEndpoint(kind: 'error' | 'suggest') {
  return kind === 'error'
    ? import.meta.env.VITE_FORMSPREE_ERROR_ENDPOINT
    : import.meta.env.VITE_FORMSPREE_SUGGEST_ENDPOINT;
}

async function submitToFormspree(endpoint: string, formData: FormData) {
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.errors?.[0]?.message || 'Submission failed. Please try again.';
    throw new Error(message);
  }
}

function PageShell({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  useSEO(`${title} | ResearchCalcHub`, subtitle);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 mb-4">
            <Icon className="w-4 h-4" />
            ResearchCalcHub
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{title}</h1>
          <p className="text-slate-600 leading-relaxed text-lg">{subtitle}</p>
        </div>
      </section>
      <section className="section">
        <div className="max-w-4xl mx-auto">{children}</div>
      </section>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  textarea = false,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}{required && <span className="text-red-500"> *</span>}</label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="input-field min-h-36 resize-y"
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="input-field"
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}

function StatusMessage({ status, message }: { status: SubmitState; message: string }) {
  if (status === 'idle' || status === 'loading') return null;
  const isSuccess = status === 'success';
  return (
    <div className={`mt-5 rounded-xl border p-4 text-sm ${isSuccess ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
      <div className="flex items-start gap-2">
        {isSuccess ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
        <span>{message}</span>
      </div>
    </div>
  );
}

function EndpointNotice({ endpoint, label }: { endpoint: string | undefined; label: string }) {
  if (endpoint) return null;
  return (
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Email sending is not configured yet. Add <code className="font-mono">{label}</code> to your environment variables with your Formspree endpoint before deploying.
    </div>
  );
}

function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('error');
    setStatusMessage('Contact email delivery is not configured for this form yet. Please use Report an Error or Suggest a Calculator for routed submissions.');
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name" name="contact_name" value={values.name} onChange={name => setValues(current => ({ ...current, name }))} placeholder="Your name" required />
        <FormField label="Email" name="contact_email" type="email" value={values.email} onChange={email => setValues(current => ({ ...current, email }))} placeholder="you@example.com" required />
      </div>
      <div className="mt-4">
        <FormField label="Subject" name="contact_subject" value={values.subject} onChange={subject => setValues(current => ({ ...current, subject }))} placeholder="How can we help?" required />
      </div>
      <div className="mt-4">
        <FormField label="Message" name="contact_message" textarea value={values.message} onChange={message => setValues(current => ({ ...current, message }))} placeholder="Write your message here." required />
      </div>
      <button type="submit" className="btn-primary mt-5">Submit</button>
      <StatusMessage status={status} message={statusMessage} />
    </form>
  );
}

export function ErrorReportForm() {
  const endpoint = formspreeEndpoint('error');
  const [values, setValues] = useState({
    name: '',
    email: '',
    calculatorPage: '',
    problemType: 'Wrong calculation',
    errorDetails: '',
    expectedResult: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [status, setStatus] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const update = (key: keyof typeof values, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) return setStatusMessage('Name is required.'), setStatus('error');
    if (!emailPattern.test(values.email)) return setStatusMessage('Enter a valid email address.'), setStatus('error');
    if (!values.calculatorPage.trim()) return setStatusMessage('Calculator name or page URL is required.'), setStatus('error');
    if (!values.errorDetails.trim()) return setStatusMessage('Error details are required.'), setStatus('error');
    if (!endpoint) return setStatusMessage('Email sending is not configured yet. Add VITE_FORMSPREE_ERROR_ENDPOINT to your environment variables.'), setStatus('error');

    const submittedAt = new Date().toLocaleString();
    const subject = `ResearchCalcHub Error Report: ${values.calculatorPage}`;
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Calculator/Page: ${values.calculatorPage}`,
      `Problem Type: ${values.problemType}`,
      `Error Details: ${values.errorDetails}`,
      `Expected Correct Result: ${values.expectedResult || 'Not provided'}`,
      `Date/time submitted: ${submittedAt}`,
    ].join('\n');

    const formData = new FormData();
    formData.append('_subject', subject);
    formData.append('message_type', 'Error Report');
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('calculator_or_page', values.calculatorPage);
    formData.append('problem_type', values.problemType);
    formData.append('error_details', values.errorDetails);
    formData.append('expected_correct_result', values.expectedResult || 'Not provided');
    formData.append('submitted_at', submittedAt);
    formData.append('message', body);
    if (screenshot) formData.append('screenshot', screenshot);

    try {
      setStatus('loading');
      await submitToFormspree(endpoint, formData);
      setStatus('success');
      setStatusMessage('Thank you. Your error report has been submitted successfully.');
      setValues({ name: '', email: '', calculatorPage: '', problemType: 'Wrong calculation', errorDetails: '', expectedResult: '' });
      setScreenshot(null);
      event.currentTarget.reset();
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <EndpointNotice endpoint={endpoint} label="VITE_FORMSPREE_ERROR_ENDPOINT" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name" name="error_name" value={values.name} onChange={value => update('name', value)} placeholder="Your name" required />
        <FormField label="Email" name="error_email" type="email" value={values.email} onChange={value => update('email', value)} placeholder="you@example.com" required />
      </div>
      <div className="mt-4">
        <FormField label="Calculator name or page URL" name="calculator_page" value={values.calculatorPage} onChange={value => update('calculatorPage', value)} placeholder="e.g. Cohen's Kappa or /calculators/cohens-kappa" required />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="problem_type">Type of problem <span className="text-red-500">*</span></label>
        <select id="problem_type" className="input-field" value={values.problemType} onChange={event => update('problemType', event.target.value)}>
          {['Wrong calculation', 'Formula issue', 'Typing/spelling mistake', 'Button not working', 'PDF/export issue', 'Website display problem', 'Other'].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <FormField label="Error details" name="error_details" textarea value={values.errorDetails} onChange={value => update('errorDetails', value)} placeholder="Describe what happened, including inputs and actual result if possible." required />
      </div>
      <div className="mt-4">
        <FormField label="Expected correct result (optional)" name="expected_result" textarea value={values.expectedResult} onChange={value => update('expectedResult', value)} placeholder="Tell us what you expected the correct result to be." />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="screenshot">Screenshot upload (optional)</label>
        <input id="screenshot" type="file" accept="image/*,.pdf" className="input-field" onChange={event => setScreenshot(event.target.files?.[0] || null)} />
      </div>
      <button type="submit" disabled={status === 'loading'} className="btn-primary mt-5 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'loading' ? 'Submitting...' : 'Submit Error Report'}
      </button>
      <StatusMessage status={status} message={statusMessage} />
    </form>
  );
}

export function CalculatorSuggestionForm() {
  const endpoint = formspreeEndpoint('suggest');
  const [values, setValues] = useState({
    name: '',
    email: '',
    calculatorName: '',
    category: 'Research Methodology',
    usefulness: '',
    formula: '',
    example: '',
  });
  const [status, setStatus] = useState<SubmitState>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const update = (key: keyof typeof values, value: string) => {
    setValues(current => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) return setStatusMessage('Name is required.'), setStatus('error');
    if (!emailPattern.test(values.email)) return setStatusMessage('Enter a valid email address.'), setStatus('error');
    if (!values.calculatorName.trim()) return setStatusMessage('Suggested calculator name is required.'), setStatus('error');
    if (!values.usefulness.trim()) return setStatusMessage('Please explain why this calculator is useful.'), setStatus('error');
    if (!endpoint) return setStatusMessage('Email sending is not configured yet. Add VITE_FORMSPREE_SUGGEST_ENDPOINT to your environment variables.'), setStatus('error');

    const submittedAt = new Date().toLocaleString();
    const subject = `ResearchCalcHub New Calculator Suggestion: ${values.calculatorName}`;
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Suggested Calculator Name: ${values.calculatorName}`,
      `Category: ${values.category}`,
      `Why it is useful: ${values.usefulness}`,
      `Formula or method: ${values.formula || 'Not provided'}`,
      `Example calculation: ${values.example || 'Not provided'}`,
      `Date/time submitted: ${submittedAt}`,
    ].join('\n');

    const formData = new FormData();
    formData.append('_subject', subject);
    formData.append('message_type', 'Calculator Suggestion');
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('suggested_calculator_name', values.calculatorName);
    formData.append('category', values.category);
    formData.append('why_useful', values.usefulness);
    formData.append('formula_or_method', values.formula || 'Not provided');
    formData.append('example_calculation', values.example || 'Not provided');
    formData.append('submitted_at', submittedAt);
    formData.append('message', body);

    try {
      setStatus('loading');
      await submitToFormspree(endpoint, formData);
      setStatus('success');
      setStatusMessage('Thank you. Your calculator suggestion has been submitted successfully.');
      setValues({ name: '', email: '', calculatorName: '', category: 'Research Methodology', usefulness: '', formula: '', example: '' });
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <EndpointNotice endpoint={endpoint} label="VITE_FORMSPREE_SUGGEST_ENDPOINT" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name" name="suggest_name" value={values.name} onChange={value => update('name', value)} placeholder="Your name" required />
        <FormField label="Email" name="suggest_email" type="email" value={values.email} onChange={value => update('email', value)} placeholder="you@example.com" required />
      </div>
      <div className="mt-4">
        <FormField label="Suggested calculator name" name="suggested_calculator_name" value={values.calculatorName} onChange={value => update('calculatorName', value)} placeholder="e.g. Statistical power calculator" required />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="calculator_category">Calculator category <span className="text-red-500">*</span></label>
        <select id="calculator_category" className="input-field" value={values.category} onChange={event => update('category', event.target.value)}>
          {['Research Methodology', 'Statistics', 'Social Science', 'Math', 'Physics', 'Chemistry', 'Biology / Health', 'Finance', 'Cybersecurity', 'Education', 'Everyday Life', 'Other'].map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <FormField label="Why this calculator is useful" name="why_useful" textarea value={values.usefulness} onChange={value => update('usefulness', value)} placeholder="Explain who would use it and what problem it solves." required />
      </div>
      <div className="mt-4">
        <FormField label="Formula or method (optional)" name="formula_method" textarea value={values.formula} onChange={value => update('formula', value)} placeholder="Include the formula, method, or source if you know it." />
      </div>
      <div className="mt-4">
        <FormField label="Example calculation (optional)" name="example_calculation" textarea value={values.example} onChange={value => update('example', value)} placeholder="Share sample inputs and expected output if available." />
      </div>
      <button type="submit" disabled={status === 'loading'} className="btn-primary mt-5 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'loading' ? 'Submitting...' : 'Submit Calculator Suggestion'}
      </button>
      <StatusMessage status={status} message={statusMessage} />
    </form>
  );
}

export function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Use this simple contact form layout for questions, feedback, partnerships, or general ResearchCalcHub enquiries."
      icon={Mail}
    >
      <ContactForm />
    </PageShell>
  );
}

export function PrivacyPolicyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      subtitle="A clear first-version privacy policy for an educational calculator website."
      icon={ShieldCheck}
    >
      <div className="card prose prose-slate max-w-none">
        <p>
          ResearchCalcHub is designed as a client-side educational calculator platform. In the first version, the calculator tools do not require accounts and are not intended to collect sensitive personal data.
        </p>
        <h2>Calculator Inputs</h2>
        <p>
          Values entered into calculators are processed in the browser to produce results, steps, interpretations, and downloadable reports. Users should avoid entering sensitive personal, medical, financial, legal, security, or confidential organisational information.
        </p>
        <h2>Forms</h2>
        <p>
          If users submit a contact, suggestion, or error report form after those forms are connected to a backend or form service, the submitted name, email address, subject, and message may be received for the purpose of responding to the request.
        </p>
        <h2>Local Storage</h2>
        <p>
          Some interface preferences and recent calculation summaries may be stored locally in the user&apos;s browser. This helps improve usability and does not require an account.
        </p>
        <h2>Third Parties</h2>
        <p>
          If analytics, hosting logs, or form services are added later, their privacy practices should be reviewed and disclosed here before deployment.
        </p>
      </div>
    </PageShell>
  );
}

export function TermsOfUsePage() {
  return (
    <PageShell
      title="Terms of Use"
      subtitle="ResearchCalcHub is an educational tool. Users remain responsible for verifying outputs before relying on them."
      icon={FileText}
    >
      <div className="card prose prose-slate max-w-none">
        <h2>Educational Use</h2>
        <p>
          ResearchCalcHub provides calculators, formulas, explanations, and report text for learning, planning, and preliminary analysis.
        </p>
        <h2>User Responsibility</h2>
        <p>
          Users are responsible for checking calculator inputs, assumptions, formulas, and outputs before using results in academic, professional, financial, health, legal, cybersecurity, public sector, or other high-impact contexts.
        </p>
        <h2>No Professional Advice</h2>
        <p>
          Results do not replace professional statistical advice, academic supervision, financial advice, medical guidance, legal advice, cybersecurity audits, or formal organisational review.
        </p>
        <h2>Acceptable Use</h2>
        <p>
          Do not use the site to process confidential or sensitive information unless the deployment has been reviewed and approved for that purpose.
        </p>
      </div>
    </PageShell>
  );
}

export function DisclaimerPage() {
  return (
    <PageShell
      title="Disclaimer"
      subtitle="All calculators are provided for educational and informational purposes only."
      icon={AlertTriangle}
    >
      <div className="card prose prose-slate max-w-none">
        <p>
          ResearchCalcHub calculators are intended to help users learn formulas, explore scenarios, and prepare draft academic or professional reporting text.
        </p>
        <p>
          Calculator results should be independently verified before academic submission, publication, assessment, operational use, or professional decision-making.
        </p>
        <p>
          The platform may include simplified models, assumptions, approximations, or educational interpretations. Users should confirm that each calculator is appropriate for their data, study design, context, and reporting requirements.
        </p>
        <p>
          For high-stakes applications, consult a qualified professional, supervisor, statistician, domain expert, or relevant institutional guidance.
        </p>
      </div>
    </PageShell>
  );
}

export function SuggestCalculatorPage() {
  return (
    <PageShell
      title="Suggest a Calculator"
      subtitle="Share calculator ideas that would help students, researchers, teachers, professionals, or everyday users."
      icon={Lightbulb}
    >
      <CalculatorSuggestionForm />
      <div className="mt-6 text-sm text-slate-500">
        Useful suggestions include the calculator name, target users, required inputs, expected outputs, formula source, and example data.
      </div>
    </PageShell>
  );
}

export function ReportErrorPage() {
  return (
    <PageShell
      title="Report an Error"
      subtitle="Report wrong formulas, bugs, spelling mistakes, broken links, unclear explanations, or incorrect results."
      icon={Bug}
    >
      <ErrorReportForm />
      <div className="mt-6 text-sm text-slate-500">
        The most helpful reports include the calculator name, input values, actual result, expected result, and any formula or source you used for comparison.
      </div>
    </PageShell>
  );
}

export function HelpLinksPage() {
  return (
    <PageShell
      title="Help and Site Information"
      subtitle="Find support, policy, feedback, and reporting pages for ResearchCalcHub."
      icon={FileText}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ['/contact', 'Contact'],
          ['/privacy', 'Privacy Policy'],
          ['/terms', 'Terms of Use'],
          ['/disclaimer', 'Disclaimer'],
          ['/suggest-calculator', 'Suggest a Calculator'],
          ['/report-error', 'Report an Error'],
        ].map(([to, label]) => (
          <Link key={to} to={to} className="card hover:border-indigo-200 hover:shadow-md transition-all">
            <span className="font-semibold text-slate-900">{label}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
