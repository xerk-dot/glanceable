import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5001';

// Helper function to generate random chart data (fallback)
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
  const chartType = searchParams.get('chartType') || 'bar';
  const numericValue = searchParams.get('numericValue') || 'count';
  const metric = searchParams.get('metric') || 'revenue';
  const period = searchParams.get('period') || '30d';
  
  try {
    let endpoint = '';
    let params = new URLSearchParams();
    
    // Map to backend endpoints
    switch (chartType) {
      case 'bar':
        endpoint = '/api/charts/bar';
        params.append('metric', metric);
        params.append('period', period);
        break;
      case 'pie':
        endpoint = '/api/charts/pie';
        params.append('metric', metric);
        params.append('period', period);
        break;
      default:
        endpoint = '/api/charts/bar';
        params.append('metric', metric);
        params.append('period', period);
    }
    
    const response = await fetch(`${API_URL}${endpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const backendData = await response.json();
    
    if (backendData.success) {
      // Transform backend data to frontend format
      const transformedData = backendData.data.map((item: any, index: number) => {
        let id, label, value;
        
        // Handle different data structures based on chart type
        if (item.id && item.label && item.value !== undefined) {
          // Already in correct format (from pie charts)
          id = item.id;
          label = item.label;
          value = item.value;
        } else if (item.segment) {
          // User segments data
          id = item.segment;
          label = item.segment;
          value = item.user_count || 0;
        } else if (item.category) {
          // Category data
          id = item.category;
          label = item.category.charAt(0).toUpperCase() + item.category.slice(1);
          value = item.revenue || item.transaction_count || 0;
        } else if (item.x && typeof item.x === 'string') {
          // Bar chart data from backend
          id = item.x;
          label = item.x;
          // For bar charts, sum up all category values or use the first non-x property
          const keys = Object.keys(item).filter(key => key !== 'x');
          if (keys.length > 0) {
            value = keys.reduce((sum, key) => sum + (item[key] || 0), 0);
          } else {
            value = 0;
          }
        } else {
          // Fallback with better data
          id = `category-${index}`;
          label = `Category ${index + 1}`;
          value = Math.floor(Math.random() * 1000) + 100;
        }
        
        return { id, label, value };
      });
      
      return NextResponse.json({ data: transformedData });
    } else {
      throw new Error(backendData.error || 'Failed to fetch chart data');
    }
  } catch (error) {
    console.error('Error fetching chart data from backend:', error);
    
    // Fallback to mock data if backend is unavailable
    const fallbackData = generateChartData(numericValue, metric);
    return NextResponse.json({ data: fallbackData });
  }
} 