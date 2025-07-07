from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from database import DatabaseManager
from chart_service import ChartService
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

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
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting chart backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug) 