import os
import logging
from typing import Dict, List, Any, Optional
import sqlalchemy as sa
from sqlalchemy import create_engine, text
from contextlib import contextmanager
import pandas as pd
import duckdb
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages connections to remote SQL databases for chart data"""
    
    def __init__(self):
        self.engines = {}
        self._setup_connections()
    
    def _setup_connections(self):
        """Setup database connections based on environment variables"""
        # Primary database connection
        primary_db_url = os.getenv('DATABASE_URL')
        
        # Fallback to DuckDB if no DATABASE_URL is set
        if not primary_db_url:
            primary_db_url = 'duckdb:///./glanceable.duckdb'
            logger.info("No DATABASE_URL set, using default DuckDB database")
        
        logger.info(f"Setting up primary database connection: {primary_db_url}")
        engine = self._create_engine(primary_db_url, 'primary')
        if engine:
            self.engines['primary'] = engine
            logger.info("Primary database engine created successfully")
        else:
            logger.error("Failed to create primary database engine")
        
        # Analytics database (if separate)
        analytics_db_url = os.getenv('ANALYTICS_DATABASE_URL')
        if analytics_db_url:
            self.engines['analytics'] = self._create_engine(analytics_db_url, 'analytics')
        
        # Data warehouse connection
        warehouse_db_url = os.getenv('WAREHOUSE_DATABASE_URL')
        if warehouse_db_url:
            self.engines['warehouse'] = self._create_engine(warehouse_db_url, 'warehouse')
        
        logger.info(f"Database engines configured: {list(self.engines.keys())}")
        if not self.engines:
            logger.warning("No database connections configured")
    
    def _create_engine(self, db_url: str, name: str):
        """Create a SQLAlchemy engine for DuckDB"""
        try:
            engine = create_engine(
                db_url,
                echo=os.getenv('SQL_DEBUG', 'false').lower() == 'true'
            )
            
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            logger.info(f"Successfully connected to {name} database")
            return engine
            
        except Exception as e:
            logger.error(f"Failed to connect to {name} database: {str(e)}")
            # Still return the engine even if connection test fails
            # This allows the app to start and handle connection errors gracefully
            try:
                return create_engine(db_url, echo=False)
            except:
                return None
    
    @contextmanager
    def get_connection(self, db_name: str = 'primary'):
        """Get a database connection with automatic cleanup"""
        engine = self.engines.get(db_name)
        if not engine:
            raise ValueError(f"Database '{db_name}' not configured")
        
        conn = engine.connect()
        try:
            yield conn
        finally:
            conn.close()
    
    def execute_query(self, query: str, params: Dict = None, db_name: str = 'primary') -> pd.DataFrame:
        """Execute a query and return results as a pandas DataFrame"""
        try:
            with self.get_connection(db_name) as conn:
                df = pd.read_sql(text(query), conn, params=params or {})
                logger.info(f"Query executed successfully, returned {len(df)} rows")
                return df
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}")
            raise
    
    def get_revenue_data(self, period: str = '30d', category: Optional[str] = None) -> pd.DataFrame:
        """Get revenue data for bar charts"""
        days = int(period.replace('d', ''))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        base_query = """
        SELECT 
            DATE_TRUNC('day', created_at) as date,
            COALESCE(category, 'Other') as category,
            SUM(amount) as revenue,
            COUNT(*) as transaction_count
        FROM transactions 
        WHERE created_at >= :start_date
        """
        
        if category:
            base_query += " AND category = :category"
        
        base_query += """
        GROUP BY DATE_TRUNC('day', created_at), category
        ORDER BY date DESC, revenue DESC
        """
        
        params = {'start_date': start_date}
        if category:
            params['category'] = category
        
        return self.execute_query(base_query, params)
    
    def get_user_segment_data(self, period: str = '30d') -> pd.DataFrame:
        """Get user segment data for pie charts"""
        days = int(period.replace('d', ''))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = """
        SELECT 
            CASE 
                WHEN total_spent >= 1000 THEN 'Premium'
                WHEN total_spent >= 100 THEN 'Regular'
                ELSE 'Basic'
            END as segment,
            COUNT(DISTINCT user_id) as user_count,
            SUM(total_spent) as total_revenue
        FROM (
            SELECT 
                user_id,
                SUM(amount) as total_spent
            FROM transactions 
            WHERE created_at >= :start_date
            GROUP BY user_id
        ) user_totals
        GROUP BY segment
        ORDER BY total_revenue DESC
        """
        
        return self.execute_query(query, {'start_date': start_date})
    
    def get_revenue_by_category_data(self, period: str = '30d') -> pd.DataFrame:
        """Get revenue data grouped by category for pie charts"""
        days = int(period.replace('d', ''))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = """
        SELECT 
            CASE 
                WHEN category = 'electronics' THEN 'Electronics & Tech'
                WHEN category = 'clothing' THEN 'Fashion & Apparel'
                WHEN category = 'food' THEN 'Food & Dining'
                WHEN category = 'books' THEN 'Books & Media'
                WHEN category = 'home' THEN 'Home & Garden'
                WHEN category = 'sports' THEN 'Sports & Outdoors'
                WHEN category = 'beauty' THEN 'Beauty & Personal Care'
                WHEN category = 'automotive' THEN 'Automotive & Tools'
                ELSE 'Other'
            END as category,
            SUM(amount) as revenue,
            COUNT(*) as transaction_count
        FROM transactions 
        WHERE created_at >= :start_date
        GROUP BY 
            CASE 
                WHEN category = 'electronics' THEN 'Electronics & Tech'
                WHEN category = 'clothing' THEN 'Fashion & Apparel'
                WHEN category = 'food' THEN 'Food & Dining'
                WHEN category = 'books' THEN 'Books & Media'
                WHEN category = 'home' THEN 'Home & Garden'
                WHEN category = 'sports' THEN 'Sports & Outdoors'
                WHEN category = 'beauty' THEN 'Beauty & Personal Care'
                WHEN category = 'automotive' THEN 'Automotive & Tools'
                ELSE 'Other'
            END
        ORDER BY revenue DESC
        """
        
        return self.execute_query(query, {'start_date': start_date})

    def get_time_series_data(self, metric: str, period: str = '30d', granularity: str = 'day') -> pd.DataFrame:
        """Get time series data for line charts"""
        days = int(period.replace('d', ''))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Determine date grouping based on granularity
        date_format = {
            'hour': "DATE_TRUNC('hour', created_at)",
            'day': "DATE_TRUNC('day', created_at)",
            'week': "DATE_TRUNC('week', created_at)",
            'month': "DATE_TRUNC('month', created_at)"
        }.get(granularity, "DATE_TRUNC('day', created_at)")
        
        metric_queries = {
            'daily_users': f"""
                SELECT 
                    {date_format} as date,
                    COUNT(DISTINCT user_id) as value
                FROM user_activities 
                WHERE created_at >= :start_date
                GROUP BY {date_format}
                ORDER BY date
            """,
            'revenue': f"""
                SELECT 
                    {date_format} as date,
                    SUM(amount) as value
                FROM transactions 
                WHERE created_at >= :start_date
                GROUP BY {date_format}
                ORDER BY date
            """,
            'orders': f"""
                SELECT 
                    {date_format} as date,
                    COUNT(*) as value
                FROM orders 
                WHERE created_at >= :start_date
                GROUP BY {date_format}
                ORDER BY date
            """
        }
        
        query = metric_queries.get(metric)
        if not query:
            raise ValueError(f"Unknown metric: {metric}")
        
        return self.execute_query(query, {'start_date': start_date})
    
    def get_realtime_metrics(self) -> Dict[str, Any]:
        """Get real-time metrics from the database"""
        queries = {
            'active_users': """
                SELECT COUNT(DISTINCT user_id) as value
                FROM user_activities 
                WHERE created_at >= NOW() - INTERVAL 1 HOUR
            """,
            'current_revenue': """
                SELECT COALESCE(SUM(amount), 0) as value
                FROM transactions 
                WHERE DATE_TRUNC('day', created_at) = CURRENT_DATE
            """,
            'pending_orders': """
                SELECT COUNT(*) as value
                FROM orders 
                WHERE status = 'pending'
            """
        }
        
        results = {}
        for metric, query in queries.items():
            try:
                df = self.execute_query(query)
                results[metric] = df.iloc[0]['value'] if not df.empty else 0
            except Exception as e:
                logger.error(f"Failed to get {metric}: {str(e)}")
                results[metric] = 0
        
        return results
    
    def test_connections(self) -> Dict[str, bool]:
        """Test all database connections"""
        results = {}
        for name, engine in self.engines.items():
            try:
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                results[name] = True
                logger.info(f"Connection test passed for {name}")
            except Exception as e:
                results[name] = False
                logger.error(f"Connection test failed for {name}: {str(e)}")
        
        return results 