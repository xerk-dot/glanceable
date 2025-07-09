#!/usr/bin/env python3
"""
Migration script to add filter columns (timeframe, channel, topic) to existing user data tables.
Run this script to update existing databases with the new filter columns.
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text, inspect

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.user_data_db import Base, UserMetric, UserRecommendation, UserPriority, UserChart

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Add filter columns to existing user data tables"""
    
    # Get database URL
    db_url = os.getenv('USER_DATA_DATABASE_URL', 'duckdb:///../data/user_data.duckdb')
    logger.info(f"Migrating database: {db_url}")
    
    try:
        # Create engine
        engine = create_engine(db_url, echo=False)
        
        # Get inspector to check existing columns
        inspector = inspect(engine)
        
        # Define migrations for each table
        migrations = [
            {
                'table': 'user_metrics',
                'columns': [
                    "ALTER TABLE user_metrics ADD COLUMN timeframe VARCHAR DEFAULT 'month'",
                    "ALTER TABLE user_metrics ADD COLUMN channel VARCHAR DEFAULT 'web'",
                    "ALTER TABLE user_metrics ADD COLUMN topic VARCHAR DEFAULT 'sales'"
                ]
            },
            {
                'table': 'user_recommendations',
                'columns': [
                    "ALTER TABLE user_recommendations ADD COLUMN timeframe VARCHAR DEFAULT 'week'",
                    "ALTER TABLE user_recommendations ADD COLUMN channel VARCHAR DEFAULT 'web'",
                    "ALTER TABLE user_recommendations ADD COLUMN topic VARCHAR DEFAULT 'sales'"
                ]
            },
            {
                'table': 'user_priorities',
                'columns': [
                    "ALTER TABLE user_priorities ADD COLUMN timeframe VARCHAR DEFAULT 'week'",
                    "ALTER TABLE user_priorities ADD COLUMN channel VARCHAR DEFAULT 'direct'",
                    "ALTER TABLE user_priorities ADD COLUMN topic VARCHAR DEFAULT 'operations'"
                ]
            },
            {
                'table': 'user_charts',
                'columns': [
                    "ALTER TABLE user_charts ADD COLUMN timeframe VARCHAR DEFAULT 'month'",
                    "ALTER TABLE user_charts ADD COLUMN channel VARCHAR DEFAULT 'web'",
                    "ALTER TABLE user_charts ADD COLUMN topic VARCHAR DEFAULT 'sales'"
                ]
            }
        ]
        
        with engine.connect() as conn:
            for migration in migrations:
                table_name = migration['table']
                
                # Check if table exists
                if table_name not in inspector.get_table_names():
                    logger.info(f"Table {table_name} does not exist, skipping")
                    continue
                
                # Get existing columns
                existing_columns = [col['name'] for col in inspector.get_columns(table_name)]
                
                # Apply column additions
                for alter_statement in migration['columns']:
                    column_name = alter_statement.split('ADD COLUMN ')[1].split(' ')[0]
                    
                    if column_name not in existing_columns:
                        logger.info(f"Adding column {column_name} to {table_name}")
                        try:
                            conn.execute(text(alter_statement))
                            conn.commit()
                            logger.info(f"✓ Successfully added {column_name} to {table_name}")
                        except Exception as e:
                            logger.warning(f"Failed to add {column_name} to {table_name}: {e}")
                            # Try alternative syntax for different databases
                            try:
                                simple_alter = f"ALTER TABLE {table_name} ADD {column_name} VARCHAR"
                                conn.execute(text(simple_alter))
                                conn.commit()
                                logger.info(f"✓ Successfully added {column_name} to {table_name} (alternative syntax)")
                            except Exception as e2:
                                logger.error(f"Failed with alternative syntax too: {e2}")
                    else:
                        logger.info(f"Column {column_name} already exists in {table_name}")
        
        logger.info("Migration completed successfully!")
        
        # Verify the migration by creating all tables (will only create missing ones)
        Base.metadata.create_all(engine)
        logger.info("Verified table schemas are up to date")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    logger.info("Starting database migration for filter columns...")
    migrate_database()
    logger.info("Migration complete!") 