import { NextRequest, NextResponse } from 'next/server';

interface UserRecommendation {
  id: string;
  text: string;
  urgency: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  timeframe?: string;
  channel?: string;
  topic?: string;
  category?: 'ai-generated' | 'user-created' | 'system';
  implemented?: boolean;
  created_at: string;
  updated_at: string;
}

// In-memory storage (replace with database in production)
let userRecommendations: UserRecommendation[] = [
  {
    id: '1',
    text: 'Implement A/B testing for the new landing page design to optimize conversion rates',
    urgency: 'high',
    impact: 'high',
    timeframe: 'month',
    channel: 'web',
    topic: 'marketing',
    category: 'ai-generated',
    implemented: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    text: 'Add push notifications for abandoned cart recovery to increase mobile sales',
    urgency: 'medium',
    impact: 'high',
    timeframe: 'quarter',
    channel: 'mobile',
    topic: 'product',
    category: 'user-created',
    implemented: false,
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
    const urgency = searchParams.get('urgency');
    const impact = searchParams.get('impact');
    const category = searchParams.get('category');
    const implemented = searchParams.get('implemented');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredRecommendations = userRecommendations;

    // Apply filters
    if (timeframe && timeframe !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(item => item.timeframe === timeframe);
    }
    if (channel && channel !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(item => item.channel === channel);
    }
    if (topic && topic !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(item => item.topic === topic);
    }
    if (urgency && urgency !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(item => item.urgency === urgency);
    }
    if (impact && impact !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(item => item.impact === impact);
    }
    if (category && category !== 'all') {
      filteredRecommendations = filteredRecommendations.filter(item => item.category === category);
    }
    if (implemented !== null && implemented !== undefined) {
      const isImplemented = implemented === 'true';
      filteredRecommendations = filteredRecommendations.filter(item => item.implemented === isImplemented);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecommendations = filteredRecommendations.slice(startIndex, endIndex);

    return NextResponse.json({
      recommendations: paginatedRecommendations,
      pagination: {
        page,
        limit,
        total: filteredRecommendations.length,
        totalPages: Math.ceil(filteredRecommendations.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { text, urgency, impact } = body;
    if (!text || !urgency || !impact) {
      return NextResponse.json({ 
        error: 'Missing required fields: text, urgency, impact' 
      }, { status: 400 });
    }

    // Validate urgency
    if (!['high', 'medium', 'low'].includes(urgency)) {
      return NextResponse.json({ 
        error: 'urgency must be one of: high, medium, low' 
      }, { status: 400 });
    }

    // Validate impact
    if (!['high', 'medium', 'low'].includes(impact)) {
      return NextResponse.json({ 
        error: 'impact must be one of: high, medium, low' 
      }, { status: 400 });
    }

    // Validate category if provided
    if (body.category && !['ai-generated', 'user-created', 'system'].includes(body.category)) {
      return NextResponse.json({ 
        error: 'category must be one of: ai-generated, user-created, system' 
      }, { status: 400 });
    }

    const newRecommendation: UserRecommendation = {
      id: Date.now().toString(),
      text,
      urgency,
      impact,
      timeframe: body.timeframe || 'month',
      channel: body.channel || 'all',
      topic: body.topic || 'all',
      category: body.category || 'user-created',
      implemented: body.implemented || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    userRecommendations.push(newRecommendation);

    return NextResponse.json({ 
      message: 'Recommendation created successfully',
      recommendation: newRecommendation 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return NextResponse.json({ error: 'Failed to create recommendation' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Recommendation ID is required' }, { status: 400 });
    }

    const recommendationIndex = userRecommendations.findIndex(item => item.id === id);
    if (recommendationIndex === -1) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Update recommendation with provided fields
    const updatedRecommendation = {
      ...userRecommendations[recommendationIndex],
      ...body,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    userRecommendations[recommendationIndex] = updatedRecommendation;

    return NextResponse.json({ 
      message: 'Recommendation updated successfully',
      recommendation: updatedRecommendation 
    });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json({ error: 'Failed to update recommendation' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Recommendation ID is required' }, { status: 400 });
    }

    const recommendationIndex = userRecommendations.findIndex(item => item.id === id);
    if (recommendationIndex === -1) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    const deletedRecommendation = userRecommendations.splice(recommendationIndex, 1)[0];

    return NextResponse.json({ 
      message: 'Recommendation deleted successfully',
      recommendation: deletedRecommendation 
    });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    return NextResponse.json({ error: 'Failed to delete recommendation' }, { status: 500 });
  }
}