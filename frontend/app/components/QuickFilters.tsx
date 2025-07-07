"use client";

import React, { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
}

interface QuickFiltersProps {
  onFilterChange?: (filters: {
    timeframe: string;
    channel: string;
    topic: string;
  }) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ onFilterChange }) => {
  const timeframeOptions: FilterOption[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
  ];

  const channelOptions: FilterOption[] = [
    { id: 'all', label: 'All Channels' },
    { id: 'website', label: 'Website' },
    { id: 'mobile', label: 'Mobile App' },
    { id: 'email', label: 'Email' },
    { id: 'social', label: 'Social Media' },
  ];

  const topicOptions: FilterOption[] = [
    { id: 'all', label: 'All Topics' },
    { id: 'product', label: 'Product' },
    { id: 'service', label: 'Service' },
    { id: 'support', label: 'Support' },
    { id: 'billing', label: 'Billing' },
  ];

  const [filters, setFilters] = useState({
    timeframe: 'week',
    channel: 'all',
    topic: 'all',
  });

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <label className="text-sm font-medium text-foreground">Timeframe:</label>
        <select
          className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={filters.timeframe}
          onChange={(e) => handleFilterChange('timeframe', e.target.value)}
        >
          {timeframeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <label className="text-sm font-medium text-foreground">Channel:</label>
        <select
          className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={filters.channel}
          onChange={(e) => handleFilterChange('channel', e.target.value)}
        >
          {channelOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <label className="text-sm font-medium text-foreground">Topic:</label>
        <select
          className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={filters.topic}
          onChange={(e) => handleFilterChange('topic', e.target.value)}
        >
          {topicOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default QuickFilters; 