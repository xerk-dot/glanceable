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
        // First try to get user-created metrics from database
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/metrics`);
        const userData = await userResponse.json();
        
        if (userData.success && userData.metrics.length > 0) {
          setMetrics(userData.metrics);
        } else {
          // Fallback to system metrics if no user metrics
          const response = await fetch('/api/metrics');
          const data = await response.json();
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        // Fallback to mock data if both APIs fail
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

  const handleSubmitMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMetric.name && newMetric.value) {
      const metric: Metric = {
        name: newMetric.name,
        value: newMetric.value,
        change: newMetric.change || undefined,
        trend: newMetric.trend
      };
      
      try {
        // Save to database
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metric),
        });
        
        const result = await response.json();
        if (result.success) {
          setMetrics(prev => [...prev, { ...metric, id: result.metric.id }]);
        } else {
          console.error('Failed to save metric:', result.error);
          setMetrics(prev => [...prev, metric]);
        }
      } catch (error) {
        console.error('Error saving metric:', error);
        setMetrics(prev => [...prev, metric]);
      }
      
      setNewMetric({ name: '', value: '', change: '', trend: 'neutral' });
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewMetric({ name: '', value: '', change: '', trend: 'neutral' });
  };

  const handleAIGenerate = async () => {
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'metric',
          context: 'dashboard metrics'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const result = await response.json();
      const aiMetric = result.data;

      setNewMetric({
        name: aiMetric.name,
        value: aiMetric.value,
        change: aiMetric.change || '',
        trend: aiMetric.trend as 'up' | 'down' | 'neutral'
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      // Fallback to a simple random metric if API fails
      setNewMetric({
        name: 'AI Generation Failed',
        value: 'N/A',
        change: '',
        trend: 'neutral'
      });
    }
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
                AI Generate
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