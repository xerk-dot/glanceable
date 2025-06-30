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

  return (
    <OverviewCard title="AI Recommendations" variant="recommendations">
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {recommendations.map((rec) => (
            <li key={rec.id} className="flex gap-3 items-start">
              <div className={`${getUrgencyColor(rec.urgency)} w-2 h-2 rounded-full mt-1.5`} />
              <p className="text-card-foreground">{rec.text}</p>
            </li>
          ))}
        </ul>
      )}
    </OverviewCard>
  );
};

export default AIRecommendations; 