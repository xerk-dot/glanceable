#!/usr/bin/env python3
"""
Database initialization script for DuckDB
Creates tables and populates with sample data
"""

import duckdb
import os
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any

def create_tables(conn: duckdb.DuckDBPyConnection):
    """Create the required tables"""
    
    # Transactions table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            amount DECIMAL(10,2),
            category VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # User activities table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS user_activities (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            activity_type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Orders table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            status VARCHAR(50),
            total_amount DECIMAL(10,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    print("Tables created successfully")

def generate_sample_data(conn: duckdb.DuckDBPyConnection):
    """Generate sample data for testing"""
    
    # Clear existing data
    conn.execute("DELETE FROM transactions")
    conn.execute("DELETE FROM user_activities")
    conn.execute("DELETE FROM orders")
    
    # Categories for transactions
    categories = ['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'beauty', 'automotive']
    
    # Activity types
    activity_types = ['login', 'page_view', 'search', 'add_to_cart', 'checkout', 'profile_update']
    
    # Order statuses
    order_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    
    # Generate data for the last 90 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    
    # Generate transactions
    transactions = []
    for i in range(1000):
        user_id = random.randint(1, 100)
        amount = round(random.uniform(10, 500), 2)
        category = random.choice(categories)
        created_at = start_date + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        transactions.append((i + 1, user_id, amount, category, created_at))
    
    conn.executemany(
        "INSERT INTO transactions (id, user_id, amount, category, created_at) VALUES (?, ?, ?, ?, ?)",
        transactions
    )
    
    # Generate user activities
    activities = []
    for i in range(2000):
        user_id = random.randint(1, 100)
        activity_type = random.choice(activity_types)
        created_at = start_date + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        activities.append((i + 1, user_id, activity_type, created_at))
    
    conn.executemany(
        "INSERT INTO user_activities (id, user_id, activity_type, created_at) VALUES (?, ?, ?, ?)",
        activities
    )
    
    # Generate orders
    orders = []
    for i in range(500):
        user_id = random.randint(1, 100)
        status = random.choice(order_statuses)
        total_amount = round(random.uniform(20, 800), 2)
        created_at = start_date + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        orders.append((i + 1, user_id, status, total_amount, created_at))
    
    conn.executemany(
        "INSERT INTO orders (id, user_id, status, total_amount, created_at) VALUES (?, ?, ?, ?, ?)",
        orders
    )
    
    print(f"Generated {len(transactions)} transactions, {len(activities)} activities, and {len(orders)} orders")

def main():
    """Main initialization function"""
    db_path = "../data/glanceable.duckdb"
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    # Create new database and tables
    conn = duckdb.connect(db_path)
    
    try:
        create_tables(conn)
        generate_sample_data(conn)
        
        # Verify data
        result = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()
        print(f"Transactions count: {result[0]}")
        
        result = conn.execute("SELECT COUNT(*) FROM user_activities").fetchone()
        print(f"User activities count: {result[0]}")
        
        result = conn.execute("SELECT COUNT(*) FROM orders").fetchone()
        print(f"Orders count: {result[0]}")
        
        print(f"Database initialized successfully: {db_path}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main() 