#!/usr/bin/env python3
"""
Main entry point for GCP App Engine deployment
"""

import os
import sys
from app import app

# Ensure the application can find all modules
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == '__main__':
    # For local development
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=False)
else:
    # For App Engine
    # The app object is used by App Engine
    pass 