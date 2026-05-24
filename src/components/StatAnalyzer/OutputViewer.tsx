import React from 'react';

export function OutputViewer({ data, variables }: { data: any[]; variables: string[] }) {
  // Filter data to only selected variables
  const filteredData = data.map(row => {
    const obj: Record<string, any> = {};
    variables.forEach(v => {
      obj[v] = row[v];
    });
    return obj;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-slate-800">Output</h2>
      <p className="text-sm text-slate-600">Rows loaded: {data.length}</p>

      {variables.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-slate-700 mb-2">Selected Variables</h3>
          <ul className="list-disc list-inside ml-4 text-sm text-slate-600">
            {variables.map(v => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {filteredData.length > 0 && variables.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {variables.map(v => (
                  <th
                    key={v}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600"
                  >
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((row, i) => (
                <tr key={i}>
                  {variables.map(v => (
                    <td key={v} className="px-4 py-2 text-sm text-gray-700">
                      {row[v] !== undefined ? row[v].toString() : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OutputViewer;
