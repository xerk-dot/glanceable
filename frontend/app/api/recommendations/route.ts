import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    if (BACKEND_URL) {
      const response = await fetch(`${BACKEND_URL}/api/recommendations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error('No backend URL configured');
    }
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    
    // Fallback data
    return NextResponse.json({
      recommendations: [
        'Focus marketing on Electronics category - highest revenue contributor',
        'Optimize mobile checkout - 23% cart abandonment rate',
        'Target Q4 campaigns - strong seasonal growth pattern'
      ]
    });
  }
} 