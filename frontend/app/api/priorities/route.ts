import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    if (BACKEND_URL) {
      const response = await fetch(`${BACKEND_URL}/api/priorities`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error('No backend URL configured');
    }
    
  } catch (error) {
    console.error('Error fetching priorities:', error);
    
    // Fallback data
    return NextResponse.json({
      priorities: [
        {
          id: 'fix-checkout',
          title: 'Fix checkout flow issue',
          description: 'Multiple users reporting payment failures',
          priority: 'high',
          impact: 'high',
          status: 'in-progress'
        },
        {
          id: 'mobile-optimization',
          title: 'Mobile app optimization',
          description: 'Improve load times on mobile devices',
          priority: 'medium',
          impact: 'medium',
          status: 'planned'
        },
        {
          id: 'user-feedback',
          title: 'Review user feedback',
          description: 'Analyze recent support tickets',
          priority: 'low',
          impact: 'medium',
          status: 'pending'
        }
      ]
    });
  }
} 