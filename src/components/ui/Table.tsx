import React from 'react';

export function Table({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-600">No data to display.</p>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns.map(col => (
              <th
                key={col}
                className="px-4 py-2 text-left text-xs font-medium text-gray-600"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col} className="px-4 py-2 text-sm text-gray-700">
                  {row[col] !== undefined ? row[col].toString() : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
