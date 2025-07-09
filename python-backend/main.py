#!/usr/bin/env python3
"""
Main entry point for Google Cloud App Engine deployment
"""

import os
import sys
from src.app import app

# Ensure the application can find all modules
sys.path.insert(0, os.path.dirname(__file__))

# Initialize database on startup
def initialize_database():
    """Initialize the database if it doesn't exist"""
    try:
        from scripts.init_db import main as init_main
        # Check if database files exist
        if not os.path.exists('data/glanceable.duckdb'):
            print("Initializing database...")
            init_main()
            print("Database initialized successfully")
        else:
            print("Database already exists, skipping initialization")
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")

# Initialize database on startup
initialize_database()

if __name__ == '__main__':
    # For local development
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=False)
else:
    # For App Engine - the app object is used directly
    pass 