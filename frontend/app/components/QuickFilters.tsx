"use client";

import React from 'react';
import { useFilters, Timeframe, Channel, Topic, getFilterLabels } from './FilterContext';

const QuickFilters: React.FC = () => {
  const { filters, updateFilters, resetFilters } = useFilters();
  const labels = getFilterLabels();

  const hasActiveFilters = filters.timeframe !== Timeframe.ALL || 
                          filters.channel !== Channel.ALL || 
                          filters.topic !== Topic.ALL;

  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-sm font-semibold text-gray-700">Quick Filters:</h3>
        
        {/* Timeframe Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Timeframe:</label>
          <select
            value={filters.timeframe}
            onChange={(e) => updateFilters({ timeframe: e.target.value as Timeframe })}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(labels.timeframe).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Channel:</label>
          <select
            value={filters.channel}
            onChange={(e) => updateFilters({ channel: e.target.value as Channel })}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(labels.channel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Topic:</label>
          <select
            value={filters.topic}
            onChange={(e) => updateFilters({ topic: e.target.value as Topic })}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(labels.topic).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
          >
            Clear All Filters
          </button>
        )}

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters active
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickFilters; 