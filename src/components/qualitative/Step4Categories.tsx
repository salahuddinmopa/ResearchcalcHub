import React from 'react';

interface Props {
  categories: any[];
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
  codes: any[];
  setCodes: React.Dispatch<React.SetStateAction<any[]>>;
  // additional props for shared state (optional)
  [key: string]: any;
}

export default function Step4Categories({ categories, setCategories, codes }: Props) {
  // Simple UI: list categories and allow adding a new category name
  const [newCat, setNewCat] = React.useState('');

  const addCategory = () => {
    if (!newCat.trim()) return;
    setCategories([...categories, { name: newCat, codes: [], explanation: '' }]);
    setNewCat('');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Step 4: Categories</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="New category name"
        />
        <button className="btn-primary" onClick={addCategory}>Add Category</button>
      </div>
      <ul className="list-disc pl-5">
        {categories.map((cat, idx) => (
          <li key={idx} className="mb-2">
            <strong>{cat.name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
