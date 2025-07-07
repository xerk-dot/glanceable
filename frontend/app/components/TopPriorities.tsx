"use client";

import React, { useEffect, useState } from 'react';
import OverviewCard from './OverviewCard';

interface Priority {
  id: string;
  task: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const TopPriorities: React.FC = () => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const response = await fetch('/api/priorities');
        const data = await response.json();
        setPriorities(data.priorities);
      } catch (error) {
        console.error('Error fetching priorities:', error);
        // Fallback to mock data if API fails
        setPriorities([
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
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorities();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': 
        return <span className="px-2 py-0.5 bg-warning/20 text-warning-foreground rounded text-xs">Pending</span>;
      case 'in-progress': 
        return <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">In Progress</span>;
      case 'completed': 
        return <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs">Completed</span>;
      default: 
        return null;
    }
  };

  return (
    <OverviewCard title="Top Priorities" variant="priorities">
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-destructive"></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {priorities.map((priority) => (
            <li key={priority.id} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-medium text-card-foreground">{priority.task}</span>
                {getStatusBadge(priority.status)}
              </div>
              <div className="text-xs text-muted-foreground">
                Due: {priority.deadline}
              </div>
            </li>
          ))}
        </ul>
      )}
    </OverviewCard>
  );
};

export default TopPriorities; 