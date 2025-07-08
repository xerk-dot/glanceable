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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({
    name: '',
    value: '',
    change: '',
    trend: 'neutral' as 'up' | 'down' | 'neutral'
  });

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

  const handleAddMetric = () => {
    setIsModalOpen(true);
  };

  const handleSubmitMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMetric.name && newMetric.value) {
      const metric: Metric = {
        name: newMetric.name,
        value: newMetric.value,
        change: newMetric.change || undefined,
        trend: newMetric.trend
      };
      setMetrics(prev => [...prev, metric]);
      setNewMetric({ name: '', value: '', change: '', trend: 'neutral' });
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewMetric({ name: '', value: '', change: '', trend: 'neutral' });
  };

  const handleAIGenerate = () => {
    const metricTemplates = [
      { name: 'Customer Satisfaction', value: `${Math.floor(Math.random() * 30) + 70}%`, change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 5) + 1}%`, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral' },
      { name: 'Response Time', value: `${Math.floor(Math.random() * 500) + 100}ms`, change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 20) + 5}ms`, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral' },
      { name: 'Conversion Rate', value: `${(Math.random() * 10 + 2).toFixed(1)}%`, change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 2).toFixed(1)}%`, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral' },
      { name: 'User Engagement', value: `${Math.floor(Math.random() * 40) + 60}%`, change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 8) + 1}%`, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral' },
      { name: 'Feature Adoption', value: `${Math.floor(Math.random() * 50) + 30}%`, change: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 12) + 2}%`, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral' },
      { name: 'API Uptime', value: `${(99 + Math.random()).toFixed(2)}%`, change: `${Math.random() > 0.7 ? '+' : '-'}${(Math.random() * 0.5).toFixed(2)}%`, trend: Math.random() > 0.7 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral' },
      { name: 'Load Time', value: `${(Math.random() * 2 + 0.5).toFixed(1)}s`, change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 0.3).toFixed(1)}s`, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'neutral' },
    ];
    
    const randomMetric = metricTemplates[Math.floor(Math.random() * metricTemplates.length)];
    setNewMetric({
      name: randomMetric.name,
      value: randomMetric.value,
      change: randomMetric.change,
      trend: randomMetric.trend as 'up' | 'down' | 'neutral'
    });
  };

  return (
    <>
      <OverviewCard title="Key Metrics" variant="metrics" onAdd={handleAddMetric}>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-32 overflow-y-auto space-y-3">
            {metrics.map((metric, index) => (
              <div key={`${metric.name}-${index}`} className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{metric.value}</span>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Metric</h3>
            <form onSubmit={handleSubmitMetric} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
                <input
                  type="text"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="e.g., NPS Score"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="text"
                  value={newMetric.value}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="e.g., 72 or 86%"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change (optional)</label>
                <input
                  type="text"
                  value={newMetric.change}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, change: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="e.g., +3 or -2%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trend</label>
                <select
                  value={newMetric.trend}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, trend: e.target.value as 'up' | 'down' | 'neutral' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyMetrics; 