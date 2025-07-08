"use client";

import React, { useState } from 'react';
import FixedOverviewArea from './FixedOverviewArea';
import QuickFilters from './QuickFilters';
import DynamicChartArea from './DynamicChartArea';

const Dashboard: React.FC = () => {
  const [, setFilters] = useState({
    timeframe: 'week',
    channel: 'all',
    topic: 'all',
  });

  const handleFilterChange = (newFilters: {
    timeframe: string;
    channel: string;
    topic: string;
  }) => {
    setFilters(newFilters);
    // In a real app, this would trigger API calls to refresh data
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground"><em>Glanceable</em> Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back! Here&apos;s your business at a glance.
        </p>
      </header>

      <QuickFilters onFilterChange={handleFilterChange} />
      
      <FixedOverviewArea />
      
      <DynamicChartArea />
    </div>
  );
};

export default Dashboard; 