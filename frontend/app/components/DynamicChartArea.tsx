"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ChartCard, { ChartData } from './ChartCard';
import ChartForm, { ChartFormData } from './ChartForm';
import { v4 as uuidv4 } from 'uuid';

interface Chart {
  id: string;
  title: string;
  chartType: 'pie' | 'bar';
  numericValue: string;
  metric: string;
  data: ChartData[];
}



const DynamicChartArea: React.FC = () => {
  // State for charts
  const [charts, setCharts] = useState<Chart[]>([]);

  // State for loading chart data
  const [loadingCharts, setLoadingCharts] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
  });

  // State for form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<Chart | null>(null);

  // Create simple static charts with random data
  const loadChartsFromDatabase = useCallback(async () => {
    // Just create some hardcoded charts with random data
    const staticCharts = [
      {
        id: '1',
        title: 'Revenue by Category',
        chartType: 'pie' as const,
        numericValue: 'sum',
        metric: 'revenue',
        data: [
          { id: 'Electronics', label: 'Electronics', value: 45000 },
          { id: 'Clothing', label: 'Clothing', value: 32000 },
          { id: 'Books', label: 'Books', value: 18000 },
          { id: 'Home', label: 'Home & Garden', value: 25000 },
          { id: 'Sports', label: 'Sports', value: 15000 },
        ],
      },
      {
        id: '2',
        title: 'User Segments',
        chartType: 'pie' as const,
        numericValue: 'count',
        metric: 'user_segments',
        data: [
          { id: 'Premium', label: 'Premium Users', value: 350 },
          { id: 'Regular', label: 'Regular Users', value: 800 },
          { id: 'Basic', label: 'Basic Users', value: 450 },
          { id: 'Trial', label: 'Trial Users', value: 200 },
        ],
      },
      {
        id: '3',
        title: 'Monthly Sales',
        chartType: 'bar' as const,
        numericValue: 'sum',
        metric: 'sales',
        data: [
          { id: 'Jan', label: 'January', value: 28000 },
          { id: 'Feb', label: 'February', value: 31000 },
          { id: 'Mar', label: 'March', value: 35000 },
          { id: 'Apr', label: 'April', value: 29000 },
          { id: 'May', label: 'May', value: 42000 },
          { id: 'Jun', label: 'June', value: 38000 },
        ],
      },
    ];
    
    setCharts(staticCharts);
    setLoadingCharts({});
  }, []);



  // Load charts from database on mount
  useEffect(() => {
    loadChartsFromDatabase();
  }, [loadChartsFromDatabase]); // loadChartsFromDatabase is memoized with empty deps

  const handleAddChart = () => {
    setEditingChart(null);
    setIsFormOpen(true);
  };

  const handleEditChart = (id: string) => {
    const chart = charts.find((c) => c.id === id);
    if (chart) {
      setEditingChart(chart);
      setIsFormOpen(true);
    }
  };

  const handleDeleteChart = (id: string) => {
    setCharts(charts.filter((chart) => chart.id !== id));
  };

  const handleFormSubmit = async (formData: ChartFormData) => {
    const chartId = editingChart?.id || uuidv4();
    
    // Set loading state for this chart
    setLoadingCharts(prev => ({ ...prev, [chartId]: true }));
    
    try {
      // Fetch chart data from API
      const response = await fetch(`/api/charts?chartType=${formData.chartType}&numericValue=${formData.numericValue}&metric=${formData.metric}&period=30d`);
      const result = await response.json();
      
      let chartData: ChartData[] = [];
      if (result.success && result.data) {
        chartData = result.data;
      } else {
        // Fallback to generated data if API fails
        const dataCount = formData.chartType === 'pie' ? 4 : 6;
        const categories = {
          revenue: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'],
          user_segments: ['Premium', 'Regular', 'Basic', 'Trial', 'Enterprise', 'Free'],
          daily_users: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          orders: ['Online', 'Mobile', 'In-Store', 'Phone', 'Partner', 'Wholesale'],
          sales: ['Q1', 'Q2', 'Q3', 'Q4', 'Holiday', 'Summer'],
          category: ['Tech', 'Fashion', 'Food', 'Travel', 'Health', 'Education']
        };
        
        const labels = categories[formData.metric as keyof typeof categories] || categories.category;
        
        chartData = labels.slice(0, dataCount).map((label) => ({
          id: label,
          label: label,
          value: Math.floor(Math.random() * (formData.metric === 'revenue' ? 50000 : 1000)) + (formData.metric === 'revenue' ? 10000 : 100)
        }));
      }

      if (editingChart) {
        // Update existing chart
        const updatedChart = {
          ...editingChart,
          title: formData.title,
          chartType: formData.chartType,
          numericValue: formData.numericValue,
          metric: formData.metric,
          data: chartData,
        };
        
        setCharts(
          charts.map((chart) =>
            chart.id === editingChart.id ? updatedChart : chart
          )
        );
      } else {
        // Add new chart
        const newChart: Chart = {
          id: chartId,
          title: formData.title,
          chartType: formData.chartType,
          numericValue: formData.numericValue,
          metric: formData.metric,
          data: chartData,
        };
        
        setCharts([...charts, newChart]);
      }
      
    } catch (error) {
      console.error('Error creating chart:', error);
    } finally {
      // Clear loading state
      setLoadingCharts(prev => {
        const newState = { ...prev };
        delete newState[chartId];
        return newState;
      });
    }
    
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Custom Charts</h2>
        <button
          onClick={handleAddChart}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Chart
        </button>
      </div>

      {charts.length === 0 ? (
        <div className="bg-muted border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No charts added yet. Click &quot;Add Chart&quot; to create your first chart.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <div key={chart.id} className="relative">
              {loadingCharts[chart.id] && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <ChartCard
                id={chart.id}
                title={chart.title}
                chartType={chart.chartType}
                data={chart.data}
                onEdit={handleEditChart}
                onDelete={handleDeleteChart}
              />
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              {editingChart ? 'Edit Chart' : 'Add New Chart'}
            </h3>
            <ChartForm
              onSubmit={handleFormSubmit}
              defaultValues={
                editingChart
                  ? {
                      id: editingChart.id,
                      title: editingChart.title,
                      chartType: editingChart.chartType,
                      numericValue: editingChart.numericValue,
                      metric: editingChart.metric,
                    }
                  : undefined
              }
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicChartArea; 