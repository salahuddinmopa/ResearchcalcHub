// src/components/charts/LazyBarChart.tsx
import React, { Suspense } from 'react';

// Lazy-load the Bar component from react-chartjs-2
// @ts-ignore
const LazyBar = React.lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })));

export const LazyBarChart: React.FC<any> = (props) => {
  return (
    <Suspense fallback={<div className="text-center text-gray-600">Loading chart...</div>}>
      {/* @ts-ignore */}
      <LazyBar {...props} />
    </Suspense>
  );
};
