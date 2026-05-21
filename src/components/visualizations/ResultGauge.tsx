import React from 'react';
import { RadialBarChart, RadialBar, Legend } from 'recharts';

interface ResultGaugeProps {
  value: number; // current value
  min?: number; // default 0
  max?: number; // default 1
  label: string; // e.g., 'Cohen's Kappa'
  interpretation?: string; // optional text
  colourCategory?: 'low' | 'medium' | 'high' | 'excellent';
}

const getColour = (category?: string) => {
  switch (category) {
    case 'low':
      return '#f87171'; // red
    case 'medium':
      return '#fbbf24'; // amber
    case 'high':
      return '#34d399'; // green
    case 'excellent':
      return '#60a5fa'; // blue
    default:
      return '#a5b4fc'; // default purple
  }
};

export default function ResultGauge({
  value,
  min = 0,
  max = 1,
  label,
  interpretation,
  colourCategory,
}: ResultGaugeProps) {
  const data = [{ name: label, value }];
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg">
      <h3 className="text-lg font-medium mb-2">{label}</h3>
      <RadialBarChart
        width={200}
        height={200}
        innerRadius={70}
        outerRadius={90}
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          background
          dataKey="value"
          fill={getColour(colourCategory)}
        />
        <Legend
          iconSize={10}
          formatter={() => `${percentage.toFixed(1)}%`}
          verticalAlign="bottom"
          layout="horizontal"
        />
      </RadialBarChart>
      {interpretation && (
        <p className="mt-2 text-sm text-gray-600 text-center max-w-xs">
          {interpretation}
        </p>
      )}
    </div>
  );
}
