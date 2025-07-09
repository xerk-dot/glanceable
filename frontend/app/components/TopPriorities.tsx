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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState({
    task: '',
    deadline: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed'
  });

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        // First try to get user-created priorities from database
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/priorities`);
        const userData = await userResponse.json();
        
        if (userData.success && userData.priorities.length > 0) {
          setPriorities(userData.priorities);
        } else {
          // Fallback to system priorities if no user priorities
          const response = await fetch('/api/priorities');
          const data = await response.json();
          setPriorities(data.priorities);
        }
      } catch (error) {
        console.error('Error fetching priorities:', error);
        // Fallback to mock data if both APIs fail
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
        return <span className="px-2 py-0.5 bg-primary/20 text-black rounded text-xs">In Progress</span>;
      case 'completed': 
        return <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs">Completed</span>;
      default: 
        return null;
    }
  };

  const handleAddPriority = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriority.task && newPriority.deadline) {
      const priority: Priority = {
        id: `task${Date.now()}`,
        task: newPriority.task,
        deadline: newPriority.deadline,
        status: newPriority.status
      };
      
      try {
        // Save to database
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/priorities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(priority),
        });
        
        const result = await response.json();
        if (result.success) {
          setPriorities(prev => [...prev, result.priority]);
        } else {
          console.error('Failed to save priority:', result.error);
          setPriorities(prev => [...prev, priority]);
        }
      } catch (error) {
        console.error('Error saving priority:', error);
        setPriorities(prev => [...prev, priority]);
      }
      
      setNewPriority({ task: '', deadline: '', status: 'pending' });
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPriority({ task: '', deadline: '', status: 'pending' });
  };

  const handleAIGenerate = async () => {
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'priority',
          context: 'business priorities and tasks'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const result = await response.json();
      const aiPriority = result.data;

      setNewPriority({
        task: aiPriority.task,
        deadline: aiPriority.deadline,
        status: aiPriority.status as 'pending' | 'in-progress' | 'completed'
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      // Fallback to a simple task if API fails
      setNewPriority({
        task: 'AI Generation Failed - Please try again',
        deadline: 'Today',
        status: 'pending'
      });
    }
  };

  return (
    <>
      <OverviewCard title="Top Priorities" variant="priorities" onAdd={handleAddPriority}>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ul className="h-32 overflow-y-auto space-y-3">
            {priorities.map((priority) => (
              <li key={priority.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{priority.task}</span>
                  {getStatusBadge(priority.status)}
                </div>
                <div className="text-xs text-gray-600">
                  Due: {priority.deadline}
                </div>
              </li>
            ))}
          </ul>
        )}
      </OverviewCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Priority</h3>
              <button
                type="button"
                onClick={handleAIGenerate}
                className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                AI Generate
              </button>
            </div>
            <form onSubmit={handleSubmitPriority} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                <input
                  type="text"
                  value={newPriority.task}
                  onChange={(e) => setNewPriority(prev => ({ ...prev, task: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="Enter task description..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="text"
                  value={newPriority.deadline}
                  onChange={(e) => setNewPriority(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  placeholder="e.g., Today, Tomorrow, Dec 15"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newPriority.status}
                  onChange={(e) => setNewPriority(prev => ({ ...prev, status: e.target.value as 'pending' | 'in-progress' | 'completed' }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TopPriorities; 