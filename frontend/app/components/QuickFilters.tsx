"use client";

import React from 'react';

interface FilterOptions {
  [key: string]: string | number;
}

interface QuickFiltersProps {
  onFilterChange?: (filters: FilterOptions) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = () => {
  return (
    <div className="mb-6">
      {/* Filters removed as requested */}
    </div>
  );
};

export default QuickFilters; 