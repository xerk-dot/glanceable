"use client";

import React, { useState, useEffect } from 'react';
import OverviewCard from './OverviewCard';
import { useFilters, Timeframe, Channel, Topic } from './FilterContext';

interface Priority {
  id: string;
  title?: string;
  task?: string;
  description?: string;
  deadline?: string;
  priority?: string;
  impact?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'planned';
  timeframe?: Timeframe;
  channel?: Channel;
  topic?: Topic;
}

const TopPriorities: React.FC = () => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [, setLoading] = useState(true);
  const { filters } = useFilters();

  const fetchPriorities = async () => {
    try {
      // Get user priorities from backend
      const userResponse = await fetch('/backend/api/user/priorities');
      const userData = await userResponse.json();
      
      console.log('User priorities response:', userData);
      
      // Also get system priorities from backend
      const systemResponse = await fetch('/backend/api/priorities');
      const systemData = await systemResponse.json();
      
      console.log('System priorities response:', systemData);
      
      let allPriorities: Priority[] = [];
      
      // Transform user priorities - backend returns items array
      if (userData.items) {
        console.log('Transforming user priorities:', userData.items);
        const transformedUserPriorities = userData.items.map((priority: any) => ({
          id: priority.id,
          task: priority.title,
          deadline: priority.deadline || 'No deadline',
          status: priority.status,
          timeframe: priority.timeframe || Timeframe.WEEK,
          channel: priority.channel || Channel.DIRECT,
          topic: priority.topic || Topic.OPERATIONS
        }));
        console.log('Transformed user priorities:', transformedUserPriorities);
        allPriorities = [...allPriorities, ...transformedUserPriorities];
      }
      
      // Transform system priorities
      if (systemData.priorities) {
        const transformedSystemPriorities = systemData.priorities.map((priority: any) => ({
          id: priority.id,
          task: priority.title || priority.task,
          deadline: priority.deadline || 'No deadline',
          status: priority.status === 'planned' ? 'pending' : priority.status,
          timeframe: Timeframe.WEEK,
          channel: Channel.DIRECT,
          topic: Topic.OPERATIONS
        }));
        allPriorities = [...allPriorities, ...transformedSystemPriorities];
      }
      
      if (allPriorities.length === 0) {
        // Fallback data if no priorities are available
        allPriorities = [
          { id: '1', task: 'Review Q4 financials', deadline: 'Today', status: 'in-progress', timeframe: Timeframe.TODAY, channel: Channel.DIRECT, topic: Topic.FINANCE },
          { id: '2', task: 'Update team on project status', deadline: 'Dec 15', status: 'pending', timeframe: Timeframe.WEEK, channel: Channel.EMAIL, topic: Topic.OPERATIONS },
        ];
      }
      
      console.log('Final all priorities:', allPriorities);
      setPriorities(allPriorities);
    } catch (error) {
      console.error('Error fetching priorities:', error);
      // Fallback data
      setPriorities([
        { id: '1', task: 'Review Q4 financials', deadline: 'Today', status: 'in-progress', timeframe: Timeframe.TODAY, channel: Channel.DIRECT, topic: Topic.FINANCE },
        { id: '2', task: 'Update team on project status', deadline: 'Dec 15', status: 'pending', timeframe: Timeframe.WEEK, channel: Channel.EMAIL, topic: Topic.OPERATIONS },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  // Filter priorities based on global filters
  const filteredPriorities = priorities.filter((priority) => {
    const timeframeMatch = filters.timeframe === Timeframe.ALL || priority.timeframe === filters.timeframe;
    const channelMatch = filters.channel === Channel.ALL || priority.channel === filters.channel;
    const topicMatch = filters.topic === Topic.ALL || priority.topic === filters.topic;
    return timeframeMatch && channelMatch && topicMatch;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState({
    task: '',
    deadline: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    timeframe: Timeframe.WEEK,
    channel: Channel.DIRECT,
    topic: Topic.OPERATIONS
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

  const handleSubmitPriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriority.task && newPriority.deadline) {
      try {
        const priorityData = {
          title: newPriority.task,
          deadline: newPriority.deadline,
          priority: 'medium', // Default priority level
          impact: 'medium', // Default impact level
          status: newPriority.status,
          timeframe: newPriority.timeframe.toLowerCase(),
          channel: newPriority.channel.toLowerCase(),
          topic: newPriority.topic.toLowerCase()
        };

        const response = await fetch('/backend/api/user/priorities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(priorityData)
        });

        if (response.ok) {
          // Refresh the priorities list
          await fetchPriorities();
          setNewPriority({ task: '', deadline: '', status: 'pending', timeframe: Timeframe.WEEK, channel: Channel.DIRECT, topic: Topic.OPERATIONS });
          setIsModalOpen(false);
        } else {
          console.error('Failed to create priority');
        }
      } catch (error) {
        console.error('Error creating priority:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPriority({ task: '', deadline: '', status: 'pending', timeframe: Timeframe.WEEK, channel: Channel.DIRECT, topic: Topic.OPERATIONS });
  };

  const handleRandomGenerate = () => {
    const sampleTasks = [
      { task: 'Schedule team standup', deadline: 'Today', timeframe: Timeframe.TODAY, channel: Channel.EMAIL, topic: Topic.OPERATIONS },
      { task: 'Review code changes', deadline: 'Tomorrow', timeframe: Timeframe.TODAY, channel: Channel.DIRECT, topic: Topic.TECH },
      { task: 'Update documentation', deadline: 'Dec 22', timeframe: Timeframe.WEEK, channel: Channel.WEB, topic: Topic.PRODUCT },
      { task: 'Client presentation', deadline: 'Next week', timeframe: Timeframe.WEEK, channel: Channel.DIRECT, topic: Topic.SALES },
      { task: 'Performance review', deadline: 'Dec 25', timeframe: Timeframe.MONTH, channel: Channel.EMAIL, topic: Topic.OPERATIONS },
      { task: 'Budget approval', deadline: 'End of month', timeframe: Timeframe.MONTH, channel: Channel.DIRECT, topic: Topic.FINANCE },
    ];
    
    const randomTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
    const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    setNewPriority({
      task: randomTask.task,
      deadline: randomTask.deadline,
      status: randomStatus,
      timeframe: randomTask.timeframe,
      channel: randomTask.channel,
      topic: randomTask.topic
    });
  };

  return (
    <>
      <OverviewCard title="Top Priorities" variant="priorities" onAdd={handleAddPriority}>
        <ul className="h-48 overflow-y-auto space-y-3">
          {filteredPriorities.length > 0 ? (
            filteredPriorities.map((priority) => (
              <li key={priority.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{priority.task}</span>
                  {getStatusBadge(priority.status)}
                </div>
                <div className="text-xs text-gray-600">
                  Due: {priority.deadline}
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500 text-center py-8">
              No priorities match the selected filters.
            </li>
          )}
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                  <select
                    value={newPriority.timeframe}
                    onChange={(e) => setNewPriority(prev => ({ ...prev, timeframe: e.target.value as Timeframe }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  >
                    <option value={Timeframe.TODAY}>Today</option>
                    <option value={Timeframe.WEEK}>This Week</option>
                    <option value={Timeframe.MONTH}>This Month</option>
                    <option value={Timeframe.QUARTER}>This Quarter</option>
                    <option value={Timeframe.YEAR}>This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={newPriority.channel}
                    onChange={(e) => setNewPriority(prev => ({ ...prev, channel: e.target.value as Channel }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  >
                    <option value={Channel.WEB}>Web</option>
                    <option value={Channel.MOBILE}>Mobile</option>
                    <option value={Channel.EMAIL}>Email</option>
                    <option value={Channel.SOCIAL}>Social</option>
                    <option value={Channel.DIRECT}>Direct</option>
                    <option value={Channel.ORGANIC}>Organic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <select
                    value={newPriority.topic}
                    onChange={(e) => setNewPriority(prev => ({ ...prev, topic: e.target.value as Topic }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
                  >
                    <option value={Topic.SALES}>Sales</option>
                    <option value={Topic.MARKETING}>Marketing</option>
                    <option value={Topic.PRODUCT}>Product</option>
                    <option value={Topic.CUSTOMER_SERVICE}>Customer Service</option>
                    <option value={Topic.OPERATIONS}>Operations</option>
                    <option value={Topic.FINANCE}>Finance</option>
                    <option value={Topic.TECH}>Technology</option>
                  </select>
                </div>
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