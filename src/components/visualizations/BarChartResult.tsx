import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartResultProps {
  data: { name: string; value: number }[];
  title?: string;
  xKey?: string;
  yKey?: string;
  barColor?: string;
}

export default function BarChartResult({
  data,
  title = '',
  xKey = 'name',
  yKey = 'value',
  barColor = '#1890ff',
}: BarChartResultProps) {
  return (
    <div className="w-full h-64">
      {title && <h3 className="text-center font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={yKey} fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
