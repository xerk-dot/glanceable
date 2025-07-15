import { NextRequest, NextResponse } from 'next/server';

interface UserPriority {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'planned';
  timeframe?: string;
  channel?: string;
  topic?: string;
  assignee?: string;
  created_at: string;
  updated_at: string;
}

// In-memory storage (replace with database in production)
let userPriorities: UserPriority[] = [
  {
    id: '1',
    title: 'Optimize mobile checkout flow',
    description: 'Reduce cart abandonment by improving the mobile checkout experience',
    deadline: '2025-08-15',
    priority: 'high',
    impact: 'high',
    status: 'in-progress',
    timeframe: 'quarter',
    channel: 'mobile',
    topic: 'product',
    assignee: 'Product Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Launch email automation campaign',
    description: 'Set up automated email sequences for new user onboarding',
    deadline: '2025-07-30',
    priority: 'medium',
    impact: 'medium',
    status: 'planned',
    timeframe: 'month',
    channel: 'email',
    topic: 'marketing',
    assignee: 'Marketing Team',
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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const impact = searchParams.get('impact');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredPriorities = userPriorities;

    // Apply filters
    if (timeframe && timeframe !== 'all') {
      filteredPriorities = filteredPriorities.filter(item => item.timeframe === timeframe);
    }
    if (channel && channel !== 'all') {
      filteredPriorities = filteredPriorities.filter(item => item.channel === channel);
    }
    if (topic && topic !== 'all') {
      filteredPriorities = filteredPriorities.filter(item => item.topic === topic);
    }
    if (status && status !== 'all') {
      filteredPriorities = filteredPriorities.filter(item => item.status === status);
    }
    if (priority && priority !== 'all') {
      filteredPriorities = filteredPriorities.filter(item => item.priority === priority);
    }
    if (impact && impact !== 'all') {
      filteredPriorities = filteredPriorities.filter(item => item.impact === impact);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPriorities = filteredPriorities.slice(startIndex, endIndex);

    return NextResponse.json({
      priorities: paginatedPriorities,
      pagination: {
        page,
        limit,
        total: filteredPriorities.length,
        totalPages: Math.ceil(filteredPriorities.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user priorities:', error);
    return NextResponse.json({ error: 'Failed to fetch priorities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { title, priority, impact, status } = body;
    if (!title || !priority || !impact || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, priority, impact, status' 
      }, { status: 400 });
    }

    // Validate priority
    if (!['high', 'medium', 'low'].includes(priority)) {
      return NextResponse.json({ 
        error: 'priority must be one of: high, medium, low' 
      }, { status: 400 });
    }

    // Validate impact
    if (!['high', 'medium', 'low'].includes(impact)) {
      return NextResponse.json({ 
        error: 'impact must be one of: high, medium, low' 
      }, { status: 400 });
    }

    // Validate status
    if (!['pending', 'in-progress', 'completed', 'planned'].includes(status)) {
      return NextResponse.json({ 
        error: 'status must be one of: pending, in-progress, completed, planned' 
      }, { status: 400 });
    }

    const newPriority: UserPriority = {
      id: Date.now().toString(),
      title,
      description: body.description,
      deadline: body.deadline,
      priority,
      impact,
      status,
      timeframe: body.timeframe || 'month',
      channel: body.channel || 'all',
      topic: body.topic || 'all',
      assignee: body.assignee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    userPriorities.push(newPriority);

    return NextResponse.json({ 
      message: 'Priority created successfully',
      priority: newPriority 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating priority:', error);
    return NextResponse.json({ error: 'Failed to create priority' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Priority ID is required' }, { status: 400 });
    }

    const priorityIndex = userPriorities.findIndex(item => item.id === id);
    if (priorityIndex === -1) {
      return NextResponse.json({ error: 'Priority not found' }, { status: 404 });
    }

    // Update priority with provided fields
    const updatedPriority = {
      ...userPriorities[priorityIndex],
      ...body,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    userPriorities[priorityIndex] = updatedPriority;

    return NextResponse.json({ 
      message: 'Priority updated successfully',
      priority: updatedPriority 
    });
  } catch (error) {
    console.error('Error updating priority:', error);
    return NextResponse.json({ error: 'Failed to update priority' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Priority ID is required' }, { status: 400 });
    }

    const priorityIndex = userPriorities.findIndex(item => item.id === id);
    if (priorityIndex === -1) {
      return NextResponse.json({ error: 'Priority not found' }, { status: 404 });
    }

    const deletedPriority = userPriorities.splice(priorityIndex, 1)[0];

    return NextResponse.json({ 
      message: 'Priority deleted successfully',
      priority: deletedPriority 
    });
  } catch (error) {
    console.error('Error deleting priority:', error);
    return NextResponse.json({ error: 'Failed to delete priority' }, { status: 500 });
  }
}