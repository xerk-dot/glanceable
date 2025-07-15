import { NextRequest, NextResponse } from 'next/server';

interface UserMetric {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
  timeframe?: string;
  channel?: string;
  topic?: string;
  unit?: string;
  target?: number;
  created_at: string;
  updated_at: string;
}

// In-memory storage (replace with database in production)
let userMetrics: UserMetric[] = [
  {
    id: '1',
    title: 'Custom Revenue Target',
    value: '$125,430',
    change: 12.5,
    changeType: 'positive',
    trend: 'up',
    timeframe: 'month',
    channel: 'web',
    topic: 'sales',
    unit: 'USD',
    target: 150000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Email Campaign CTR',
    value: '3.2%',
    change: -0.8,
    changeType: 'negative',
    trend: 'down',
    timeframe: 'week',
    channel: 'email',
    topic: 'marketing',
    unit: 'percentage',
    target: 4.0,
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredMetrics = userMetrics;

    // Apply filters
    if (timeframe && timeframe !== 'all') {
      filteredMetrics = filteredMetrics.filter(metric => metric.timeframe === timeframe);
    }
    if (channel && channel !== 'all') {
      filteredMetrics = filteredMetrics.filter(metric => metric.channel === channel);
    }
    if (topic && topic !== 'all') {
      filteredMetrics = filteredMetrics.filter(metric => metric.topic === topic);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMetrics = filteredMetrics.slice(startIndex, endIndex);

    return NextResponse.json({
      metrics: paginatedMetrics,
      pagination: {
        page,
        limit,
        total: filteredMetrics.length,
        totalPages: Math.ceil(filteredMetrics.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { title, value } = body;
    if (!title || value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, value' 
      }, { status: 400 });
    }

    // Validate changeType if provided
    if (body.changeType && !['positive', 'negative', 'neutral'].includes(body.changeType)) {
      return NextResponse.json({ 
        error: 'changeType must be one of: positive, negative, neutral' 
      }, { status: 400 });
    }

    // Validate trend if provided
    if (body.trend && !['up', 'down', 'neutral'].includes(body.trend)) {
      return NextResponse.json({ 
        error: 'trend must be one of: up, down, neutral' 
      }, { status: 400 });
    }

    const newMetric: UserMetric = {
      id: Date.now().toString(),
      title,
      value,
      change: body.change,
      changeType: body.changeType || 'neutral',
      trend: body.trend || 'neutral',
      timeframe: body.timeframe || 'month',
      channel: body.channel || 'all',
      topic: body.topic || 'all',
      unit: body.unit,
      target: body.target,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    userMetrics.push(newMetric);

    return NextResponse.json({ 
      message: 'Metric created successfully',
      metric: newMetric 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Metric ID is required' }, { status: 400 });
    }

    const metricIndex = userMetrics.findIndex(metric => metric.id === id);
    if (metricIndex === -1) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 });
    }

    // Update metric with provided fields
    const updatedMetric = {
      ...userMetrics[metricIndex],
      ...body,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    userMetrics[metricIndex] = updatedMetric;

    return NextResponse.json({ 
      message: 'Metric updated successfully',
      metric: updatedMetric 
    });
  } catch (error) {
    console.error('Error updating metric:', error);
    return NextResponse.json({ error: 'Failed to update metric' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Metric ID is required' }, { status: 400 });
    }

    const metricIndex = userMetrics.findIndex(metric => metric.id === id);
    if (metricIndex === -1) {
      return NextResponse.json({ error: 'Metric not found' }, { status: 404 });
    }

    const deletedMetric = userMetrics.splice(metricIndex, 1)[0];

    return NextResponse.json({ 
      message: 'Metric deleted successfully',
      metric: deletedMetric 
    });
  } catch (error) {
    console.error('Error deleting metric:', error);
    return NextResponse.json({ error: 'Failed to delete metric' }, { status: 500 });
  }
}