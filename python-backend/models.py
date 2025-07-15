from sqlalchemy import Column, String, DateTime, Boolean, Text, Float, Integer
from sqlalchemy.sql import func
from database import Base

class Chart(Base):
    __tablename__ = "charts"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    chart_type = Column(String, nullable=False)  # bar, pie, line, etc.
    numeric_value = Column(String, nullable=False)  # count, average, sum, median
    metric = Column(String, nullable=False)  # revenue, daily_users, orders, etc.
    timeframe = Column(String, default="month")
    channel = Column(String, default="all")
    topic = Column(String, default="all")
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    value = Column(String, nullable=False)
    change = Column(Float)  # percentage change
    change_type = Column(String)  # positive, negative, neutral
    timeframe = Column(String, default="month")
    channel = Column(String, default="all")
    topic = Column(String, default="all")
    description = Column(Text)
    unit = Column(String)  # $, %, count, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Priority(Base):
    __tablename__ = "priorities"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    deadline = Column(String)
    priority = Column(String, nullable=False)  # high, medium, low
    impact = Column(String, nullable=False)  # high, medium, low
    status = Column(String, nullable=False)  # pending, in-progress, completed, planned
    timeframe = Column(String, default="month")
    channel = Column(String, default="all")
    topic = Column(String, default="all")
    assignee = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    urgency = Column(String, nullable=False)  # high, medium, low
    impact = Column(String, nullable=False)  # high, medium, low
    category = Column(String)  # optimization, feature, bug-fix, etc.
    implemented = Column(Boolean, default=False)
    timeframe = Column(String, default="month")
    channel = Column(String, default="all")
    topic = Column(String, default="all")
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())