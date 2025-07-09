"use client";

import React, { useState } from 'react';
import OverviewCard from './OverviewCard';

interface Metric {
  id?: string;
  name: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const KeyMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    { name: 'Revenue', value: '$45.2K', change: '+12%', trend: 'up' },
    { name: 'Users', value: '2,847', change: '+5%', trend: 'up' },
    { name: 'Orders', value: '182', change: '-3%', trend: 'down' },
    { name: 'Conversion', value: '3.2%', change: '+0.8%', trend: 'up' },
    { name: 'Growth Rate', value: '15.8%', change: '+2.1%', trend: 'up' },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({
    name: '',
    value: '',
    change: '',
    trend: 'neutral' as 'up' | 'down' | 'neutral'
  });

  const handleAddMetric = () => {
    setIsModalOpen(true);
  };

  const handleSubmitMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMetric.name && newMetric.value) {
      const metric: Metric = {
        id: Date.now().toString(),
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
    // Simple random metric generation
    const sampleMetrics = [
      { name: 'Customer Satisfaction', value: '92%', change: '+5%', trend: 'up' },
      { name: 'Avg Order Value', value: '$127', change: '+8%', trend: 'up' },
      { name: 'Bounce Rate', value: '32%', change: '-2%', trend: 'up' },
      { name: 'Page Load Time', value: '1.2s', change: '-0.3s', trend: 'up' },
      { name: 'Return Rate', value: '8.5%', change: '+1.2%', trend: 'down' },
    ];
    
    const randomMetric = sampleMetrics[Math.floor(Math.random() * sampleMetrics.length)];
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
        <div className="h-48 overflow-y-auto space-y-3">
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
      </OverviewCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Metric</h3>
              <button
                type="button"
                onClick={handleAIGenerate}
                className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Random Generate
              </button>
            </div>
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
                  placeholder="e.g., +5% or -2%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trend</label>
                <select
                  value={newMetric.trend}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, trend: e.target.value as 'up' | 'down' | 'neutral' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="up">Up (Positive)</option>
                  <option value="down">Down (Negative)</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
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