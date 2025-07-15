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

  // Load charts from user charts API
  const loadChartsFromDatabase = useCallback(async () => {
    try {
      // Get user-created charts from backend
      const userResponse = await fetch('/backend/api/user/charts');
      const userData = await userResponse.json();
      
      let loadedCharts: Chart[] = [];
      
      if (userData.items && userData.items.length > 0) {
        // Load each user chart with its data
        for (const userChart of userData.items) {
          setLoadingCharts(prev => ({ ...prev, [userChart.id]: true }));
          
          try {
            // Fetch chart data from backend API
            const response = await fetch(`/backend/api/charts?chartType=${userChart.chart_type}&numericValue=${userChart.numeric_value}&metric=${userChart.metric}&period=30d`);
            const result = await response.json();
            
            let chartData: ChartData[] = [];
            if (result.success && result.data) {
              chartData = result.data;
            } else {
              // Generate fallback data
              chartData = generateFallbackData(userChart.chart_type, userChart.metric);
            }
            
            loadedCharts.push({
              id: userChart.id,
              title: userChart.title,
              chartType: userChart.chart_type,
              numericValue: userChart.numeric_value,
              metric: userChart.metric,
              data: chartData
            });
          } catch (error) {
            console.error(`Error loading data for chart ${userChart.id}:`, error);
            // Add chart with fallback data
            loadedCharts.push({
              id: userChart.id,
              title: userChart.title,
              chartType: userChart.chart_type,
              numericValue: userChart.numeric_value,
              metric: userChart.metric,
              data: generateFallbackData(userChart.chart_type, userChart.metric)
            });
          } finally {
            setLoadingCharts(prev => {
              const newState = { ...prev };
              delete newState[userChart.id];
              return newState;
            });
          }
        }
      } else {
        // If no user charts, create some default ones
        const defaultCharts = [
          {
            id: '1',
            title: 'Revenue by Category',
            chartType: 'pie' as const,
            numericValue: 'sum',
            metric: 'revenue',
            data: generateFallbackData('pie', 'revenue')
          },
          {
            id: '2',
            title: 'User Segments',
            chartType: 'pie' as const,
            numericValue: 'count',
            metric: 'user_segments',
            data: generateFallbackData('pie', 'user_segments')
          }
        ];
        loadedCharts = defaultCharts;
      }
      
      setCharts(loadedCharts);
    } catch (error) {
      console.error('Error loading charts:', error);
      // Fallback to static charts
      const fallbackCharts = [
        {
          id: '1',
          title: 'Revenue by Category',
          chartType: 'pie' as const,
          numericValue: 'sum',
          metric: 'revenue',
          data: generateFallbackData('pie', 'revenue')
        }
      ];
      setCharts(fallbackCharts);
    } finally {
      setLoadingCharts({});
    }
  }, []);
  
  // Helper function to generate fallback data
  const generateFallbackData = (chartType: 'pie' | 'bar', metric: string): ChartData[] => {
    const dataCount = chartType === 'pie' ? 4 : 6;
    const categories = {
      revenue: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'],
      user_segments: ['Premium', 'Regular', 'Basic', 'Trial', 'Enterprise', 'Free'],
      daily_users: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      orders: ['Online', 'Mobile', 'In-Store', 'Phone', 'Partner', 'Wholesale'],
      sales: ['Q1', 'Q2', 'Q3', 'Q4', 'Holiday', 'Summer'],
      category: ['Tech', 'Fashion', 'Food', 'Travel', 'Health', 'Education']
    };
    
    const labels = categories[metric as keyof typeof categories] || categories.category;
    
    return labels.slice(0, dataCount).map((label) => ({
      id: label,
      label: label,
      value: Math.floor(Math.random() * (metric === 'revenue' ? 50000 : 1000)) + (metric === 'revenue' ? 10000 : 100)
    }));
  };



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

  const handleDeleteChart = async (id: string) => {
    try {
      const response = await fetch(`/backend/api/user/charts?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        setCharts(charts.filter((chart) => chart.id !== id));
      } else {
        console.error('Failed to delete chart');
      }
    } catch (error) {
      console.error('Error deleting chart:', error);
    }
  };

  const handleFormSubmit = async (formData: ChartFormData) => {
    const chartId = editingChart?.id || uuidv4();
    
    // Set loading state for this chart
    setLoadingCharts(prev => ({ ...prev, [chartId]: true }));
    
    try {
      // First save the chart configuration to the API
      const chartConfig = {
        title: formData.title,
        chart_type: formData.chartType,
        numeric_value: formData.numericValue,
        metric: formData.metric
      };

      let apiResponse;
      if (editingChart) {
        // Update existing chart
        apiResponse = await fetch('/backend/api/user/charts', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...chartConfig, id: editingChart.id })
        });
      } else {
        // Create new chart
        apiResponse = await fetch('/backend/api/user/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chartConfig)
        });
      }

      if (!apiResponse.ok) {
        throw new Error('Failed to save chart configuration');
      }

      // Then fetch chart data from backend API
      const dataResponse = await fetch(`/backend/api/charts?chartType=${formData.chartType}&numericValue=${formData.numericValue}&metric=${formData.metric}&period=30d`);
      const result = await dataResponse.json();
      
      let chartData: ChartData[] = [];
      if (result.success && result.data) {
        chartData = result.data;
      } else {
        // Fallback to generated data if API fails
        chartData = generateFallbackData(formData.chartType, formData.metric);
      }

      if (editingChart) {
        // Update existing chart in local state
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
        // Add new chart to local state
        const apiResult = await apiResponse.json();
        const newChart: Chart = {
          id: apiResult.chart?.id || chartId,
          title: formData.title,
          chartType: formData.chartType,
          numericValue: formData.numericValue,
          metric: formData.metric,
          data: chartData,
        };
        
        setCharts([...charts, newChart]);
      }
      
    } catch (error) {
      console.error('Error saving chart:', error);
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