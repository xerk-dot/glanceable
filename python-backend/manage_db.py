#!/usr/bin/env python3
"""
Database management script for DuckDB operations
"""

import argparse
import duckdb
import os
import sys
from datetime import datetime, timedelta
import random
from init_db import create_tables, generate_sample_data

def reset_database():
    """Reset the database by recreating tables and data"""
    db_path = "./glanceable.duckdb"
    
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    conn = duckdb.connect(db_path)
    try:
        create_tables(conn)
        generate_sample_data(conn)
        print("Database reset successfully")
    finally:
        conn.close()

def add_sample_data():
    """Add more sample data to existing database"""
    db_path = "./glanceable.duckdb"
    
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        print("Run 'python init_db.py' first to create the database")
        return
    
    conn = duckdb.connect(db_path)
    try:
        # Add 100 more transactions
        categories = ['electronics', 'clothing', 'food', 'books', 'home', 'sports', 'beauty', 'automotive']
        transactions = []
        
        for i in range(100):
            user_id = random.randint(1, 100)
            amount = round(random.uniform(10, 500), 2)
            category = random.choice(categories)
            created_at = datetime.now() - timedelta(days=random.randint(0, 30))
            
            transactions.append((user_id, amount, category, created_at))
        
        conn.executemany(
            "INSERT INTO transactions (user_id, amount, category, created_at) VALUES (?, ?, ?, ?)",
            transactions
        )
        
        print(f"Added {len(transactions)} new transactions")
        
    finally:
        conn.close()

def show_stats():
    """Show database statistics"""
    db_path = "./glanceable.duckdb"
    
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        return
    
    conn = duckdb.connect(db_path)
    try:
        print("=== Database Statistics ===")
        
        # Transactions
        result = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()
        print(f"Transactions: {result[0]}")
        
        # User activities
        result = conn.execute("SELECT COUNT(*) FROM user_activities").fetchone()
        print(f"User activities: {result[0]}")
        
        # Orders
        result = conn.execute("SELECT COUNT(*) FROM orders").fetchone()
        print(f"Orders: {result[0]}")
        
        # Revenue stats
        result = conn.execute("SELECT SUM(amount), AVG(amount), MIN(amount), MAX(amount) FROM transactions").fetchone()
        print(f"Revenue - Total: ${result[0]:.2f}, Avg: ${result[1]:.2f}, Min: ${result[2]:.2f}, Max: ${result[3]:.2f}")
        
        # Date range
        result = conn.execute("SELECT MIN(created_at), MAX(created_at) FROM transactions").fetchone()
        print(f"Date range: {result[0]} to {result[1]}")
        
        # Top categories
        print("\n=== Top Categories ===")
        results = conn.execute("""
            SELECT category, COUNT(*) as count, SUM(amount) as revenue 
            FROM transactions 
            GROUP BY category 
            ORDER BY revenue DESC 
            LIMIT 5
        """).fetchall()
        
        for row in results:
            print(f"{row[0]}: {row[1]} transactions, ${row[2]:.2f} revenue")
        
    finally:
        conn.close()

def backup_database():
    """Create a backup of the database"""
    db_path = "./glanceable.duckdb"
    backup_path = f"./glanceable_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.duckdb"
    
    if not os.path.exists(db_path):
        print(f"Database not found: {db_path}")
        return
    
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"Database backed up to: {backup_path}")

def main():
    parser = argparse.ArgumentParser(description='Database management for Glanceable')
    parser.add_argument('action', choices=['reset', 'add-data', 'stats', 'backup'], 
                       help='Action to perform')
    
    args = parser.parse_args()
    
    if args.action == 'reset':
        reset_database()
    elif args.action == 'add-data':
        add_sample_data()
    elif args.action == 'stats':
        show_stats()
    elif args.action == 'backup':
        backup_database()

if __name__ == "__main__":
    main() 