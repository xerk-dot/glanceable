"use client";

import React, { useState, useEffect } from 'react';
import OverviewCard from './OverviewCard';

interface Recommendation {
  id?: string;
  text?: string;
  urgency?: 'high' | 'medium' | 'low';
  impact?: 'high' | 'medium' | 'low';
}

const AIRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations');
        const data = await response.json();
        
        if (data.recommendations) {
          // Transform string array to object array
          const transformedRecommendations = data.recommendations.map((rec: string, index: number) => ({
            id: (index + 1).toString(),
            text: rec,
            urgency: ['high', 'medium', 'low'][index % 3] as 'high' | 'medium' | 'low',
            impact: ['high', 'medium', 'medium'][index % 3] as 'high' | 'medium' | 'low'
          }));
          setRecommendations(transformedRecommendations);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Keep fallback data
        setRecommendations([
          { id: '1', text: 'Optimize checkout flow', urgency: 'high', impact: 'high' },
          { id: '2', text: 'Update mobile app UI', urgency: 'medium', impact: 'medium' },
          { id: '3', text: 'Expand social media presence', urgency: 'low', impact: 'medium' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({
    text: '',
    urgency: 'medium' as 'high' | 'medium' | 'low',
    impact: 'medium' as 'high' | 'medium' | 'low'
  });

  // Filter recommendations based on selected filters
  const filteredRecommendations = recommendations.filter((rec) => {
    const urgencyMatch = urgencyFilter === 'all' || rec.urgency === urgencyFilter;
    const impactMatch = impactFilter === 'all' || rec.impact === impactFilter;
    return urgencyMatch && impactMatch;
  });

  const getPriorityIcon = (urgency: string, impact: string) => {
    if (urgency === 'high' && impact === 'high') {
      return <span className="text-red-500 font-bold">🔴</span>;
    } else if (urgency === 'high' || impact === 'high') {
      return <span className="text-orange-500 font-bold">🟡</span>;
    } else {
      return <span className="text-green-500 font-bold">🟢</span>;
    }
  };

  const handleAddRecommendation = () => {
    setIsModalOpen(true);
  };

  const handleSubmitRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecommendation.text) {
      const recommendation: Recommendation = {
        id: Date.now().toString(),
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

  const handleRandomGenerate = () => {
    const sampleRecommendations = [
      { text: 'Implement A/B testing', urgency: 'medium', impact: 'high' },
      { text: 'Add live chat support', urgency: 'high', impact: 'medium' },
      { text: 'Improve SEO strategy', urgency: 'low', impact: 'high' },
      { text: 'Automate email campaigns', urgency: 'medium', impact: 'medium' },
      { text: 'Create loyalty program', urgency: 'low', impact: 'high' },
      { text: 'Optimize database queries', urgency: 'high', impact: 'low' },
    ];
    
    const randomRec = sampleRecommendations[Math.floor(Math.random() * sampleRecommendations.length)];
    setNewRecommendation({
      text: randomRec.text,
      urgency: randomRec.urgency as 'high' | 'medium' | 'low',
      impact: randomRec.impact as 'high' | 'medium' | 'low'
    });
  };

  return (
    <>
      <OverviewCard title="AI Recommendations" variant="recommendations" onAdd={handleAddRecommendation}>
        {/* Filter Controls */}
        <div className="flex gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Urgency:</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Impact:</label>
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          {(urgencyFilter !== 'all' || impactFilter !== 'all') && (
            <button
              onClick={() => {
                setUrgencyFilter('all');
                setImpactFilter('all');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Recommendations List */}
        <ul className="h-40 overflow-y-auto space-y-3">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => (
              <li key={rec.id} className="flex items-start gap-2">
                {getPriorityIcon(rec.urgency || 'medium', rec.impact || 'medium')}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{rec.text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.urgency} urgency
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.impact === 'high' ? 'bg-purple-100 text-purple-800' :
                      rec.impact === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rec.impact} impact
                    </span>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500 text-center py-4">
              No recommendations match the selected filters.
            </li>
          )}
        </ul>
      </OverviewCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Recommendation</h3>
              <button
                type="button"
                onClick={handleRandomGenerate}
                className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Random Generate
              </button>
            </div>
            <form onSubmit={handleSubmitRecommendation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation</label>
                <textarea
                  value={newRecommendation.text}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  rows={3}
                  placeholder="e.g., Implement A/B testing for landing page"
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