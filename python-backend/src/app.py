from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import requests
from dotenv import load_dotenv
from .database import DatabaseManager
from .chart_service import ChartService
from .user_data_db import user_data_manager
from .config import config
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get configuration
config_name = os.getenv('FLASK_ENV', 'development')
app_config = config[config_name]

app = Flask(__name__)
CORS(app, origins=app_config.CORS_ORIGINS)

# Set database URL from config
if hasattr(app_config, 'DATABASE_URL'):
    os.environ['DATABASE_URL'] = app_config.DATABASE_URL

# Initialize services
db_manager = DatabaseManager()
chart_service = ChartService(db_manager)

# Helper function to call AI generation API
def generate_ai_content(content_type, context=None):
    """Call the frontend AI generation API"""
    try:
        # Use the frontend URL (try multiple ports)
        frontend_ports = [3003, 3002, 3001, 3000]  # Try current ports first
        ai_url = None
        
        for port in frontend_ports:
            try:
                test_url = f"http://localhost:{port}/api/ai-generate"
                # Try a quick test call to see if the server is running
                test_payload = {"type": "metric"}
                test_response = requests.post(test_url, json=test_payload, timeout=2)
                if test_response.status_code in [200, 400, 500]:  # Any response means server is running
                    ai_url = test_url
                    logger.info(f"Found frontend AI API at port {port}")
                    break
            except:
                continue
        
        if not ai_url:
            ai_url = "http://localhost:3001/api/ai-generate"  # Fallback
            logger.warning("Could not find running frontend, using fallback port 3001")
        
        payload = {
            "type": content_type
        }
        
        if context:
            payload["context"] = context
            
        response = requests.post(ai_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            return response.json().get('data')
        else:
            logger.warning(f"AI generation failed with status {response.status_code}")
            return None
            
    except Exception as e:
        logger.warning(f"Error calling AI generation API: {str(e)}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'chart-backend'
    })

@app.route('/api/charts/bar', methods=['GET'])
def get_bar_chart_data():
    """Get data for bar charts"""
    try:
        # Get query parameters
        metric = request.args.get('metric', 'revenue')
        period = request.args.get('period', '30d')
        category = request.args.get('category', None)
        
        data = chart_service.get_bar_chart_data(metric, period, category)
        return jsonify({
            'success': True,
            'data': data,
            'metadata': {
                'metric': metric,
                'period': period,
                'category': category,
                'generated_at': datetime.utcnow().isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error getting bar chart data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/charts/pie', methods=['GET'])
def get_pie_chart_data():
    """Get data for pie charts"""
    try:
        metric = request.args.get('metric', 'user_segments')
        period = request.args.get('period', '30d')
        
        data = chart_service.get_pie_chart_data(metric, period)
        return jsonify({
            'success': True,
            'data': data,
            'metadata': {
                'metric': metric,
                'period': period,
                'generated_at': datetime.utcnow().isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error getting pie chart data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/charts/line', methods=['GET'])
def get_line_chart_data():
    """Get data for line charts (time series)"""
    try:
        metric = request.args.get('metric', 'daily_users')
        period = request.args.get('period', '30d')
        granularity = request.args.get('granularity', 'day')
        
        data = chart_service.get_line_chart_data(metric, period, granularity)
        return jsonify({
            'success': True,
            'data': data,
            'metadata': {
                'metric': metric,
                'period': period,
                'granularity': granularity,
                'generated_at': datetime.utcnow().isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error getting line chart data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/charts/metrics', methods=['GET'])
def get_available_metrics():
    """Get list of available metrics for charts"""
    try:
        metrics = chart_service.get_available_metrics()
        return jsonify({
            'success': True,
            'metrics': metrics
        })
    except Exception as e:
        logger.error(f"Error getting available metrics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/charts/realtime/<metric>', methods=['GET'])
def get_realtime_data(metric):
    """Get real-time data for a specific metric"""
    try:
        data = chart_service.get_realtime_data(metric)
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting realtime data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Get key metrics for the dashboard"""
    try:
        # Get filter parameters
        timeframe = request.args.get('timeframe', 'all')
        channel = request.args.get('channel', 'all')
        topic = request.args.get('topic', 'all')
        
        metrics = []
        
        # Try to generate AI metrics
        for i in range(4):
            ai_metric = generate_ai_content('metric')
            if ai_metric:
                metrics.append({
                    'id': f'ai-metric-{i + 1}',
                    **ai_metric
                })
        
        # If AI generation failed, fall back to data-driven metrics with filter properties
        if not metrics:
            realtime_data = db_manager.get_realtime_metrics()
            
            # Calculate some additional metrics
            revenue_data = db_manager.get_revenue_data('7d')
            total_revenue = revenue_data['revenue'].sum() if not revenue_data.empty else 0
            
            user_data = db_manager.get_time_series_data('daily_users', '7d')
            avg_daily_users = user_data['value'].mean() if not user_data.empty else 0
            
            metrics = [
                {
                    'id': 'metric-1',
                    'name': 'Weekly Revenue',
                    'value': f'${total_revenue:,.0f}',
                    'change': '+8%',
                    'trend': 'up',
                    'timeframe': 'week',
                    'channel': 'web',
                    'topic': 'sales'
                },
                {
                    'id': 'metric-2',
                    'name': 'Active Users',
                    'value': int(realtime_data.get('active_users', 2847)),
                    'change': '+12%',
                    'trend': 'up',
                    'timeframe': 'month',
                    'channel': 'mobile',
                    'topic': 'marketing'
                },
                {
                    'id': 'metric-3',
                    'name': 'Avg Daily Users',
                    'value': f'{avg_daily_users:.0f}' if avg_daily_users > 0 else '1,423',
                    'change': '+5%',
                    'trend': 'up',
                    'timeframe': 'today',
                    'channel': 'web',
                    'topic': 'marketing'
                },
                {
                    'id': 'metric-4',
                    'name': 'Pending Orders',
                    'value': int(realtime_data.get('pending_orders', 42)),
                    'change': '-3%',
                    'trend': 'down',
                    'timeframe': 'today',
                    'channel': 'web',
                    'topic': 'sales'
                },
                {
                    'id': 'metric-5',
                    'name': 'Support Tickets',
                    'value': 24,
                    'change': '+8%',
                    'trend': 'down',
                    'timeframe': 'week',
                    'channel': 'email',
                    'topic': 'customer_service'
                },
                {
                    'id': 'metric-6',
                    'name': 'Server Uptime',
                    'value': '99.9%',
                    'change': '0%',
                    'trend': 'neutral',
                    'timeframe': 'month',
                    'channel': 'direct',
                    'topic': 'tech'
                }
            ]
        
        # Apply filters to metrics
        filtered_metrics = []
        for metric in metrics:
            if (timeframe == 'all' or metric.get('timeframe') == timeframe) and \
               (channel == 'all' or metric.get('channel') == channel) and \
               (topic == 'all' or metric.get('topic') == topic):
                filtered_metrics.append(metric)
        
        return jsonify({
            'success': True,
            'metrics': filtered_metrics
        })
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get AI recommendations based on data analysis"""
    try:
        # Get filter parameters
        timeframe = request.args.get('timeframe', 'all')
        channel = request.args.get('channel', 'all')
        topic = request.args.get('topic', 'all')
        
        recommendations = []
        
        # Try to generate AI recommendations
        for i in range(3):
            ai_recommendation = generate_ai_content('recommendation')
            if ai_recommendation:
                recommendations.append({
                    'id': f'ai-rec-{i + 1}',
                    **ai_recommendation
                })
        
        # If AI generation failed, fall back to data-driven recommendations with filter properties
        if not recommendations:
            # Analyze data to generate recommendations
            revenue_data = db_manager.get_revenue_data('30d')
            user_segment_data = db_manager.get_user_segment_data('30d')
            realtime_data = db_manager.get_realtime_metrics()
            
            # Default recommendations with filter properties
            recommendations = [
                {
                    'id': 'rec1',
                    'text': 'Optimize checkout flow to reduce cart abandonment',
                    'urgency': 'high',
                    'impact': 'high',
                    'timeframe': 'week',
                    'channel': 'web',
                    'topic': 'sales'
                },
                {
                    'id': 'rec2',
                    'text': 'Update mobile app UI for better user experience',
                    'urgency': 'medium',
                    'impact': 'medium',
                    'timeframe': 'month',
                    'channel': 'mobile',
                    'topic': 'product'
                },
                {
                    'id': 'rec3',
                    'text': 'Expand social media presence to reach new customers',
                    'urgency': 'low',
                    'impact': 'medium',
                    'timeframe': 'quarter',
                    'channel': 'social',
                    'topic': 'marketing'
                },
                {
                    'id': 'rec4',
                    'text': 'Improve customer support response time',
                    'urgency': 'high',
                    'impact': 'high',
                    'timeframe': 'week',
                    'channel': 'email',
                    'topic': 'customer_service'
                },
                {
                    'id': 'rec5',
                    'text': 'Automate financial reporting processes',
                    'urgency': 'medium',
                    'impact': 'high',
                    'timeframe': 'month',
                    'channel': 'direct',
                    'topic': 'finance'
                },
                {
                    'id': 'rec6',
                    'text': 'Upgrade server infrastructure for better performance',
                    'urgency': 'high',
                    'impact': 'medium',
                    'timeframe': 'today',
                    'channel': 'direct',
                    'topic': 'tech'
                }
            ]
        
        # Apply filters to recommendations
        filtered_recommendations = []
        for rec in recommendations:
            if (timeframe == 'all' or rec.get('timeframe') == timeframe) and \
               (channel == 'all' or rec.get('channel') == channel) and \
               (topic == 'all' or rec.get('topic') == topic):
                filtered_recommendations.append(rec)
        
        return jsonify({
            'success': True,
            'recommendations': filtered_recommendations
        })
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/priorities', methods=['GET'])
def get_priorities():
    """Get top priorities based on current data"""
    try:
        # Get filter parameters
        timeframe = request.args.get('timeframe', 'all')
        channel = request.args.get('channel', 'all')
        topic = request.args.get('topic', 'all')
        
        priorities = []
        
        # Try to generate AI priorities
        for i in range(3):
            ai_priority = generate_ai_content('priority')
            if ai_priority:
                priorities.append({
                    'id': f'ai-pri-{i + 1}',
                    **ai_priority
                })
        
        # If AI generation failed, fall back to data-driven priorities with filter properties
        if not priorities:
            realtime_data = db_manager.get_realtime_metrics()
            revenue_data = db_manager.get_revenue_data('7d')
            
            # Default priorities with filter properties
            priorities = [
                {
                    'id': 'pri1',
                    'task': 'Review Q4 financials and prepare budget',
                    'deadline': 'Today',
                    'status': 'in-progress',
                    'timeframe': 'today',
                    'channel': 'direct',
                    'topic': 'finance'
                },
                {
                    'id': 'pri2',
                    'task': 'Update team on project status via email',
                    'deadline': 'Dec 15',
                    'status': 'pending',
                    'timeframe': 'week',
                    'channel': 'email',
                    'topic': 'operations'
                },
                {
                    'id': 'pri3',
                    'task': 'Prepare monthly operational report',
                    'deadline': 'Dec 18',
                    'status': 'pending',
                    'timeframe': 'month',
                    'channel': 'direct',
                    'topic': 'operations'
                },
                {
                    'id': 'pri4',
                    'task': 'Optimize mobile checkout process',
                    'deadline': 'This week',
                    'status': 'in-progress',
                    'timeframe': 'week',
                    'channel': 'mobile',
                    'topic': 'sales'
                },
                {
                    'id': 'pri5',
                    'task': 'Launch social media campaign',
                    'deadline': 'Dec 20',
                    'status': 'pending',
                    'timeframe': 'month',
                    'channel': 'social',
                    'topic': 'marketing'
                },
                {
                    'id': 'pri6',
                    'task': 'Fix server performance issues',
                    'deadline': 'Tomorrow',
                    'status': 'in-progress',
                    'timeframe': 'today',
                    'channel': 'direct',
                    'topic': 'tech'
                }
            ]
        
        # Apply filters to priorities
        filtered_priorities = []
        for priority in priorities:
            if (timeframe == 'all' or priority.get('timeframe') == timeframe) and \
               (channel == 'all' or priority.get('channel') == channel) and \
               (topic == 'all' or priority.get('topic') == topic):
                filtered_priorities.append(priority)
        
        return jsonify({
            'success': True,
            'priorities': filtered_priorities
        })
    except Exception as e:
        logger.error(f"Error getting priorities: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# User Data CRUD Endpoints

@app.route('/api/user/charts', methods=['GET', 'POST'])
def handle_user_charts():
    """Get all user charts or create a new chart"""
    if request.method == 'GET':
        try:
            charts = user_data_manager.get_charts()
            return jsonify({
                'success': True,
                'charts': charts
            })
        except Exception as e:
            logger.error(f"Error getting user charts: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            chart_data = request.json
            chart = user_data_manager.create_chart(chart_data)
            return jsonify({
                'success': True,
                'chart': chart
            }), 201
        except Exception as e:
            logger.error(f"Error creating user chart: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@app.route('/api/user/charts/<chart_id>', methods=['PUT', 'DELETE'])
def handle_user_chart(chart_id):
    """Update or delete a specific user chart"""
    if request.method == 'PUT':
        try:
            chart_data = request.json
            chart = user_data_manager.update_chart(chart_id, chart_data)
            return jsonify({
                'success': True,
                'chart': chart
            })
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 404
        except Exception as e:
            logger.error(f"Error updating user chart: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'DELETE':
        try:
            deleted = user_data_manager.delete_chart(chart_id)
            if deleted:
                return jsonify({
                    'success': True,
                    'message': 'Chart deleted successfully'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Chart not found'
                }), 404
        except Exception as e:
            logger.error(f"Error deleting user chart: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@app.route('/api/user/metrics', methods=['GET', 'POST'])
def handle_user_metrics():
    """Get all user metrics or create a new metric"""
    if request.method == 'GET':
        try:
            metrics = user_data_manager.get_metrics()
            return jsonify({
                'success': True,
                'metrics': metrics
            })
        except Exception as e:
            logger.error(f"Error getting user metrics: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            metric_data = request.json
            metric = user_data_manager.create_metric(metric_data)
            return jsonify({
                'success': True,
                'metric': metric
            }), 201
        except Exception as e:
            logger.error(f"Error creating user metric: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@app.route('/api/user/priorities', methods=['GET', 'POST'])
def handle_user_priorities():
    """Get all user priorities or create a new priority"""
    if request.method == 'GET':
        try:
            priorities = user_data_manager.get_priorities()
            return jsonify({
                'success': True,
                'priorities': priorities
            })
        except Exception as e:
            logger.error(f"Error getting user priorities: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            priority_data = request.json
            priority = user_data_manager.create_priority(priority_data)
            return jsonify({
                'success': True,
                'priority': priority
            }), 201
        except Exception as e:
            logger.error(f"Error creating user priority: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@app.route('/api/user/recommendations', methods=['GET', 'POST'])
def handle_user_recommendations():
    """Get all user recommendations or create a new recommendation"""
    if request.method == 'GET':
        try:
            recommendations = user_data_manager.get_recommendations()
            return jsonify({
                'success': True,
                'recommendations': recommendations
            })
        except Exception as e:
            logger.error(f"Error getting user recommendations: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            rec_data = request.json
            recommendation = user_data_manager.create_recommendation(rec_data)
            return jsonify({
                'success': True,
                'recommendation': recommendation
            }), 201
        except Exception as e:
            logger.error(f"Error creating user recommendation: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting chart backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug) 