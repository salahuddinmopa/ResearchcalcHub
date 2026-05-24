import React from 'react';

interface Theme {
  name: string;
  description: string;
  relatedCategories: string[];
  supportingCodes: string[];
  supportingQuote: string;
  strength: 'Weak' | 'Moderate' | 'Strong';
}

interface Props {
  themes: Theme[];
  setThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
  categories: { name: string }[];
  // optional other shared props can be passed via rest
  [key: string]: any;
}

export default function Step5Themes({ themes, setThemes, categories }: Props) {
  const [newTheme, setNewTheme] = React.useState({
    name: '',
    description: '',
    relatedCategories: [] as string[],
    supportingCodes: [] as string[],
    supportingQuote: '',
    strength: 'Moderate' as Theme['strength'],
  });

  const addTheme = () => {
    if (!newTheme.name.trim()) return;
    setThemes([...themes, newTheme]);
    setNewTheme({
      name: '',
      description: '',
      relatedCategories: [],
      supportingCodes: [],
      supportingQuote: '',
      strength: 'Moderate',
    });
  };

  const toggleCategory = (cat: string) => {
    setNewTheme((prev) => {
      const already = prev.relatedCategories.includes(cat);
      const updated = already
        ? prev.relatedCategories.filter((c) => c !== cat)
        : [...prev.relatedCategories, cat];
      return { ...prev, relatedCategories: updated };
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Step 5 – Themes</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {themes.map((theme, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-lg">{theme.name}</h3>
            <p>{theme.description}</p>
            <p className="text-sm italic">Strength: {theme.strength}</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Add a new theme</h3>
        <input
          type="text"
          placeholder="Theme name"
          className="w-full mb-1 p-2 border rounded"
          value={newTheme.name}
          onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="w-full mb-1 p-2 border rounded"
          rows={2}
          value={newTheme.description}
          onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
        />
        <div className="mb-2">
          <span className="font-medium mr-2">Related categories:</span>
          {categories.map((cat, i) => (
            <label key={i} className="mr-2 inline-flex items-center">
              <input
                type="checkbox"
                className="mr-1"
                checked={newTheme.relatedCategories.includes(cat.name)}
                onChange={() => toggleCategory(cat.name)}
              />
              {cat.name}
            </label>
          ))}
        </div>
        <select
          className="w-full mb-2 p-2 border rounded"
          value={newTheme.strength}
          onChange={(e) => setNewTheme({ ...newTheme, strength: e.target.value as Theme['strength'] })}
        >
          <option value="Weak">Weak</option>
          <option value="Moderate">Moderate</option>
          <option value="Strong">Strong</option>
        </select>
        <button className="btn-primary" onClick={addTheme}>Add Theme</button>
      </div>
    </div>
  );
}
