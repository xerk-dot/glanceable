"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Enum types for filtering
export enum Timeframe {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export enum Channel {
  ALL = 'all',
  WEB = 'web',
  MOBILE = 'mobile',
  EMAIL = 'email',
  SOCIAL = 'social',
  DIRECT = 'direct',
  ORGANIC = 'organic'
}

export enum Topic {
  ALL = 'all',
  SALES = 'sales',
  MARKETING = 'marketing',
  PRODUCT = 'product',
  CUSTOMER_SERVICE = 'customer_service',
  OPERATIONS = 'operations',
  FINANCE = 'finance',
  TECH = 'tech'
}

export interface GlobalFilters {
  timeframe: Timeframe;
  channel: Channel;
  topic: Topic;
}

interface FilterContextType {
  filters: GlobalFilters;
  updateFilters: (newFilters: Partial<GlobalFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: GlobalFilters = {
  timeframe: Timeframe.ALL,
  channel: Channel.ALL,
  topic: Topic.ALL
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);

  const updateFilters = (newFilters: Partial<GlobalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Helper function to get display labels
export const getFilterLabels = () => ({
  timeframe: {
    [Timeframe.ALL]: 'All Time',
    [Timeframe.TODAY]: 'Today',
    [Timeframe.WEEK]: 'This Week',
    [Timeframe.MONTH]: 'This Month',
    [Timeframe.QUARTER]: 'This Quarter',
    [Timeframe.YEAR]: 'This Year'
  },
  channel: {
    [Channel.ALL]: 'All Channels',
    [Channel.WEB]: 'Web',
    [Channel.MOBILE]: 'Mobile',
    [Channel.EMAIL]: 'Email',
    [Channel.SOCIAL]: 'Social',
    [Channel.DIRECT]: 'Direct',
    [Channel.ORGANIC]: 'Organic'
  },
  topic: {
    [Topic.ALL]: 'All Topics',
    [Topic.SALES]: 'Sales',
    [Topic.MARKETING]: 'Marketing',
    [Topic.PRODUCT]: 'Product',
    [Topic.CUSTOMER_SERVICE]: 'Customer Service',
    [Topic.OPERATIONS]: 'Operations',
    [Topic.FINANCE]: 'Finance',
    [Topic.TECH]: 'Technology'
  }
}); 