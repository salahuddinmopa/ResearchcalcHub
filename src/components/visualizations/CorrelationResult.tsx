import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type CorrelationData = {
  r: number;
  direction: string;
  strengthLabel: string;
  strengthPct: number;
  points: { x: number; y: number }[];
};

/**
 * Renders a scatter plot for the provided data points.
 */
const ScatterPlot = ({ data }: { data: { x: number; y: number }[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid />
      <XAxis type="number" dataKey="x" name="X" unit="" />
      <YAxis type="number" dataKey="y" name="Y" unit="" />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      <Legend />
      <Scatter name="Points" data={data} fill="#1890ff" />
    </ScatterChart>
  </ResponsiveContainer>
);

/**
 * Visualisation component for correlation results.
 * Displays Pearson's r, direction, strength label, strength percentage, and a scatter plot.
 * Layout is mobile‑responsive using Tailwind utilities.
 */
const CorrelationResult = ({ data }: { data: CorrelationData }) => {
  const { r, direction, strengthLabel, strengthPct, points } = data;
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-center">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pearson's r</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{r.toFixed(3)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Direction</h3>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">{direction}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Strength</h3>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">{strengthLabel}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Strength %</h3>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{strengthPct.toFixed(1)}%</p>
        </div>
      </div>
      <div className="mt-4">
        <ScatterPlot data={points} />
      </div>
    </div>
  );
};

export default CorrelationResult;
