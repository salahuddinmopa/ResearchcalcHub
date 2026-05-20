import React from 'react';

interface Step2Props {
  analysisResult: any;
}

export default function Step2Familiarisation({ analysisResult }: Step2Props) {
  if (!analysisResult) {
    return <p className="text-center text-gray-500">Run analysis to view familiarisation data.</p>;
  }

  const { wordCount, charCount, paragraphCount, readingTime, summary, topKeywords } = analysisResult;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Familiarisation Summary</h2>
      <ul className="list-disc list-inside">
        <li>Word count: {wordCount}</li>
        <li>Character count: {charCount}</li>
        <li>Paragraph/response count: {paragraphCount}</li>
        <li>Estimated reading time: {readingTime} min</li>
      </ul>
      <h3 className="text-xl font-medium mt-4">Automatic Summary</h3>
      <p className="bg-gray-50 p-3 rounded">{summary}</p>
      <h3 className="text-xl font-medium mt-4">Top Keywords</h3>
      <table className="min-w-full table-auto border">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Keyword</th>
            <th className="px-4 py-2">Count</th>
          </tr>
        </thead>
        <tbody>
          {topKeywords.map((kw: any, idx: number) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2">{kw.word}</td>
              <td className="px-4 py-2 text-center">{kw.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
