import React from 'react';

interface Step1InputProps {
  projectTitle: string;
  setProjectTitle: React.Dispatch<React.SetStateAction<string>>;
  researchQuestion: string;
  setResearchQuestion: React.Dispatch<React.SetStateAction<string>>;
  dataType: string;
  setDataType: React.Dispatch<React.SetStateAction<string>>;
  rawText: string;
  setRawText: React.Dispatch<React.SetStateAction<string>>;
  handleAnalyse: () => void;
  resetAll: () => void;
}

export default function Step1Input({
  projectTitle,
  setProjectTitle,
  researchQuestion,
  setResearchQuestion,
  dataType,
  setDataType,
  rawText,
  setRawText,
  handleAnalyse,
  resetAll,
}: Step1InputProps) {
  const dataOptions = [
    'Interview transcript',
    'Focus group transcript',
    'Open-ended survey response',
    'Policy document',
    'Field notes',
    'Other',
  ];

  const loadExample = () => {
    const example = `Interviewer: How do you feel about the new policy?
Participant: I think it could improve transparency, but there are concerns about data privacy.
Interviewer: What aspects of data privacy worry you?
Participant: The way the system stores personal information without clear consent.
Interviewer: Have you experienced any issues with the current system?
Participant: Yes, occasional data loss and lack of training for staff.`;
    setRawText(example);
    setProjectTitle('Policy Impact Study');
    setResearchQuestion('What are the perceived impacts of the new data‑privacy policy on staff practices?');
    setDataType('Interview transcript');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Project title</label>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter project title"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Research question</label>
        <textarea
          value={researchQuestion}
          onChange={(e) => setResearchQuestion(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Enter research question"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Data type</label>
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {dataOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Qualitative data</label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full p-2 border rounded"
          rows={8}
          placeholder="Paste transcript, field notes, etc."
        />
      </div>

      <div className="flex space-x-2">
        <button className="btn-primary" type="button" onClick={loadExample}>
          Load Example Data
        </button>
        <button className="btn-primary" type="button" onClick={handleAnalyse} disabled={!rawText.trim()}>
          Analyse Text
        </button>
        <button className="btn-secondary" type="button" onClick={resetAll}>
          Reset
        </button>
      </div>
    </div>
  );
}
