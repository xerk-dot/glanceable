import os
import logging
import json
from typing import Dict, List, Any, Optional
import sqlalchemy as sa
from sqlalchemy import create_engine, text, Column, Integer, String, DateTime, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from datetime import datetime

logger = logging.getLogger(__name__)

Base = declarative_base()

class UserChart(Base):
    __tablename__ = 'user_charts'
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    chart_type = Column(String, nullable=False)  # 'pie' | 'bar'
    numeric_value = Column(String, nullable=False)
    metric = Column(String, nullable=False)
    timeframe = Column(String, nullable=True, default='month')
    channel = Column(String, nullable=True, default='web')
    topic = Column(String, nullable=True, default='sales')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserMetric(Base):
    __tablename__ = 'user_metrics'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    change = Column(String, nullable=True)
    trend = Column(String, nullable=False)  # 'up' | 'down' | 'neutral'
    timeframe = Column(String, nullable=True, default='month')
    channel = Column(String, nullable=True, default='web')
    topic = Column(String, nullable=True, default='sales')
    created_at = Column(DateTime, default=datetime.utcnow)

class UserPriority(Base):
    __tablename__ = 'user_priorities'
    
    id = Column(String, primary_key=True)
    task = Column(Text, nullable=False)
    deadline = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'pending' | 'in-progress' | 'completed'
    timeframe = Column(String, nullable=True, default='week')
    channel = Column(String, nullable=True, default='direct')
    topic = Column(String, nullable=True, default='operations')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserRecommendation(Base):
    __tablename__ = 'user_recommendations'
    
    id = Column(String, primary_key=True)
    text = Column(Text, nullable=False)
    urgency = Column(String, nullable=False)  # 'high' | 'medium' | 'low'
    impact = Column(String, nullable=False)   # 'high' | 'medium' | 'low'
    timeframe = Column(String, nullable=True, default='week')
    channel = Column(String, nullable=True, default='web')
    topic = Column(String, nullable=True, default='sales')
    created_at = Column(DateTime, default=datetime.utcnow)

class UserDataManager:
    """Manages user-specific dashboard data storage"""
    
    def __init__(self):
        self.engine = None
        self.Session = None
        self._setup_database()
    
    def _setup_database(self):
        """Setup database connection and create tables"""
        db_url = os.getenv('USER_DATA_DATABASE_URL', 'duckdb:///../data/user_data.duckdb')
        logger.info(f"Setting up user data database: {db_url}")
        
        try:
            self.engine = create_engine(db_url, echo=False)
            
            # Create all tables
            Base.metadata.create_all(self.engine)
            
            # Create session factory
            self.Session = sessionmaker(bind=self.engine)
            
            logger.info("User data database setup completed")
            
        except Exception as e:
            logger.error(f"Failed to setup user data database: {str(e)}")
            # Don't raise - allow app to continue without user data DB
            self.engine = None
            self.Session = None
    
    @contextmanager
    def get_session(self):
        """Get a database session with automatic cleanup"""
        if not self.Session:
            raise RuntimeError("Database not available")
        
        session = self.Session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            session.close()
    
    def is_available(self) -> bool:
        """Check if database is available"""
        return self.engine is not None and self.Session is not None
    
    # Chart operations
    def get_charts(self) -> List[Dict[str, Any]]:
        """Get all user charts"""
        if not self.is_available():
            return []
        
        try:
            with self.get_session() as session:
                charts = session.query(UserChart).all()
                return [
                    {
                        'id': chart.id,
                        'title': chart.title,
                        'chartType': chart.chart_type,
                        'numericValue': chart.numeric_value,
                        'metric': chart.metric,
                        'created_at': chart.created_at.isoformat(),
                        'updated_at': chart.updated_at.isoformat()
                    }
                    for chart in charts
                ]
        except Exception as e:
            logger.error(f"Error getting charts: {e}")
            return []
    
    def create_chart(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new chart"""
        if not self.is_available():
            # Return the data as-is when DB is not available
            return {
                'id': chart_data['id'],
                'title': chart_data['title'],
                'chartType': chart_data['chartType'],
                'numericValue': chart_data['numericValue'],
                'metric': chart_data['metric']
            }
        
        try:
            with self.get_session() as session:
                chart = UserChart(
                    id=chart_data['id'],
                    title=chart_data['title'],
                    chart_type=chart_data['chartType'],
                    numeric_value=chart_data['numericValue'],
                    metric=chart_data['metric']
                )
                session.add(chart)
                return {
                    'id': chart.id,
                    'title': chart.title,
                    'chartType': chart.chart_type,
                    'numericValue': chart.numeric_value,
                    'metric': chart.metric
                }
        except Exception as e:
            logger.error(f"Error creating chart: {e}")
            return {
                'id': chart_data['id'],
                'title': chart_data['title'],
                'chartType': chart_data['chartType'],
                'numericValue': chart_data['numericValue'],
                'metric': chart_data['metric']
            }
    
    def update_chart(self, chart_id: str, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing chart"""
        with self.get_session() as session:
            chart = session.query(UserChart).filter(UserChart.id == chart_id).first()
            if not chart:
                raise ValueError(f"Chart with id {chart_id} not found")
            
            chart.title = chart_data['title']
            chart.chart_type = chart_data['chartType']
            chart.numeric_value = chart_data['numericValue']
            chart.metric = chart_data['metric']
            chart.updated_at = datetime.utcnow()
            
            return {
                'id': chart.id,
                'title': chart.title,
                'chartType': chart.chart_type,
                'numericValue': chart.numeric_value,
                'metric': chart.metric
            }
    
    def delete_chart(self, chart_id: str) -> bool:
        """Delete a chart"""
        with self.get_session() as session:
            chart = session.query(UserChart).filter(UserChart.id == chart_id).first()
            if chart:
                session.delete(chart)
                return True
            return False
    
    # Metric operations
    def get_metrics(self) -> List[Dict[str, Any]]:
        """Get all user metrics"""
        with self.get_session() as session:
            metrics = session.query(UserMetric).order_by(UserMetric.created_at.desc()).all()
            return [
                {
                    'id': metric.id,
                    'name': metric.name,
                    'value': metric.value,
                    'change': metric.change,
                    'trend': metric.trend,
                    'timeframe': metric.timeframe,
                    'channel': metric.channel,
                    'topic': metric.topic,
                    'created_at': metric.created_at.isoformat()
                }
                for metric in metrics
            ]
    
    def create_metric(self, metric_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new metric"""
        import uuid
        with self.get_session() as session:
            metric_id = str(uuid.uuid4())
            metric = UserMetric(
                id=metric_id,
                name=metric_data['name'],
                value=metric_data['value'],
                change=metric_data.get('change'),
                trend=metric_data['trend'],
                timeframe=metric_data.get('timeframe', 'month'),
                channel=metric_data.get('channel', 'web'),
                topic=metric_data.get('topic', 'sales')
            )
            session.add(metric)
            return {
                'id': metric.id,
                'name': metric.name,
                'value': metric.value,
                'change': metric.change,
                'trend': metric.trend,
                'timeframe': metric.timeframe,
                'channel': metric.channel,
                'topic': metric.topic
            }
    
    # Priority operations
    def get_priorities(self) -> List[Dict[str, Any]]:
        """Get all user priorities"""
        with self.get_session() as session:
            priorities = session.query(UserPriority).order_by(UserPriority.created_at.desc()).all()
            return [
                {
                    'id': priority.id,
                    'task': priority.task,
                    'deadline': priority.deadline,
                    'status': priority.status,
                    'timeframe': priority.timeframe,
                    'channel': priority.channel,
                    'topic': priority.topic,
                    'created_at': priority.created_at.isoformat()
                }
                for priority in priorities
            ]
    
    def create_priority(self, priority_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new priority"""
        with self.get_session() as session:
            priority = UserPriority(
                id=priority_data['id'],
                task=priority_data['task'],
                deadline=priority_data['deadline'],
                status=priority_data['status'],
                timeframe=priority_data.get('timeframe', 'week'),
                channel=priority_data.get('channel', 'direct'),
                topic=priority_data.get('topic', 'operations')
            )
            session.add(priority)
            return {
                'id': priority.id,
                'task': priority.task,
                'deadline': priority.deadline,
                'status': priority.status,
                'timeframe': priority.timeframe,
                'channel': priority.channel,
                'topic': priority.topic
            }
    
    # Recommendation operations
    def get_recommendations(self) -> List[Dict[str, Any]]:
        """Get all user recommendations"""
        with self.get_session() as session:
            recommendations = session.query(UserRecommendation).order_by(UserRecommendation.created_at.desc()).all()
            return [
                {
                    'id': rec.id,
                    'text': rec.text,
                    'urgency': rec.urgency,
                    'impact': rec.impact,
                    'timeframe': rec.timeframe,
                    'channel': rec.channel,
                    'topic': rec.topic,
                    'created_at': rec.created_at.isoformat()
                }
                for rec in recommendations
            ]
    
    def create_recommendation(self, rec_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new recommendation"""
        with self.get_session() as session:
            recommendation = UserRecommendation(
                id=rec_data['id'],
                text=rec_data['text'],
                urgency=rec_data['urgency'],
                impact=rec_data['impact'],
                timeframe=rec_data.get('timeframe', 'week'),
                channel=rec_data.get('channel', 'web'),
                topic=rec_data.get('topic', 'sales')
            )
            session.add(recommendation)
            return {
                'id': recommendation.id,
                'text': recommendation.text,
                'urgency': recommendation.urgency,
                'impact': recommendation.impact,
                'timeframe': recommendation.timeframe,
                'channel': recommendation.channel,
                'topic': recommendation.topic
            }

# Global instance
user_data_manager = UserDataManager() 