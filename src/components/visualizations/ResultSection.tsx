import React from 'react';
import type { ReactNode } from 'react';

interface ResultSectionProps {
  /** Optional title displayed above the visual */
  title?: string;
  /** Visual component (chart, gauge, table, etc.) */
  visual: ReactNode;
  /** Optional interpretation or description shown below the visual */
  interpretation?: string;
}

/**
 * A reusable wrapper that presents a visualisation together with a title and
 * optional explanatory text. It uses Tailwind CSS for a clean card appearance
 * and includes subtle hover/fade animations.
 */
export default function ResultSection({ title, visual, interpretation }: ResultSectionProps) {
  return (
    <div className="mt-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg p-4 transition-shadow hover:shadow-xl">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
          {title}
        </h3>
      )}
      <div className="flex justify-center items-center mb-4">{visual}</div>
      {interpretation && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mx-auto">
          {interpretation}
        </p>
      )}
    </div>
  );
}
