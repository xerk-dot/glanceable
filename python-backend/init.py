#!/usr/bin/env python3
"""
Database Initialization Script
Initializes the DuckDB database with sample data
"""

import os
import sys

def main():
    """Initialize the database"""
    print("🗄️  Initializing Glanceable Database...")
    
    # Change to scripts directory and run init_db.py
    original_dir = os.getcwd()
    try:
        os.chdir('scripts')
        from init_db import main as init_main
        init_main()
        print("✅ Database initialization completed!")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)
    finally:
        os.chdir(original_dir)

if __name__ == '__main__':
    main() 