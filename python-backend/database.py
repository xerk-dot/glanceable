from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from typing import Generator

# GCP SQL configuration
PROJECT_ID = os.getenv("PROJECT_ID", "hanover-464416")
REGION = os.getenv("REGION", "us-central1")
INSTANCE_NAME = os.getenv("INSTANCE_NAME", "glanceable-db")
DB_NAME = os.getenv("DB_NAME", "glanceable")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "glanceable123")

Base = declarative_base()

def create_database_engine():
    """Create database engine for GCP SQL"""
    try:
        # Check if running in Cloud Run (has Google Cloud SQL connector)
        if os.getenv("K_SERVICE"):  # Cloud Run environment variable
            # Use Cloud SQL connector for Cloud Run
            from google.cloud.sql.connector import Connector
            
            connector = Connector()
            
            def getconn():
                return connector.connect(
                    f"{PROJECT_ID}:{REGION}:{INSTANCE_NAME}",
                    "pg8000",
                    user=DB_USER,
                    password=DB_PASSWORD,
                    db=DB_NAME,
                )
            
            engine = create_engine(
                "postgresql+pg8000://",
                creator=getconn,
                pool_size=5,
                max_overflow=2,
                pool_pre_ping=True,
                pool_recycle=300,
            )
            print("✅ Connected to GCP SQL database (Cloud SQL connector)")
            return engine
        else:
            # Use direct connection for local development
            DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@34.61.127.202:5432/{DB_NAME}"
            engine = create_engine(
                DATABASE_URL,
                pool_size=5,
                max_overflow=2,
                pool_pre_ping=True,
                pool_recycle=300,
            )
            print("✅ Connected to GCP SQL database (direct connection)")
            return engine
    except Exception as e:
        print(f"❌ Failed to connect to GCP SQL: {e}")
        # Fallback to SQLite for development
        print("🔄 Falling back to SQLite...")
        DATABASE_URL = "sqlite:///./glanceable.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )
        return engine

# Create engine and session
engine = create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)