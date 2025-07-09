import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    if (BACKEND_URL) {
      const response = await fetch(`${BACKEND_URL}/api/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error('No backend URL configured');
    }
    
  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    // Fallback data
    return NextResponse.json({
      metrics: [
        {
          id: 'total-revenue',
          title: 'Total Revenue',
          value: '$125,430',
          change: '+12.5%',
          changeType: 'positive'
        },
        {
          id: 'active-users',
          title: 'Active Users',
          value: '8,249',
          change: '+8.2%',
          changeType: 'positive'
        },
        {
          id: 'conversion-rate',
          title: 'Conversion Rate',
          value: '3.4%',
          change: '-1.2%',
          changeType: 'negative'
        },
        {
          id: 'avg-order-value',
          title: 'Avg Order Value',
          value: '$67.80',
          change: '+5.1%',
          changeType: 'positive'
        }
      ]
    });
  }
} 