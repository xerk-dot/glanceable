import { NextResponse } from 'next/server';

// Helper function to generate random chart data
const generateChartData = (numericValue: string, metric: string) => {
  const metricLabels: Record<string, string[]> = {
    country: ['USA', 'UK', 'Canada', 'Germany', 'France'],
    city: ['New York', 'London', 'Toronto', 'Berlin', 'Paris'],
    sentiment: ['Positive', 'Neutral', 'Negative'],
    category: ['Product', 'Service', 'Support', 'Billing'],
    channel: ['Website', 'Mobile App', 'Email', 'Social Media', 'Phone'],
  };

  const labels = metricLabels[metric] || ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  
  return labels.map((label) => {
    let value = 0;
    
    // Generate different patterns based on the numeric value type
    switch (numericValue) {
      case 'count':
        value = Math.floor(Math.random() * 100) + 10;
        break;
      case 'average':
        value = Math.floor(Math.random() * 50) + 50;
        break;
      case 'sum':
        value = Math.floor(Math.random() * 1000) + 500;
        break;
      case 'median':
        value = Math.floor(Math.random() * 40) + 30;
        break;
      default:
        value = Math.floor(Math.random() * 100);
    }
    
    return {
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      value,
    };
  });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const numericValue = searchParams.get('numericValue') || 'count';
  const metric = searchParams.get('metric') || 'country';
  
  const data = generateChartData(numericValue, metric);
  
  return NextResponse.json({ data });
} 