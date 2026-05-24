import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  resultId: string; // unique id for copy/export
}

export function ResultCard({ title, children, resultId }: ResultCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm mb-4" id={resultId}>
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
      <div className="mt-2 flex space-x-2">
        <button
          type="button"
          onClick={() => {
            const element = document.getElementById(resultId);
            const text = element?.innerText ?? '';
            navigator.clipboard.writeText(text);
          }}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={() => {
            const element = document.createElement('div');
            element.innerHTML = document.getElementById(resultId)?.innerHTML || '';
            // @ts-ignore
            window.html2pdf().from(element).save();
          }}
          className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
