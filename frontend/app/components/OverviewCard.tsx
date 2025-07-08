"use client";

import React, { ReactNode } from 'react';

interface OverviewCardProps {
  title: string;
  children: ReactNode;
  variant?: 'metrics' | 'recommendations' | 'priorities';
  onAdd?: () => void;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, children, variant = 'metrics', onAdd }) => {
  const variantStyles = {
    metrics: 'border-l-4 border-l-primary bg-blue-100',
    recommendations: 'border-l-4 border-l-primary bg-blue-100',
    priorities: 'border-l-4 border-l-primary bg-blue-100'
  };

  return (
    <div className={`rounded-lg shadow-sm ${variantStyles[variant]} p-4 h-full`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add
          </button>
        )}
      </div>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
};

export default OverviewCard; 