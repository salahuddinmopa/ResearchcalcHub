import React, { Suspense } from 'react';
import type { ComponentType } from 'react';

const LazyBar = React.lazy(() =>
  import('react-chartjs-2').then(mod => ({ default: mod.Bar as ComponentType<any> }))
);

export const LazyBarChart: React.FC<any> = (props) => {
  return (
    <Suspense fallback={<div className="text-center text-gray-600">Loading chart...</div>}>
      <LazyBar {...props} />
    </Suspense>
  );
};
