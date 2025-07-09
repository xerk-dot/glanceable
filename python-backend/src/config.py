import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # Database Configuration
    DATABASE_URL = os.getenv('DATABASE_URL')
    ANALYTICS_DATABASE_URL = os.getenv('ANALYTICS_DATABASE_URL')
    WAREHOUSE_DATABASE_URL = os.getenv('WAREHOUSE_DATABASE_URL')
    
    # CORS Configuration
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    CORS_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS]
    
    # Cache Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # SQL Debug
    SQL_DEBUG = os.getenv('SQL_DEBUG', 'false').lower() == 'true'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    
    # Use DuckDB for development if no DATABASE_URL is provided
    if not Config.DATABASE_URL:
        DATABASE_URL = 'duckdb:///../data/glanceable.duckdb'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    def __init__(self):
        super().__init__()
        # Ensure database URL is provided in production
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL must be set in production")

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    DATABASE_URL = 'duckdb:///:memory:'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 