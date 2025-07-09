from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database import DatabaseManager
from chart_service import ChartService
from user_data_db import user_data_manager
from config import config
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
        realtime_data = db_manager.get_realtime_metrics()
        
        # Calculate some additional metrics
        revenue_data = db_manager.get_revenue_data('7d')
        total_revenue = revenue_data['revenue'].sum() if not revenue_data.empty else 0
        
        user_data = db_manager.get_time_series_data('daily_users', '7d')
        avg_daily_users = user_data['value'].mean() if not user_data.empty else 0
        
        metrics = [
            {
                'name': 'Active Users',
                'value': int(realtime_data.get('active_users', 0)),
                'change': '+12%',
                'trend': 'up'
            },
            {
                'name': 'Weekly Revenue',
                'value': f'${total_revenue:,.0f}',
                'change': '+8%',
                'trend': 'up'
            },
            {
                'name': 'Avg Daily Users',
                'value': f'{avg_daily_users:.0f}',
                'change': '+5%',
                'trend': 'up'
            },
            {
                'name': 'Pending Orders',
                'value': int(realtime_data.get('pending_orders', 0)),
                'change': '-3%',
                'trend': 'down'
            }
        ]
        
        return jsonify({
            'success': True,
            'metrics': metrics
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
        # Analyze data to generate recommendations
        revenue_data = db_manager.get_revenue_data('30d')
        user_segment_data = db_manager.get_user_segment_data('30d')
        realtime_data = db_manager.get_realtime_metrics()
        
        recommendations = []
        
        # Revenue-based recommendations
        if not revenue_data.empty:
            avg_revenue = revenue_data['revenue'].mean()
            recent_revenue = revenue_data.head(7)['revenue'].mean()
            
            if recent_revenue < avg_revenue * 0.9:
                recommendations.append({
                    'id': 'rev1',
                    'text': f'Recent revenue down {((avg_revenue - recent_revenue) / avg_revenue * 100):.1f}% - investigate top categories',
                    'urgency': 'high',
                    'impact': 'high'
                })
        
        # User segment recommendations
        if not user_segment_data.empty:
            premium_users = user_segment_data[user_segment_data['segment'] == 'Premium']
            if not premium_users.empty and premium_users.iloc[0]['user_count'] < 10:
                recommendations.append({
                    'id': 'seg1',
                    'text': 'Only few premium users - consider loyalty program to increase retention',
                    'urgency': 'medium',
                    'impact': 'high'
                })
        
        # Order-based recommendations
        pending_orders = realtime_data.get('pending_orders', 0)
        if pending_orders > 50:
            recommendations.append({
                'id': 'ord1',
                'text': f'{pending_orders} pending orders - review fulfillment process',
                'urgency': 'high',
                'impact': 'medium'
            })
        
        # Default recommendations if no data-driven ones
        if not recommendations:
            recommendations = [
                {
                    'id': 'def1',
                    'text': 'Consider implementing customer feedback system for better insights',
                    'urgency': 'medium',
                    'impact': 'high'
                },
                {
                    'id': 'def2',
                    'text': 'Review top-performing categories for expansion opportunities',
                    'urgency': 'low',
                    'impact': 'medium'
                }
            ]
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
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
        realtime_data = db_manager.get_realtime_metrics()
        revenue_data = db_manager.get_revenue_data('7d')
        
        priorities = []
        
        # High priority: pending orders
        pending_orders = realtime_data.get('pending_orders', 0)
        if pending_orders > 20:
            priorities.append({
                'id': 'pri1',
                'task': f'Process {pending_orders} pending orders',
                'deadline': 'Today',
                'status': 'pending'
            })
        
        # Medium priority: revenue analysis
        if not revenue_data.empty:
            low_revenue_days = revenue_data[revenue_data['revenue'] < revenue_data['revenue'].mean() * 0.8]
            if not low_revenue_days.empty:
                priorities.append({
                    'id': 'pri2',
                    'task': 'Analyze recent revenue dip and create action plan',
                    'deadline': 'Tomorrow',
                    'status': 'pending'
                })
        
        # Regular priority: data review
        priorities.append({
            'id': 'pri3',
            'task': 'Weekly performance review and metrics analysis',
            'deadline': 'This Week',
            'status': 'in-progress'
        })
        
        # System maintenance
        priorities.append({
            'id': 'pri4',
            'task': 'Update dashboard with latest features',
            'deadline': 'Next Week',
            'status': 'pending'
        })
        
        return jsonify({
            'success': True,
            'priorities': priorities
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