import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for AI recommendations
  const recommendations = [
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

  return NextResponse.json({ recommendations });
} 