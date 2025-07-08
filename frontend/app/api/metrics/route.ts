import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/metrics`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({ metrics: data.metrics });
    } else {
      throw new Error(data.error || 'Failed to fetch metrics');
    }
  } catch (error) {
    console.error('Error fetching metrics from backend:', error);
    
    // Fallback to mock data if backend is unavailable
    const fallbackMetrics = [
      { name: 'NPS Score', value: 72, change: '+3', trend: 'up' },
      { name: 'Customer Sentiment', value: '86%', change: '+2%', trend: 'up' },
      { name: 'Response Rate', value: '94%', change: '-1%', trend: 'down' },
    ];
    
    return NextResponse.json({ metrics: fallbackMetrics });
  }
} 