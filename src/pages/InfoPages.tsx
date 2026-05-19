import { Link } from 'react-router-dom';
import { AlertTriangle, Bug, FileText, Lightbulb, Mail, ShieldCheck } from 'lucide-react';
import { useSEO } from '../utils/seo';

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
  type = 'text',
  textarea = false,
  placeholder,
}: {
  label: string;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea ? (
        <textarea className="input-field min-h-36 resize-y" placeholder={placeholder} />
      ) : (
        <input type={type} className="input-field" placeholder={placeholder} />
      )}
    </div>
  );
}

function StaticForm({ kind }: { kind: 'contact' | 'suggest' | 'report' }) {
  const subjectPlaceholder = kind === 'suggest'
    ? 'e.g. Power analysis calculator'
    : kind === 'report'
      ? 'e.g. Incorrect result in Cohen\'s Kappa'
      : 'How can we help?';
  const messagePlaceholder = kind === 'suggest'
    ? 'Describe the calculator, inputs, outputs, and why it would be useful.'
    : kind === 'report'
      ? 'Tell us the calculator name, what went wrong, expected result, and steps to reproduce.'
      : 'Write your message here.';

  return (
    <div className="card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name" placeholder="Your name" />
        <FormField label="Email" type="email" placeholder="you@example.com" />
      </div>
      <div className="mt-4">
        <FormField label={kind === 'suggest' ? 'Calculator idea' : 'Subject'} placeholder={subjectPlaceholder} />
      </div>
      <div className="mt-4">
        <FormField label="Message" textarea placeholder={messagePlaceholder} />
      </div>
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        This first version provides the form layout only. Connect it to email, a database, or a form service before collecting submissions.
      </div>
      <button type="button" className="btn-primary mt-5">Submit</button>
    </div>
  );
}

export function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Use this simple contact form layout for questions, feedback, partnerships, or general ResearchCalcHub enquiries."
      icon={Mail}
    >
      <StaticForm kind="contact" />
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
      <StaticForm kind="suggest" />
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
      <StaticForm kind="report" />
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
