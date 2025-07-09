#!/usr/bin/env python3
"""
Glanceable Backend Server
Simple entry point for the chart backend service
"""

import os
import sys
from src.app import app

def main():
    """Main entry point for the server"""
    # Get port from environment or default to 5000
    port = int(os.getenv('PORT', 5000))
    
    print("🚀 Starting Glanceable Backend Server")
    print(f"📍 Server running on http://localhost:{port}")
    print("📊 Available endpoints:")
    print("   GET  /health")
    print("   GET  /api/charts/bar")
    print("   GET  /api/charts/pie") 
    print("   GET  /api/charts/line")
    print("   GET  /api/charts/metrics")
    print("   GET  /api/metrics")
    print("   GET  /api/recommendations")
    print("   GET  /api/priorities")
    print("\n✋ Press Ctrl+C to stop the server")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == '__main__':
    main() 