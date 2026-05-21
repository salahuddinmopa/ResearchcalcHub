import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartResultProps {
  data: { name: string; value: number }[];
  title?: string;
  colors?: string[];
}

export default function PieChartResult({
  data,
  title = '',
  colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#9254de'],
}: PieChartResultProps) {
  return (
    <div className="w-full h-64">
      {title && <h3 className="text-center font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
