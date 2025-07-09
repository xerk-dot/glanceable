import logging
from typing import Dict, List, Any, Optional
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
import uuid

logger = logging.getLogger(__name__)

class ChartService:
    """Simplified service for processing chart data"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
    
    def get_chart_data(self, chart_type: str, metric: str, period: str = '30d') -> List[Dict]:
        """Get chart data for any chart type and metric"""
        try:
            if chart_type == 'pie':
                return self._get_pie_data(metric, period)
            elif chart_type == 'bar':
                return self._get_bar_data(metric, period)
            else:
                return self._get_sample_data(chart_type, metric)
        except Exception as e:
            logger.error(f"Error getting chart data: {e}")
            return self._get_sample_data(chart_type, metric)
    
    def _get_pie_data(self, metric: str, period: str) -> List[Dict]:
        """Get pie chart data"""
        if metric == 'revenue':
            return [
                {'id': 'Electronics', 'label': 'Electronics', 'value': 36611},
                {'id': 'Beauty', 'label': 'Beauty', 'value': 32513},
                {'id': 'Books', 'label': 'Books', 'value': 32278},
                {'id': 'Food', 'label': 'Food', 'value': 31478},
                {'id': 'Sports', 'label': 'Sports', 'value': 31303},
            ]
        elif metric == 'daily_users':
            return [
                {'id': 'Monday', 'label': 'Monday', 'value': 145},
                {'id': 'Tuesday', 'label': 'Tuesday', 'value': 178},
                {'id': 'Wednesday', 'label': 'Wednesday', 'value': 192},
                {'id': 'Thursday', 'label': 'Thursday', 'value': 167},
                {'id': 'Friday', 'label': 'Friday', 'value': 203},
            ]
        elif metric == 'orders':
            return [
                {'id': 'Pending', 'label': 'Pending', 'value': 120},
                {'id': 'Completed', 'label': 'Completed', 'value': 340},
                {'id': 'Cancelled', 'label': 'Cancelled', 'value': 45},
                {'id': 'Refunded', 'label': 'Refunded', 'value': 18},
            ]
        elif metric == 'user_segments':
            return [
                {'id': 'Premium', 'label': 'Premium', 'value': 80},
                {'id': 'Regular', 'label': 'Regular', 'value': 210},
                {'id': 'Basic', 'label': 'Basic', 'value': 110},
            ]
        elif metric == 'categories':
            return [
                {'id': 'Electronics', 'label': 'Electronics', 'value': 36611},
                {'id': 'Beauty', 'label': 'Beauty', 'value': 32513},
                {'id': 'Books', 'label': 'Books', 'value': 32278},
                {'id': 'Food', 'label': 'Food', 'value': 31478},
                {'id': 'Sports', 'label': 'Sports', 'value': 31303},
            ]
        else:
            return self._get_sample_data('pie', metric)
    
    def _get_bar_data(self, metric: str, period: str) -> List[Dict]:
        """Get bar chart data"""
        if metric == 'revenue':
            return [
                {'id': 'Electronics', 'label': 'Electronics', 'value': 36611},
                {'id': 'Beauty', 'label': 'Beauty', 'value': 32513},
                {'id': 'Books', 'label': 'Books', 'value': 32278},
                {'id': 'Food', 'label': 'Food', 'value': 31478},
                {'id': 'Sports', 'label': 'Sports', 'value': 31303},
            ]
        elif metric == 'daily_users':
            return [
                {'id': 'Monday', 'label': 'Monday', 'value': 145},
                {'id': 'Tuesday', 'label': 'Tuesday', 'value': 178},
                {'id': 'Wednesday', 'label': 'Wednesday', 'value': 192},
                {'id': 'Thursday', 'label': 'Thursday', 'value': 167},
                {'id': 'Friday', 'label': 'Friday', 'value': 203},
            ]
        elif metric == 'orders':
            return [
                {'id': 'Pending', 'label': 'Pending', 'value': 120},
                {'id': 'Completed', 'label': 'Completed', 'value': 340},
                {'id': 'Cancelled', 'label': 'Cancelled', 'value': 45},
                {'id': 'Refunded', 'label': 'Refunded', 'value': 18},
            ]
        elif metric == 'user_segments':
            return [
                {'id': 'Premium', 'label': 'Premium', 'value': 80},
                {'id': 'Regular', 'label': 'Regular', 'value': 210},
                {'id': 'Basic', 'label': 'Basic', 'value': 110},
            ]
        elif metric == 'categories':
            return [
                {'id': 'Electronics', 'label': 'Electronics', 'value': 36611},
                {'id': 'Beauty', 'label': 'Beauty', 'value': 32513},
                {'id': 'Books', 'label': 'Books', 'value': 32278},
                {'id': 'Food', 'label': 'Food', 'value': 31478},
                {'id': 'Sports', 'label': 'Sports', 'value': 31303},
            ]
        else:
            return self._get_sample_data('bar', metric)
    
    def _get_sample_data(self, chart_type: str, metric: str) -> List[Dict]:
        """Generate simple sample data"""
        if chart_type == 'pie':
            labels = ['Category A', 'Category B', 'Category C', 'Category D']
        else:
            labels = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']
        
        return [
            {
                'id': label,
                'label': label,
                'value': np.random.randint(50, 300)
            }
            for label in labels
        ] 