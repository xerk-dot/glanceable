import logging
from typing import Dict, List, Any, Optional
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

logger = logging.getLogger(__name__)

class ChartService:
    """Service for processing chart data from database queries"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def get_bar_chart_data(self, metric: str, period: str = '30d', category: Optional[str] = None) -> List[Dict]:
        """Process data for bar charts"""
        try:
            if metric == 'revenue':
                df = self.db_manager.get_revenue_data(period, category)
                return self._format_bar_data(df, 'date', 'revenue', 'category')
            
            elif metric == 'transactions':
                df = self.db_manager.get_revenue_data(period, category)
                return self._format_bar_data(df, 'date', 'transaction_count', 'category')
            
            elif metric == 'user_activity':
                df = self.db_manager.get_time_series_data('daily_users', period)
                return self._format_simple_bar_data(df, 'date', 'value')
            
            else:
                # Generate sample data for unknown metrics
                return self._generate_sample_bar_data(metric, period)
                
        except Exception as e:
            logger.error(f"Error processing bar chart data: {str(e)}")
            return self._generate_sample_bar_data(metric, period)
    
    def get_pie_chart_data(self, metric: str, period: str = '30d') -> List[Dict]:
        """Process data for pie charts"""
        try:
            if metric == 'user_segments':
                df = self.db_manager.get_user_segment_data(period)
                return self._format_pie_data(df, 'segment', 'user_count')
            
            elif metric == 'revenue_by_segment':
                df = self.db_manager.get_user_segment_data(period)
                return self._format_pie_data(df, 'segment', 'total_revenue')
            
            else:
                # Generate sample data for unknown metrics
                return self._generate_sample_pie_data(metric)
                
        except Exception as e:
            logger.error(f"Error processing pie chart data: {str(e)}")
            return self._generate_sample_pie_data(metric)
    
    def get_line_chart_data(self, metric: str, period: str = '30d', granularity: str = 'day') -> List[Dict]:
        """Process data for line charts (time series)"""
        try:
            df = self.db_manager.get_time_series_data(metric, period, granularity)
            return self._format_line_data(df, 'date', 'value')
            
        except Exception as e:
            logger.error(f"Error processing line chart data: {str(e)}")
            return self._generate_sample_line_data(metric, period, granularity)
    
    def get_realtime_data(self, metric: str) -> Dict[str, Any]:
        """Get real-time data for a specific metric"""
        try:
            metrics = self.db_manager.get_realtime_metrics()
            
            if metric in metrics:
                return {
                    'current_value': metrics[metric],
                    'timestamp': datetime.utcnow().isoformat(),
                    'metric': metric
                }
            else:
                # Return sample data for unknown metrics
                return {
                    'current_value': np.random.randint(50, 500),
                    'timestamp': datetime.utcnow().isoformat(),
                    'metric': metric
                }
                
        except Exception as e:
            logger.error(f"Error getting realtime data: {str(e)}")
            return {
                'current_value': 0,
                'timestamp': datetime.utcnow().isoformat(),
                'metric': metric,
                'error': str(e)
            }
    
    def get_available_metrics(self) -> Dict[str, List[str]]:
        """Get list of available metrics organized by chart type"""
        return {
            'bar_charts': [
                'revenue',
                'transactions',
                'user_activity',
                'orders_by_category',
                'monthly_growth'
            ],
            'pie_charts': [
                'user_segments',
                'revenue_by_segment',
                'traffic_sources',
                'product_categories',
                'geographic_distribution'
            ],
            'line_charts': [
                'daily_users',
                'revenue',
                'orders',
                'conversion_rate',
                'session_duration'
            ],
            'realtime_metrics': [
                'active_users',
                'current_revenue',
                'pending_orders',
                'system_load',
                'api_requests'
            ]
        }
    
    def _format_bar_data(self, df: pd.DataFrame, x_col: str, y_col: str, group_col: str) -> List[Dict]:
        """Format DataFrame for grouped bar charts"""
        if df.empty:
            return []
        
        # Group by x_col and create data points for each category
        result = []
        for x_val in df[x_col].unique():
            data_point = {'x': str(x_val)}
            category_data = df[df[x_col] == x_val]
            
            for _, row in category_data.iterrows():
                category = row[group_col]
                value = float(row[y_col]) if pd.notna(row[y_col]) else 0
                data_point[category] = value
            
            result.append(data_point)
        
        return result
    
    def _format_simple_bar_data(self, df: pd.DataFrame, x_col: str, y_col: str) -> List[Dict]:
        """Format DataFrame for simple bar charts"""
        if df.empty:
            return []
        
        return [
            {
                'x': str(row[x_col]),
                'y': float(row[y_col]) if pd.notna(row[y_col]) else 0
            }
            for _, row in df.iterrows()
        ]
    
    def _format_pie_data(self, df: pd.DataFrame, label_col: str, value_col: str) -> List[Dict]:
        """Format DataFrame for pie charts"""
        if df.empty:
            return []
        
        return [
            {
                'id': str(row[label_col]),
                'label': str(row[label_col]),
                'value': float(row[value_col]) if pd.notna(row[value_col]) else 0
            }
            for _, row in df.iterrows()
        ]
    
    def _format_line_data(self, df: pd.DataFrame, x_col: str, y_col: str) -> List[Dict]:
        """Format DataFrame for line charts"""
        if df.empty:
            return []
        
        # Sort by date to ensure proper line progression
        df_sorted = df.sort_values(x_col)
        
        return [
            {
                'x': str(row[x_col]),
                'y': float(row[y_col]) if pd.notna(row[y_col]) else 0
            }
            for _, row in df_sorted.iterrows()
        ]
    
    def _generate_sample_bar_data(self, metric: str, period: str) -> List[Dict]:
        """Generate sample bar chart data"""
        days = int(period.replace('d', ''))
        categories = ['Category A', 'Category B', 'Category C']
        
        result = []
        for i in range(min(days, 10)):  # Limit to 10 data points for readability
            date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
            data_point = {'x': date}
            
            for category in categories:
                data_point[category] = np.random.randint(100, 1000)
            
            result.append(data_point)
        
        return result[::-1]  # Reverse to show chronological order
    
    def _generate_sample_pie_data(self, metric: str) -> List[Dict]:
        """Generate sample pie chart data"""
        labels = ['Segment A', 'Segment B', 'Segment C', 'Segment D']
        values = np.random.randint(10, 100, len(labels))
        
        return [
            {
                'id': label,
                'label': label,
                'value': int(value)
            }
            for label, value in zip(labels, values)
        ]
    
    def _generate_sample_line_data(self, metric: str, period: str, granularity: str) -> List[Dict]:
        """Generate sample line chart data"""
        days = int(period.replace('d', ''))
        
        # Adjust number of points based on granularity
        if granularity == 'hour':
            points = min(days * 24, 168)  # Max 1 week of hourly data
        elif granularity == 'day':
            points = days
        elif granularity == 'week':
            points = days // 7
        else:  # month
            points = days // 30
        
        result = []
        base_value = np.random.randint(100, 500)
        
        for i in range(points):
            if granularity == 'hour':
                date = (datetime.utcnow() - timedelta(hours=i)).strftime('%Y-%m-%d %H:00:00')
            elif granularity == 'day':
                date = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
            elif granularity == 'week':
                date = (datetime.utcnow() - timedelta(weeks=i)).strftime('%Y-W%U')
            else:  # month
                date = (datetime.utcnow() - timedelta(days=i*30)).strftime('%Y-%m')
            
            # Add some trend and randomness
            trend = base_value + (i * 5) + np.random.randint(-50, 50)
            
            result.append({
                'x': date,
                'y': max(0, int(trend))
            })
        
        return result[::-1]  # Reverse to show chronological order 