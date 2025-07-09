import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5001';

// Helper function to generate AI-powered chart data (fallback)
const generateChartData = async (numericValue: string, metric: string, chartType: string) => {
  try {
    // Use AI to generate contextually appropriate labels
    const response = await fetch('http://localhost:3000/api/ai-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'chart_labels',
        context: { metric, numericValue, chartType }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.data;
    }
  } catch (error) {
    console.warn('AI label generation failed, using contextual fallbacks:', error);
  }

  // Contextual fallbacks based on metric and chart type
  const contextualLabels: Record<string, string[]> = {
    revenue: ['Product Sales', 'Services', 'Subscriptions', 'Licensing', 'Support'],
    user_segments: ['Premium Users', 'Regular Users', 'Basic Users', 'Trial Users', 'Enterprise'],
    daily_users: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    orders: ['Online Orders', 'Mobile Orders', 'Phone Orders', 'In-Store', 'Partner'],
    category: ['Technology', 'Marketing', 'Operations', 'Sales', 'Support'],
    country: ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia'],
    channel: ['Website', 'Mobile App', 'Email', 'Social Media', 'Direct'],
    product: ['Core Product', 'Premium Features', 'Add-ons', 'Professional', 'Enterprise'],
    traffic: ['Organic Search', 'Paid Ads', 'Social Media', 'Direct Traffic', 'Referrals'],
    conversion: ['Landing Page', 'Product Page', 'Checkout', 'Email Campaign', 'Social'],
  };

  const labels = contextualLabels[metric] || contextualLabels['category'] || ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
  
  return labels.slice(0, chartType === 'pie' ? 5 : 7).map((label, index) => {
    let value = 0;
    
    // Generate realistic values based on the numeric value type and metric
    switch (numericValue) {
      case 'count':
        value = Math.floor(Math.random() * 100) + 10;
        break;
      case 'average':
        value = Math.floor(Math.random() * 50) + 50;
        break;
      case 'sum':
        if (metric === 'revenue') {
          value = Math.floor(Math.random() * 50000) + 5000; // Revenue in dollars
        } else {
          value = Math.floor(Math.random() * 1000) + 500;
        }
        break;
      case 'median':
        value = Math.floor(Math.random() * 40) + 30;
        break;
      default:
        value = Math.floor(Math.random() * 100) + 10;
    }
    
    return {
      id: `${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
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
        
        // Handle different data structures based on metric type
        if (metric === 'revenue') {
          if (item.category) {
            // Revenue by category data
            id = `${item.category}-${index}`;
            label = item.category.charAt(0).toUpperCase() + item.category.slice(1);
            value = item.revenue || item.total_revenue || 0;
          } else if (item.x && typeof item.x === 'string') {
            // Bar chart revenue data
            id = `${item.x}-${index}`;
            label = item.x;
            // Sum revenue values for bar charts
            const keys = Object.keys(item).filter(key => key !== 'x' && typeof item[key] === 'number');
            value = keys.reduce((sum, key) => sum + (item[key] || 0), 0);
          } else {
            // Fallback revenue data
            id = `revenue-${index}`;
            label = `Category ${index + 1}`;
            value = Math.floor(Math.random() * 5000) + 1000;
          }
        } else if (metric === 'user_segments') {
          if (item.segment) {
            // User segments data
            id = `${item.segment}-${index}`;
            label = item.segment.charAt(0).toUpperCase() + item.segment.slice(1);
            value = item.user_count || item.count || 0;
          } else if (item.id && item.label && item.value !== undefined) {
            // Already in correct format, but ensure unique ID
            id = `${item.id}-${index}`;
            label = item.label;
            value = item.value;
          } else {
            // Fallback user segment data
            const segments = ['Premium', 'Regular', 'Basic', 'Trial'];
            id = `${segments[index % segments.length].toLowerCase()}-${index}`;
            label = segments[index % segments.length];
            value = Math.floor(Math.random() * 100) + 10;
          }
        } else if (metric === 'daily_users') {
          if (item.date || item.x) {
            // Daily users data
            id = `${item.date || item.x}-${index}`;
            label = item.date || item.x;
            value = item.active_users || item.users || item.value || 0;
          } else {
            // Fallback daily users data
            const date = new Date();
            date.setDate(date.getDate() - index);
            id = `${date.toISOString().split('T')[0]}-${index}`;
            label = date.toLocaleDateString();
            value = Math.floor(Math.random() * 200) + 50;
          }
                 } else {
           // Generic fallback with contextual labels
           if (item.id && item.label && item.value !== undefined) {
             id = `${item.id}-${index}`;
             label = item.label;
             value = item.value;
           } else {
             // Use contextual labels instead of generic "Item X"
             const contextualLabels = {
               revenue: ['Product Sales', 'Services', 'Subscriptions', 'Licensing', 'Support'],
               user_segments: ['Premium', 'Regular', 'Basic', 'Trial', 'Enterprise'],
               daily_users: ['Weekday Users', 'Weekend Users', 'Peak Hours', 'Off Hours', 'Mobile Users'],
               orders: ['Online', 'Mobile', 'Phone', 'In-Store', 'Partner'],
               category: ['Technology', 'Marketing', 'Operations', 'Sales', 'Support'],
             };
             const labels = contextualLabels[metric as keyof typeof contextualLabels] || ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
             label = labels[index % labels.length] || `${metric} ${index + 1}`;
             
             id = `${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`;
             value = Math.floor(Math.random() * 100) + 10;
           }
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
    const fallbackData = await generateChartData(numericValue, metric, chartType);
    return NextResponse.json({ data: fallbackData });
  }
} 