"use client";

import React from 'react';
import FixedOverviewArea from './FixedOverviewArea';
import QuickFilters from './QuickFilters';
import DynamicChartArea from './DynamicChartArea';

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground"><em>Glanceable</em> Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back! Here&apos;s your business at a glance.
        </p>
      </header>

      <QuickFilters />
      
      <FixedOverviewArea />
      
      <DynamicChartArea />
    </div>
  );
};

export default Dashboard; 