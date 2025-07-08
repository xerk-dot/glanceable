"use client";

import React, { useEffect, useState } from 'react';
import OverviewCard from './OverviewCard';

interface Recommendation {
  id: string;
  text: string;
  urgency: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
}

const AIRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({
    text: '',
    urgency: 'medium' as 'high' | 'medium' | 'low',
    impact: 'medium' as 'high' | 'medium' | 'low'
  });

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations');
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to mock data if API fails
        setRecommendations([
          { 
            id: 'rec1', 
            text: 'Address negative feedback about checkout process - 23% increase in cart abandonment', 
            urgency: 'high', 
            impact: 'high' 
          },
          { 
            id: 'rec2', 
            text: 'Follow up with top 5 customers who reported issues last week', 
            urgency: 'medium', 
            impact: 'high' 
          },
          { 
            id: 'rec3', 
            text: 'Review pricing strategy for enterprise segment - potential 15% revenue increase', 
            urgency: 'medium', 
            impact: 'high' 
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const handleAddRecommendation = () => {
    setIsModalOpen(true);
  };

  const handleSubmitRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecommendation.text) {
      const recommendation: Recommendation = {
        id: `rec${Date.now()}`,
        text: newRecommendation.text,
        urgency: newRecommendation.urgency,
        impact: newRecommendation.impact
      };
      setRecommendations(prev => [...prev, recommendation]);
      setNewRecommendation({ text: '', urgency: 'medium', impact: 'medium' });
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewRecommendation({ text: '', urgency: 'medium', impact: 'medium' });
  };

  return (
    <>
      <OverviewCard title="AI Recommendations" variant="recommendations" onAdd={handleAddRecommendation}>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ul className="h-32 overflow-y-auto space-y-3">
            {recommendations.map((rec) => (
              <li key={rec.id} className="flex gap-3 items-start">
                <div className={`${getUrgencyColor(rec.urgency)} w-2 h-2 rounded-full mt-1.5`} />
                <p className="text-gray-800">{rec.text}</p>
              </li>
            ))}
          </ul>
        )}
      </OverviewCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Recommendation</h3>
            <form onSubmit={handleSubmitRecommendation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation Text</label>
                <textarea
                  value={newRecommendation.text}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 h-24 resize-none"
                  placeholder="Enter your recommendation..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={newRecommendation.urgency}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, urgency: e.target.value as 'high' | 'medium' | 'low' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                <select
                  value={newRecommendation.impact}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, impact: e.target.value as 'high' | 'medium' | 'low' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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
                  Add Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIRecommendations; 