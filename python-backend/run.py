#!/usr/bin/env python3
"""
Development server runner for the chart backend
"""

import os
from app import app

if __name__ == '__main__':
    # Set development environment
    os.environ.setdefault('FLASK_ENV', 'development')
    
    # Get port from environment or default to 5000
    port = int(os.getenv('PORT', 5000))
    
    print(f"Starting chart backend on http://localhost:{port}")
    print("Available endpoints:")
    print("  GET  /health")
    print("  GET  /api/charts/bar")
    print("  GET  /api/charts/pie") 
    print("  GET  /api/charts/line")
    print("  GET  /api/charts/metrics")
    print("  GET  /api/charts/realtime/<metric>")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(host='0.0.0.0', port=port, debug=True) 