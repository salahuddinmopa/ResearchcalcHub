import React, { useState } from 'react';

interface Code {
  name: string;
  description: string;
  frequency: number;
  example: string;
}

interface Props {
  codes: Code[];
  setCodes: React.Dispatch<React.SetStateAction<Code[]>>;
}

export default function Step3InitialCodes({ codes, setCodes }: Props) {
  const [newCode, setNewCode] = useState({ name: '', description: '', frequency: 0, example: '' });

  const addCode = () => {
    if (!newCode.name.trim()) return;
    setCodes([...codes, { ...newCode, frequency: Number(newCode.frequency) }]);
    setNewCode({ name: '', description: '', frequency: 0, example: '' });
  };

  const updateCode = (index: number, field: keyof Code, value: string) => {
    const updated = codes.map((c, i) => (i === index ? { ...c, [field]: field === 'frequency' ? Number(value) : value } : c));
    setCodes(updated);
  };

  const deleteCode = (index: number) => {
    setCodes(codes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Step 3 – Initial Codes</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {codes.map((code, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4">
            <input
              className="w-full text-lg font-medium border-b mb-1"
              value={code.name}
              onChange={e => updateCode(idx, 'name', e.target.value)}
            />
            <textarea
              className="w-full text-sm border rounded mb-1"
              rows={2}
              placeholder="Description"
              value={code.description}
              onChange={e => updateCode(idx, 'description', e.target.value)}
            />
            <div className="flex justify-between items-center text-sm mb-1">
              <span>Freq: {code.frequency}</span>
              <input
                type="number"
                min="0"
                className="w-20 border rounded"
                value={code.frequency}
                onChange={e => updateCode(idx, 'frequency', e.target.value)}
              />
            </div>
            <textarea
              className="w-full text-sm border rounded mb-2"
              rows={2}
              placeholder="Example quote"
              value={code.example}
              onChange={e => updateCode(idx, 'example', e.target.value)}
            />
            <button className="btn-danger" onClick={() => deleteCode(idx)}>
              Delete
            </button>
          </div>
        ))}
      </div>
      {/* Add new code */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Add a new code</h3>
        <input
          className="w-full mb-1 border rounded"
          placeholder="Code name"
          value={newCode.name}
          onChange={e => setNewCode({ ...newCode, name: e.target.value })}
        />
        <textarea
          className="w-full mb-1 border rounded"
          rows={2}
          placeholder="Description"
          value={newCode.description}
          onChange={e => setNewCode({ ...newCode, description: e.target.value })}
        />
        <input
          type="number"
          min="0"
          className="w-20 mb-1 border rounded"
          placeholder="Frequency"
          value={newCode.frequency}
          onChange={e => setNewCode({ ...newCode, frequency: Number(e.target.value) })}
        />
        <textarea
          className="w-full mb-2 border rounded"
          rows={2}
          placeholder="Example quote"
          value={newCode.example}
          onChange={e => setNewCode({ ...newCode, example: e.target.value })}
        />
        <button className="btn-primary" onClick={addCode}>
          Add Code
        </button>
      </div>
    </div>
  );
}
