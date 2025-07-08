import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:5001';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/priorities`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({ priorities: data.priorities });
    } else {
      throw new Error(data.error || 'Failed to fetch priorities');
    }
  } catch (error) {
    console.error('Error fetching priorities from backend:', error);
    
    // Fallback to mock data if backend is unavailable
    const fallbackPriorities = [
      { 
        id: 'task1', 
        task: 'Fix critical bug in payment gateway', 
        deadline: 'Today', 
        status: 'in-progress' 
      },
      { 
        id: 'task2', 
        task: 'Respond to enterprise client inquiry', 
        deadline: 'Today', 
        status: 'pending' 
      },
      { 
        id: 'task3', 
        task: 'Review Q2 performance metrics', 
        deadline: 'Tomorrow', 
        status: 'pending' 
      },
    ];
    
    return NextResponse.json({ priorities: fallbackPriorities });
  }
} 