"use client";

import React, { useEffect, useState } from 'react';
import OverviewCard from './OverviewCard';

interface Metric {
  name: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const KeyMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Fallback to mock data if API fails
        setMetrics([
          { name: 'NPS Score', value: 72, change: '+3', trend: 'up' },
          { name: 'Customer Sentiment', value: '86%', change: '+2%', trend: 'up' },
          { name: 'Response Rate', value: '94%', change: '-1%', trend: 'down' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <OverviewCard title="Key Metrics" variant="metrics">
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex justify-between items-center">
              <span className="font-medium text-card-foreground">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-card-foreground">{metric.value}</span>
                {metric.change && (
                  <span 
                    className={`text-xs ${
                      metric.trend === 'up' ? 'text-success' : 
                      metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </OverviewCard>
  );
};

export default KeyMetrics; 