"use client";

import React, { ReactNode } from 'react';

interface OverviewCardProps {
  title: string;
  children: ReactNode;
  variant?: 'metrics' | 'recommendations' | 'priorities';
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, children, variant = 'metrics' }) => {
  const variantStyles = {
    metrics: 'border-l-4 border-l-primary bg-card',
    recommendations: 'border-l-4 border-l-purple-500 bg-card',
    priorities: 'border-l-4 border-l-destructive bg-card'
  };

  return (
    <div className={`rounded-lg shadow-sm ${variantStyles[variant]} p-4 h-full`}>
      <h3 className="font-semibold text-lg mb-2 text-card-foreground">{title}</h3>
      <div className="text-sm text-card-foreground">{children}</div>
    </div>
  );
};

export default OverviewCard; 