import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for priorities
  const priorities = [
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

  return NextResponse.json({ priorities });
} 