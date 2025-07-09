"use client";

import React, { useState } from 'react';
import OverviewCard from './OverviewCard';

interface Priority {
  id: string;
  task: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const TopPriorities: React.FC = () => {
  const [priorities, setPriorities] = useState<Priority[]>([
    { id: '1', task: 'Review Q4 financials', deadline: 'Today', status: 'in-progress' },
    { id: '2', task: 'Update team on project status', deadline: 'Dec 15', status: 'pending' },
    { id: '3', task: 'Prepare monthly report', deadline: 'Dec 18', status: 'pending' },
    { id: '4', task: 'Client meeting prep', deadline: 'Tomorrow', status: 'completed' },
    { id: '5', task: 'Budget planning session', deadline: 'Dec 20', status: 'pending' },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState({
    task: '',
    deadline: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed'
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'in-progress':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>In Progress</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  const handleAddPriority = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriority.task && newPriority.deadline) {
      const priority: Priority = {
        id: Date.now().toString(),
        task: newPriority.task,
        deadline: newPriority.deadline,
        status: newPriority.status
      };
      
      setPriorities(prev => [...prev, priority]);
      setNewPriority({ task: '', deadline: '', status: 'pending' });
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPriority({ task: '', deadline: '', status: 'pending' });
  };

  const handleRandomGenerate = () => {
    const sampleTasks = [
      { task: 'Schedule team standup', deadline: 'Today' },
      { task: 'Review code changes', deadline: 'Tomorrow' },
      { task: 'Update documentation', deadline: 'Dec 22' },
      { task: 'Client presentation', deadline: 'Next week' },
      { task: 'Performance review', deadline: 'Dec 25' },
      { task: 'Budget approval', deadline: 'End of month' },
    ];
    
    const randomTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
    const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    setNewPriority({
      task: randomTask.task,
      deadline: randomTask.deadline,
      status: randomStatus
    });
  };

  return (
    <>
      <OverviewCard title="Top Priorities" variant="priorities" onAdd={handleAddPriority}>
        <ul className="h-48 overflow-y-auto space-y-3">
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
      </OverviewCard>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Priority</h3>
              <button
                type="button"
                onClick={handleRandomGenerate}
                className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Random Generate
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
                  placeholder="e.g., Review quarterly reports"
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
                  placeholder="e.g., Today, Dec 15, Next week"
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
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
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