"use client";

import React, { useState, useEffect } from 'react';
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

  // Load charts from database
  const loadChartsFromDatabase = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/charts`);
      const result = await response.json();
      
      if (result.success) {
        const chartsWithData = result.charts.map((chart: any) => ({
          id: chart.id,
          title: chart.title,
          chartType: chart.chartType,
          numericValue: chart.numericValue,
          metric: chart.metric,
          data: []
        }));
        setCharts(chartsWithData);
        
        // Initialize loading states
        const loadingStates: Record<string, boolean> = {};
        chartsWithData.forEach((chart: Chart) => {
          loadingStates[chart.id] = true;
        });
        setLoadingCharts(loadingStates);
        
        // Fetch data for each chart
        chartsWithData.forEach((chart: Chart) => {
          fetchChartData(chart);
        });
      } else {
        // Initialize with default charts if database is empty
        const defaultCharts = [
          {
            id: '1',
            title: 'Revenue by Category',
            chartType: 'pie' as const,
            numericValue: 'sum',
            metric: 'revenue',
            data: [],
          },
          {
            id: '2',
            title: 'Daily Users by Segment',
            chartType: 'pie' as const,
            numericValue: 'count',
            metric: 'user_segments',
            data: [],
          },
        ];
        
        // Save default charts to database
        for (const chart of defaultCharts) {
          await saveChartToDatabase(chart);
        }
        
        setCharts(defaultCharts);
        setLoadingCharts({ '1': true, '2': true });
        defaultCharts.forEach(chart => fetchChartData(chart));
      }
    } catch (error) {
      console.error('Error loading charts from database:', error);
      // Fallback to default charts
      const defaultCharts = [
        {
          id: '1',
          title: 'Revenue by Category',
          chartType: 'pie' as const,
          numericValue: 'sum',
          metric: 'revenue',
          data: [],
        },
        {
          id: '2',
          title: 'Daily Users by Segment',
          chartType: 'pie' as const,
          numericValue: 'count',
          metric: 'user_segments',
          data: [],
        },
      ];
      setCharts(defaultCharts);
      setLoadingCharts({ '1': true, '2': true });
      defaultCharts.forEach(chart => fetchChartData(chart));
    }
  };

  // Save chart to database
  const saveChartToDatabase = async (chart: Chart) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/charts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: chart.id,
          title: chart.title,
          chartType: chart.chartType,
          numericValue: chart.numericValue,
          metric: chart.metric
        }),
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Failed to save chart to database:', result.error);
      }
    } catch (error) {
      console.error('Error saving chart to database:', error);
    }
  };

  // Update chart in database
  const updateChartInDatabase = async (chart: Chart) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/charts/${chart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: chart.title,
          chartType: chart.chartType,
          numericValue: chart.numericValue,
          metric: chart.metric
        }),
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Failed to update chart in database:', result.error);
      }
    } catch (error) {
      console.error('Error updating chart in database:', error);
    }
  };

  // Delete chart from database
  const deleteChartFromDatabase = async (chartId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/charts/${chartId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Failed to delete chart from database:', result.error);
      }
    } catch (error) {
      console.error('Error deleting chart from database:', error);
    }
  };

  // Fetch chart data from API
  const fetchChartData = async (chart: Chart) => {
    try {
      setLoadingCharts((prev) => ({ ...prev, [chart.id]: true }));
      const response = await fetch(
        `/api/charts?chartType=${chart.chartType}&numericValue=${chart.numericValue}&metric=${chart.metric}&period=30d`
      );
      const result = await response.json();
      
      setCharts((prevCharts) =>
        prevCharts.map((c) =>
          c.id === chart.id ? { ...c, data: result.data } : c
        )
      );
    } catch (error) {
      console.error(`Error fetching chart data for ${chart.id}:`, error);
    } finally {
      setLoadingCharts((prev) => ({ ...prev, [chart.id]: false }));
    }
  };

  // Load charts from database on mount
  useEffect(() => {
    loadChartsFromDatabase();
  }, []); // Only run on mount

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
    await deleteChartFromDatabase(id);
    setCharts(charts.filter((chart) => chart.id !== id));
  };

  const handleFormSubmit = async (formData: ChartFormData) => {
    if (editingChart) {
      // Update existing chart
      const updatedChart = {
        ...editingChart,
        title: formData.title,
        chartType: formData.chartType,
        numericValue: formData.numericValue,
        metric: formData.metric,
      };
      
      await updateChartInDatabase(updatedChart);
      
      setCharts(
        charts.map((chart) =>
          chart.id === editingChart.id ? updatedChart : chart
        )
      );
      
      // Fetch new data for the updated chart
      await fetchChartData(updatedChart);
    } else {
      // Add new chart
      const newChart: Chart = {
        id: uuidv4(),
        title: formData.title,
        chartType: formData.chartType,
        numericValue: formData.numericValue,
        metric: formData.metric,
        data: [],
      };
      
      await saveChartToDatabase(newChart);
      
      setCharts([...charts, newChart]);
      setLoadingCharts((prev) => ({ ...prev, [newChart.id]: true }));
      
      // Fetch data for the new chart
      await fetchChartData(newChart);
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
          <div className="bg-card text-card-foreground rounded-lg p-6 w-full max-w-md shadow-lg border border-border">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">
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