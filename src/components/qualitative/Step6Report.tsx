import React from 'react';

interface Props {
  projectTitle: string;
  researchQuestion: string;
  dataType: string;
  rawText: string;
  analysisResult: any;
  codes: any[];
  categories: any[];
  themes: any[];
  // additional shared props can be passed via rest
  [key: string]: any;
}

export default function Step6Report({ projectTitle, researchQuestion, dataType, rawText, analysisResult, codes, categories, themes }: Props) {
  const generatePDF = () => {
    // Dynamically import html2pdf to avoid SSR issues
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('report-content');
      if (element) {
        html2pdf.default().from(element).save(`${projectTitle || 'report'}.pdf`);
      }
    });
  };

  const exportCSV = (data: any[], filename: string) => {
    const csvContent = data
      .map((row) => Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    import('file-saver').then((module) => {
      module.saveAs(blob, filename);
    });
  };

  return (
    <div className="space-y-4" id="report-content">
      <h2 className="text-2xl font-semibold mb-2">Step 6 – Report</h2>
      <section className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold">Project Overview</h3>
        <p><strong>Title:</strong> {projectTitle || '-'} </p>
        <p><strong>Research Question:</strong> {researchQuestion || '-'} </p>
        <p><strong>Data Type:</strong> {dataType}</p>
      </section>
      {analysisResult && (
        <section className="bg-gray-50 p-4 rounded">
          <h3 className="font-bold">Familiarisation Summary</h3>
          <p>{analysisResult.summary}</p>
        </section>
      )}
      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Codes</h3>
        <ul className="list-disc pl-5">
          {codes.map((c, i) => (
            <li key={i}>{c.name} (Freq: {c.frequency})</li>
          ))}
        </ul>
      </section>
      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Categories</h3>
        <ul className="list-disc pl-5">
          {categories.map((cat, i) => (
            <li key={i}>{cat.name}</li>
          ))}
        </ul>
      </section>
      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Themes</h3>
        <ul className="list-disc pl-5">
          {themes.map((t, i) => (
            <li key={i}>{t.name} – {t.strength}</li>
          ))}
        </ul>
      </section>
      <div className="flex space-x-2 mt-4">
        <button className="btn-primary" onClick={generatePDF}>Download PDF</button>
        <button className="btn-primary" onClick={() => exportCSV(codes, 'codes.csv')}>Export Codes CSV</button>
        <button className="btn-primary" onClick={() => exportCSV(themes, 'themes.csv')}>Export Themes CSV</button>
      </div>
    </div>
  );
}
