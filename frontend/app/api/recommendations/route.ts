import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/recommendations`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({ recommendations: data.recommendations });
    } else {
      throw new Error(data.error || 'Failed to fetch recommendations');
    }
  } catch (error) {
    console.error('Error fetching recommendations from backend:', error);
    
    // Fallback to mock data if backend is unavailable
    const fallbackRecommendations = [
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
    ];
    
    return NextResponse.json({ recommendations: fallbackRecommendations });
  }
} 