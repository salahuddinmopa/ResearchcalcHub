import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface Props {
  title?: string;
  faqs: FAQ[];
}

export function FAQSection({ title = 'Frequently Asked Questions', faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section className="section bg-white">
      <div className="container max-w-4xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          {title}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-900">{faq.question}</span>
                {openIndex === index ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
