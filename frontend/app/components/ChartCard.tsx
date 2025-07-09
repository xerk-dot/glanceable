"use client";

import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';

export interface ChartData {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface ChartCardProps {
  id: string;
  title: string;
  chartType: 'pie' | 'bar';
  data: ChartData[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChartCard: React.FC<ChartCardProps> = ({
  id,
  title,
  chartType,
  data,
  onEdit,
  onDelete,
}) => {
  // Debug logging
  console.log(`ChartCard ${title} (${chartType}):`, {
    id,
    title,
    chartType,
    data,
    dataLength: data?.length,
    firstDataItem: data?.[0]
  });

  const nivoTheme = {
    text: {
      fill: '#000000',
    },
    tooltip: {
      container: {
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        fontSize: 12,
      },
    },
    grid: {
      line: {
        stroke: '#e2e8f0',
        strokeWidth: 1,
      },
    },
    axis: {
      domain: {
        line: {
          stroke: '#e2e8f0',
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: '#e2e8f0',
          strokeWidth: 1,
        },
        text: {
          fill: '#000000',
        },
      },
    },
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      console.log(`Rendering pie chart for ${title} with data:`, data);
      return (
        <div className="h-64 bg-white rounded-md p-4">
          <ResponsivePie
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#000000"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLinkLabel={(d) => String(d.label)}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            arcLabel={(d) => String(d.label)}
            colors={{ scheme: 'category10' }}
            theme={nivoTheme}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#64748b',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
              },
            ]}
          />
        </div>
      );
    } else if (chartType === 'bar') {
      const barData = data.map((d, index) => ({ 
        category: d.label, 
        value: d.value, 
        id: d.id || `bar-${index}` 
      }));
      console.log(`Rendering bar chart for ${title} with transformed data:`, barData);
      return (
        <div className="h-64 bg-white rounded-md p-4">
          <ResponsiveBar
            data={barData}
            keys={['value']}
            indexBy="category"
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'category10' }}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: '',
              legendPosition: 'middle',
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Value',
              legendPosition: 'middle',
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
            theme={nivoTheme}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white text-gray-900 rounded-lg shadow-sm overflow-hidden border border-border">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(id)}
            className="text-gray-500 hover:text-primary"
          >
            <span className="sr-only">Edit</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-gray-500 hover:text-destructive"
          >
            <span className="sr-only">Delete</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCard; 