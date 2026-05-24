import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'beta' | 'alpha' | 'new' | 'default';
  color?: 'gray' | 'blue' | 'green' | 'red';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', color }) => {
  // Color prop overrides variant styling
  if (color) {
    const map: Record<string, string> = {
      gray: 'bg-gray-200 text-gray-800',
      blue: 'bg-blue-200 text-blue-800',
      green: 'bg-green-200 text-green-800',
      red: 'bg-red-200 text-red-800',
    };
    return (
      <span className={`inline-block px-2 py-1 rounded text-sm ${map[color]}`}> {children} </span>
    );
  }

  const variantMap: Record<string, string> = {
    beta: 'bg-purple-200 text-purple-800',
    alpha: 'bg-indigo-200 text-indigo-800',
    new: 'bg-green-200 text-green-800',
    default: 'bg-gray-200 text-gray-800',
  };

  return (
    <span className={`inline-block px-2 py-1 rounded text-sm ${variantMap[variant]}`}> {children} </span>
  );
};
