import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for metrics
  const metrics = [
    { name: 'NPS Score', value: 72, change: '+3', trend: 'up' },
    { name: 'Customer Sentiment', value: '86%', change: '+2%', trend: 'up' },
    { name: 'Response Rate', value: '94%', change: '-1%', trend: 'down' },
  ];

  return NextResponse.json({ metrics });
} 