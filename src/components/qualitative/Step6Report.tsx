import React from 'react';
import ResultSection from './../visualizations/ResultSection';
import BarChartResult from './../visualizations/BarChartResult';

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

  const codeChartData = codes.map((c) => ({
    name: c.name,
    value: c.frequency || 0,
  }));

  return (
    <div className="space-y-6" id="report-content">
      <h2 className="text-2xl font-semibold mb-2">Step 6 – Report</h2>
      <section className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-indigo-900 border-b pb-2">Project Overview</h3>
        <div className="grid grid-cols-1 gap-2">
          <p><strong>Title:</strong> {projectTitle || '-'} </p>
          <p><strong>Research Question:</strong> {researchQuestion || '-'} </p>
          <p><strong>Data Type:</strong> {dataType}</p>
        </div>
      </section>
      {analysisResult && (
        <section className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-indigo-900 border-b pb-2">Familiarisation Summary</h3>
          <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
        </section>
      )}

      {codes.length > 0 && (
        <ResultSection
          title="Code Frequencies"
          visual={<BarChartResult data={codeChartData} title="" xKey="name" yKey="value" barColor="#4f46e5" />}
          interpretation="The chart above shows the frequency of each code identified in the dataset."
        />
      )}

      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-indigo-900 border-b pb-2">Codes Summary</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {codes.map((c, i) => (
            <li key={i}><span className="font-semibold">{c.name}</span> (Frequency: {c.frequency})</li>
          ))}
        </ul>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-indigo-900 border-b pb-2">Categories</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {categories.map((cat, i) => (
            <li key={i}>{cat.name}</li>
          ))}
        </ul>
      </section>
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-indigo-900 border-b pb-2">Themes</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {themes.map((t, i) => (
            <li key={i}><span className="font-semibold">{t.name}</span> – Strength: {t.strength}</li>
          ))}
        </ul>
      </section>

      {/* Exclude these buttons from PDF by rendering them outside #report-content or hiding them during print */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t html2pdf__ignore" data-html2canvas-ignore>
        <button className="btn-primary" onClick={generatePDF}>Download PDF Report</button>
        <button className="btn-secondary" onClick={() => exportCSV(codes, 'codes.csv')}>Export Codes (CSV)</button>
        <button className="btn-secondary" onClick={() => exportCSV(themes, 'themes.csv')}>Export Themes (CSV)</button>
      </div>
    </div>
  );
}
