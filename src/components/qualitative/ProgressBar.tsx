import React from 'react';

export default function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center space-x-2 mb-4">
      {steps.map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === currentStep ? 'bg-indigo-600 text-white' : step < currentStep ? 'bg-indigo-300 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step !== totalSteps && (
            <div className="h-1 w-6 bg-gray-300 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}
