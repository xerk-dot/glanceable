from pydantic import BaseModel
from typing import Optional, List, TypeVar, Generic
from datetime import datetime

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    total_pages: int

# Chart schemas
class ChartBase(BaseModel):
    title: str
    chart_type: str
    numeric_value: str
    metric: str
    timeframe: Optional[str] = "month"
    channel: Optional[str] = "all"
    topic: Optional[str] = "all"
    description: Optional[str] = None

class ChartCreate(ChartBase):
    pass

class ChartUpdate(ChartBase):
    id: str
    title: Optional[str] = None
    chart_type: Optional[str] = None
    numeric_value: Optional[str] = None
    metric: Optional[str] = None

class ChartResponse(ChartBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Metric schemas
class MetricBase(BaseModel):
    title: str
    value: str
    change: Optional[float] = None
    change_type: Optional[str] = None
    timeframe: Optional[str] = "month"
    channel: Optional[str] = "all"
    topic: Optional[str] = "all"
    description: Optional[str] = None
    unit: Optional[str] = None

class MetricCreate(MetricBase):
    pass

class MetricUpdate(MetricBase):
    id: str
    title: Optional[str] = None
    value: Optional[str] = None

class MetricResponse(MetricBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Priority schemas
class PriorityBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    priority: str  # high, medium, low
    impact: str  # high, medium, low
    status: str  # pending, in-progress, completed, planned
    timeframe: Optional[str] = "month"
    channel: Optional[str] = "all"
    topic: Optional[str] = "all"
    assignee: Optional[str] = None

class PriorityCreate(PriorityBase):
    pass

class PriorityUpdate(PriorityBase):
    id: str
    title: Optional[str] = None
    priority: Optional[str] = None
    impact: Optional[str] = None
    status: Optional[str] = None

class PriorityResponse(PriorityBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Recommendation schemas
class RecommendationBase(BaseModel):
    text: str
    urgency: str  # high, medium, low
    impact: str  # high, medium, low
    category: Optional[str] = None
    implemented: Optional[bool] = False
    timeframe: Optional[str] = "month"
    channel: Optional[str] = "all"
    topic: Optional[str] = "all"
    description: Optional[str] = None

class RecommendationCreate(RecommendationBase):
    pass

class RecommendationUpdate(RecommendationBase):
    id: str
    text: Optional[str] = None
    urgency: Optional[str] = None
    impact: Optional[str] = None

class RecommendationResponse(RecommendationBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True