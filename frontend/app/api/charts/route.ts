import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chartType = searchParams.get('chartType') || 'bar';
  const numericValue = searchParams.get('numericValue') || 'count';
  const metric = searchParams.get('metric') || 'revenue';
  const period = searchParams.get('period') || '30d';
  
  console.log(`Chart API called: chartType=${chartType}, metric=${metric}, numericValue=${numericValue}, period=${period}`);
  
  try {
    // Only try backend if URL is configured
    if (BACKEND_URL) {
      let endpoint = '';
      const params = new URLSearchParams();
      
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
      
      const backendUrl = `${BACKEND_URL}${endpoint}?${params}`;
      console.log(`Calling backend: ${backendUrl}`);
      
      const response = await fetch(backendUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendData = await response.json();
      console.log('Backend response:', backendData);
      
      if (backendData.success) {
        return NextResponse.json({
          success: true,
          data: backendData.data
        });
      } else {
        throw new Error('Backend returned unsuccessful response');
      }
    } else {
      // No backend configured, use fallback immediately
      throw new Error('No backend URL configured');
    }
    
  } catch (error) {
    console.error(`Error fetching chart data:`, error);
    
    // Fallback data if backend is unavailable
    const fallbackData = {
      pie: [
        { id: 'Electronics', label: 'Electronics', value: 45000 },
        { id: 'Clothing', label: 'Clothing', value: 32000 },
        { id: 'Books', label: 'Books', value: 18000 },
        { id: 'Home', label: 'Home & Garden', value: 25000 }
      ],
      bar: [
        { id: 'Q1', label: 'Q1 2024', value: 28000 },
        { id: 'Q2', label: 'Q2 2024', value: 31000 },
        { id: 'Q3', label: 'Q3 2024', value: 35000 },
        { id: 'Q4', label: 'Q4 2024', value: 29000 }
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: fallbackData[chartType as keyof typeof fallbackData] || fallbackData.bar
    });
  }
} 