from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn
import time
from sqlalchemy.orm import Session
from database import get_db, init_db
from models import Chart, Metric, Priority, Recommendation
from schemas import (
    ChartCreate, ChartUpdate, ChartResponse,
    MetricCreate, MetricUpdate, MetricResponse, 
    PriorityCreate, PriorityUpdate, PriorityResponse,
    RecommendationCreate, RecommendationUpdate, RecommendationResponse,
    PaginatedResponse
)
from pydantic import BaseModel

app = FastAPI(
    title="Glanceable API",
    description="FastAPI backend for Glanceable dashboard with GCP SQL database",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://glanceable-frontend.vercel.app",
        "https://glanceable-frontend-*.vercel.app",
        "https://glanceable-cyllir714-xerk-dots-projects.vercel.app",
        "https://glanceable-wx2iyxooh-xerk-dots-projects.vercel.app",
        "https://glanceable-7ahsikcys-xerk-dots-projects.vercel.app",
        "https://glanceable-qh8novrij-xerk-dots-projects.vercel.app",
        "https://glanceable.vercel.app",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://glanceable.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "glanceable-api"}

# Chart endpoints
@app.get("/api/charts", response_model=dict)
async def get_chart_data(
    chartType: str = Query("bar", enum=["bar", "pie"]),
    numericValue: str = Query("count", enum=["count", "average", "sum", "median"]),
    metric: str = Query("revenue", enum=["revenue", "daily_users", "orders", "user_segments", "category"]),
    period: str = Query("30d")
):
    """Generate sample chart data based on parameters"""
    # Sample data generation logic
    if chartType == "pie":
        sample_data = [
            {"id": "segment1", "label": "Premium", "value": 350},
            {"id": "segment2", "label": "Regular", "value": 800},
            {"id": "segment3", "label": "Basic", "value": 450},
            {"id": "segment4", "label": "Trial", "value": 200}
        ]
    else:  # bar chart
        sample_data = [
            {"id": "jan", "label": "January", "value": 28000},
            {"id": "feb", "label": "February", "value": 31000},
            {"id": "mar", "label": "March", "value": 35000},
            {"id": "apr", "label": "April", "value": 29000}
        ]
    
    return {"success": True, "data": sample_data}

@app.get("/api/metrics", response_model=dict)
async def get_system_metrics():
    """Get system-level metrics"""
    return {
        "metrics": [
            {"id": "1", "title": "Total Revenue", "value": "$45.2K", "change": "+12%", "changeType": "positive"},
            {"id": "2", "title": "Active Users", "value": "2,847", "change": "+5%", "changeType": "positive"},
            {"id": "3", "title": "Conversion Rate", "value": "3.2%", "change": "+0.8%", "changeType": "positive"},
            {"id": "4", "title": "Avg Order Value", "value": "$127", "change": "-2%", "changeType": "negative"}
        ]
    }

@app.get("/api/priorities", response_model=dict)
async def get_system_priorities():
    """Get system-level priorities"""
    return {
        "priorities": [
            {"id": "1", "title": "Review Q4 financials", "deadline": "Today", "status": "in-progress"},
            {"id": "2", "title": "Update team on project status", "deadline": "Dec 15", "status": "pending"}
        ]
    }

@app.get("/api/recommendations", response_model=dict)
async def get_system_recommendations():
    """Get system-level recommendations"""
    return {
        "recommendations": [
            "Optimize checkout flow to reduce cart abandonment",
            "Implement A/B testing for landing page conversion",
            "Add live chat support for customer inquiries"
        ]
    }

# User Charts CRUD
@app.get("/api/user/charts", response_model=PaginatedResponse[ChartResponse])
async def get_user_charts(
    db: Session = Depends(get_db),
    timeframe: Optional[str] = None,
    channel: Optional[str] = None,
    topic: Optional[str] = None,
    chartType: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Chart)
    
    if timeframe and timeframe != "all":
        query = query.filter(Chart.timeframe == timeframe)
    if channel and channel != "all":
        query = query.filter(Chart.channel == channel)
    if topic and topic != "all":
        query = query.filter(Chart.topic == topic)
    if chartType and chartType != "all":
        query = query.filter(Chart.chart_type == chartType)
    
    total = query.count()
    charts = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        items=charts,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.post("/api/user/charts", response_model=dict)
async def create_user_chart(
    chart: ChartCreate,
    db: Session = Depends(get_db)
):
    chart_data = chart.dict()
    chart_data["id"] = str(int(time.time() * 1000))  # Generate timestamp-based ID
    db_chart = Chart(**chart_data)
    db.add(db_chart)
    db.commit()
    db.refresh(db_chart)
    return {"message": "Chart created successfully", "chart": {"id": db_chart.id, "title": db_chart.title, "chart_type": db_chart.chart_type, "numeric_value": db_chart.numeric_value, "metric": db_chart.metric}}

@app.put("/api/user/charts", response_model=dict)
async def update_user_chart(
    chart: ChartUpdate,
    db: Session = Depends(get_db)
):
    db_chart = db.query(Chart).filter(Chart.id == chart.id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    for field, value in chart.dict(exclude_unset=True).items():
        if field != "id":
            setattr(db_chart, field, value)
    
    db.commit()
    db.refresh(db_chart)
    return {"message": "Chart updated successfully", "chart": {"id": db_chart.id, "title": db_chart.title, "chart_type": db_chart.chart_type, "numeric_value": db_chart.numeric_value, "metric": db_chart.metric}}

@app.delete("/api/user/charts")
async def delete_user_chart(
    id: str = Query(...),
    db: Session = Depends(get_db)
):
    db_chart = db.query(Chart).filter(Chart.id == id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    db.delete(db_chart)
    db.commit()
    return {"message": "Chart deleted successfully", "chart": {"id": db_chart.id, "title": db_chart.title}}

# User Metrics CRUD
@app.get("/api/user/metrics", response_model=PaginatedResponse[MetricResponse])
async def get_user_metrics(
    db: Session = Depends(get_db),
    timeframe: Optional[str] = None,
    channel: Optional[str] = None,
    topic: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Metric)
    
    if timeframe and timeframe != "all":
        query = query.filter(Metric.timeframe == timeframe)
    if channel and channel != "all":
        query = query.filter(Metric.channel == channel)
    if topic and topic != "all":
        query = query.filter(Metric.topic == topic)
    
    total = query.count()
    metrics = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        items=metrics,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.post("/api/user/metrics", response_model=dict)
async def create_user_metric(
    metric: MetricCreate,
    db: Session = Depends(get_db)
):
    metric_data = metric.dict()
    metric_data["id"] = str(int(time.time() * 1000))
    db_metric = Metric(**metric_data)
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return {"message": "Metric created successfully", "metric": {"id": db_metric.id, "title": db_metric.title, "value": db_metric.value, "change": db_metric.change, "change_type": db_metric.change_type}}

@app.put("/api/user/metrics", response_model=dict)
async def update_user_metric(
    metric: MetricUpdate,
    db: Session = Depends(get_db)
):
    db_metric = db.query(Metric).filter(Metric.id == metric.id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    for field, value in metric.dict(exclude_unset=True).items():
        if field != "id":
            setattr(db_metric, field, value)
    
    db.commit()
    db.refresh(db_metric)
    return {"message": "Metric updated successfully", "metric": {"id": db_metric.id, "title": db_metric.title, "value": db_metric.value, "change": db_metric.change, "change_type": db_metric.change_type}}

@app.delete("/api/user/metrics")
async def delete_user_metric(
    id: str = Query(...),
    db: Session = Depends(get_db)
):
    db_metric = db.query(Metric).filter(Metric.id == id).first()
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    db.delete(db_metric)
    db.commit()
    return {"message": "Metric deleted successfully", "metric": {"id": db_metric.id, "title": db_metric.title}}

# User Priorities CRUD
@app.get("/api/user/priorities", response_model=PaginatedResponse[PriorityResponse])
async def get_user_priorities(
    db: Session = Depends(get_db),
    timeframe: Optional[str] = None,
    channel: Optional[str] = None,
    topic: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    impact: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Priority)
    
    if timeframe and timeframe != "all":
        query = query.filter(Priority.timeframe == timeframe)
    if channel and channel != "all":
        query = query.filter(Priority.channel == channel)
    if topic and topic != "all":
        query = query.filter(Priority.topic == topic)
    if status and status != "all":
        query = query.filter(Priority.status == status)
    if priority and priority != "all":
        query = query.filter(Priority.priority == priority)
    if impact and impact != "all":
        query = query.filter(Priority.impact == impact)
    
    total = query.count()
    priorities = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        items=priorities,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.post("/api/user/priorities", response_model=dict)
async def create_user_priority(
    priority: PriorityCreate,
    db: Session = Depends(get_db)
):
    priority_data = priority.dict()
    priority_data["id"] = str(int(time.time() * 1000))
    db_priority = Priority(**priority_data)
    db.add(db_priority)
    db.commit()
    db.refresh(db_priority)
    return {"message": "Priority created successfully", "priority": {"id": db_priority.id, "title": db_priority.title, "priority": db_priority.priority, "impact": db_priority.impact, "status": db_priority.status}}

@app.put("/api/user/priorities", response_model=dict)
async def update_user_priority(
    priority: PriorityUpdate,
    db: Session = Depends(get_db)
):
    db_priority = db.query(Priority).filter(Priority.id == priority.id).first()
    if not db_priority:
        raise HTTPException(status_code=404, detail="Priority not found")
    
    for field, value in priority.dict(exclude_unset=True).items():
        if field != "id":
            setattr(db_priority, field, value)
    
    db.commit()
    db.refresh(db_priority)
    return {"message": "Priority updated successfully", "priority": {"id": db_priority.id, "title": db_priority.title, "priority": db_priority.priority, "impact": db_priority.impact, "status": db_priority.status}}

@app.delete("/api/user/priorities")
async def delete_user_priority(
    id: str = Query(...),
    db: Session = Depends(get_db)
):
    db_priority = db.query(Priority).filter(Priority.id == id).first()
    if not db_priority:
        raise HTTPException(status_code=404, detail="Priority not found")
    
    db.delete(db_priority)
    db.commit()
    return {"message": "Priority deleted successfully", "priority": {"id": db_priority.id, "title": db_priority.title}}

# User Recommendations CRUD
@app.get("/api/user/recommendations", response_model=PaginatedResponse[RecommendationResponse])
async def get_user_recommendations(
    db: Session = Depends(get_db),
    timeframe: Optional[str] = None,
    channel: Optional[str] = None,
    topic: Optional[str] = None,
    urgency: Optional[str] = None,
    impact: Optional[str] = None,
    category: Optional[str] = None,
    implemented: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = db.query(Recommendation)
    
    if timeframe and timeframe != "all":
        query = query.filter(Recommendation.timeframe == timeframe)
    if channel and channel != "all":
        query = query.filter(Recommendation.channel == channel)
    if topic and topic != "all":
        query = query.filter(Recommendation.topic == topic)
    if urgency and urgency != "all":
        query = query.filter(Recommendation.urgency == urgency)
    if impact and impact != "all":
        query = query.filter(Recommendation.impact == impact)
    if category and category != "all":
        query = query.filter(Recommendation.category == category)
    if implemented is not None:
        query = query.filter(Recommendation.implemented == implemented)
    
    total = query.count()
    recommendations = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        items=recommendations,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.post("/api/user/recommendations", response_model=dict)
async def create_user_recommendation(
    recommendation: RecommendationCreate,
    db: Session = Depends(get_db)
):
    recommendation_data = recommendation.dict()
    recommendation_data["id"] = str(int(time.time() * 1000))
    db_recommendation = Recommendation(**recommendation_data)
    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)
    return {"message": "Recommendation created successfully", "recommendation": {"id": db_recommendation.id, "text": db_recommendation.text, "urgency": db_recommendation.urgency, "impact": db_recommendation.impact}}

@app.put("/api/user/recommendations", response_model=dict)
async def update_user_recommendation(
    recommendation: RecommendationUpdate,
    db: Session = Depends(get_db)
):
    db_recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation.id).first()
    if not db_recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    for field, value in recommendation.dict(exclude_unset=True).items():
        if field != "id":
            setattr(db_recommendation, field, value)
    
    db.commit()
    db.refresh(db_recommendation)
    return {"message": "Recommendation updated successfully", "recommendation": {"id": db_recommendation.id, "text": db_recommendation.text, "urgency": db_recommendation.urgency, "impact": db_recommendation.impact}}

@app.delete("/api/user/recommendations")
async def delete_user_recommendation(
    id: str = Query(...),
    db: Session = Depends(get_db)
):
    db_recommendation = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not db_recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    db.delete(db_recommendation)
    db.commit()
    return {"message": "Recommendation deleted successfully", "recommendation": {"id": db_recommendation.id, "text": db_recommendation.text}}

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)