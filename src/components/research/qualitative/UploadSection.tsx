// src/components/research/qualitative/UploadSection.tsx
import React, { useState } from "react";

interface UploadSectionProps {
  onDataLoaded: (data: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onDataLoaded }) => {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      onDataLoaded(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 bg-indigo-50 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2 text-indigo-800">Phase 1 – Data Upload & Familiarisation</h2>
      <p className="mb-3 text-indigo-700">
        Upload interview transcripts, focus‑group notes, or open‑ended survey responses (plain text or .txt files).
      </p>
      <input
        type="file"
        accept=".txt,.md,.csv"
        onChange={handleFileChange}
        className="border border-indigo-300 rounded px-2 py-1 bg-white"
      />
      {fileName && <p className="mt-2 text-sm text-indigo-600">Loaded: {fileName}</p>}
    </div>
  );
};
