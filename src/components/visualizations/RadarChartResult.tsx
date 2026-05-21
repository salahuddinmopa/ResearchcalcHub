import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RadarChartResultProps {
  /** Array of data objects. Each object must contain a numeric value and a category label. */
  data: { category: string; value: number }[];
  /** Title displayed above the chart */
  title?: string;
}

export const RadarChartResult: React.FC<RadarChartResultProps> = ({ data, title }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {title && <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={30} domain={[0, Math.max(...data.map(d => d.value))] } />
          <Radar name="Score" dataKey="value" stroke="#4F46E5" fill="#818CF8" fillOpacity={0.6} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartResult;
