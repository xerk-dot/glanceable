import { NextRequest, NextResponse } from 'next/server';

interface Chart {
  id: string;
  title: string;
  chartType: 'pie' | 'bar';
  numericValue: 'count' | 'average' | 'sum' | 'median';
  metric: 'revenue' | 'daily_users' | 'orders' | 'user_segments' | 'category';
  timeframe?: string;
  channel?: string;
  topic?: string;
  created_at: string;
  updated_at: string;
}

// In-memory storage (replace with database in production)
let userCharts: Chart[] = [
  {
    id: '1',
    title: 'Revenue by Channel',
    chartType: 'bar',
    numericValue: 'sum',
    metric: 'revenue',
    timeframe: 'month',
    channel: 'all',
    topic: 'sales',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'User Segments Distribution',
    chartType: 'pie',
    numericValue: 'count',
    metric: 'user_segments',
    timeframe: 'quarter',
    channel: 'all',
    topic: 'marketing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe');
    const channel = searchParams.get('channel');
    const topic = searchParams.get('topic');
    const chartType = searchParams.get('chartType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredCharts = userCharts;

    // Apply filters
    if (timeframe && timeframe !== 'all') {
      filteredCharts = filteredCharts.filter(chart => chart.timeframe === timeframe);
    }
    if (channel && channel !== 'all') {
      filteredCharts = filteredCharts.filter(chart => chart.channel === channel);
    }
    if (topic && topic !== 'all') {
      filteredCharts = filteredCharts.filter(chart => chart.topic === topic);
    }
    if (chartType && chartType !== 'all') {
      filteredCharts = filteredCharts.filter(chart => chart.chartType === chartType);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCharts = filteredCharts.slice(startIndex, endIndex);

    return NextResponse.json({
      charts: paginatedCharts,
      pagination: {
        page,
        limit,
        total: filteredCharts.length,
        totalPages: Math.ceil(filteredCharts.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user charts:', error);
    return NextResponse.json({ error: 'Failed to fetch charts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { title, chartType, numericValue, metric } = body;
    if (!title || !chartType || !numericValue || !metric) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, chartType, numericValue, metric' 
      }, { status: 400 });
    }

    // Validate chartType
    if (!['pie', 'bar'].includes(chartType)) {
      return NextResponse.json({ 
        error: 'chartType must be either "pie" or "bar"' 
      }, { status: 400 });
    }

    // Validate numericValue
    if (!['count', 'average', 'sum', 'median'].includes(numericValue)) {
      return NextResponse.json({ 
        error: 'numericValue must be one of: count, average, sum, median' 
      }, { status: 400 });
    }

    // Validate metric
    if (!['revenue', 'daily_users', 'orders', 'user_segments', 'category'].includes(metric)) {
      return NextResponse.json({ 
        error: 'metric must be one of: revenue, daily_users, orders, user_segments, category' 
      }, { status: 400 });
    }

    const newChart: Chart = {
      id: Date.now().toString(),
      title,
      chartType,
      numericValue,
      metric,
      timeframe: body.timeframe || 'month',
      channel: body.channel || 'all',
      topic: body.topic || 'all',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    userCharts.push(newChart);

    return NextResponse.json({ 
      message: 'Chart created successfully',
      chart: newChart 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating chart:', error);
    return NextResponse.json({ error: 'Failed to create chart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chart ID is required' }, { status: 400 });
    }

    const chartIndex = userCharts.findIndex(chart => chart.id === id);
    if (chartIndex === -1) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 });
    }

    // Update chart with provided fields
    const updatedChart = {
      ...userCharts[chartIndex],
      ...body,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    userCharts[chartIndex] = updatedChart;

    return NextResponse.json({ 
      message: 'Chart updated successfully',
      chart: updatedChart 
    });
  } catch (error) {
    console.error('Error updating chart:', error);
    return NextResponse.json({ error: 'Failed to update chart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Chart ID is required' }, { status: 400 });
    }

    const chartIndex = userCharts.findIndex(chart => chart.id === id);
    if (chartIndex === -1) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 });
    }

    const deletedChart = userCharts.splice(chartIndex, 1)[0];

    return NextResponse.json({ 
      message: 'Chart deleted successfully',
      chart: deletedChart 
    });
  } catch (error) {
    console.error('Error deleting chart:', error);
    return NextResponse.json({ error: 'Failed to delete chart' }, { status: 500 });
  }
}