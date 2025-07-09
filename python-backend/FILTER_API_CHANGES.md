# Filter API Changes

This document describes the updates made to the Python backend to support filtering by timeframe, channel, and topic across Key Metrics, AI Recommendations, and Top Priorities.

## Overview

The backend has been updated to support three new filter dimensions:
- **Timeframe**: `all`, `today`, `week`, `month`, `quarter`, `year`
- **Channel**: `all`, `web`, `mobile`, `email`, `social`, `direct`, `organic`
- **Topic**: `all`, `sales`, `marketing`, `product`, `customer_service`, `operations`, `finance`, `tech`

## API Endpoints

### Updated Endpoints

#### 1. `/api/metrics` - Key Metrics
**Query Parameters:**
```
GET /api/metrics?timeframe=week&channel=web&topic=sales
```

**Response:**
```json
{
  "success": true,
  "metrics": [
    {
      "id": "metric-1",
      "name": "Weekly Revenue",
      "value": "$45,200",
      "change": "+8%",
      "trend": "up",
      "timeframe": "week",
      "channel": "web",
      "topic": "sales"
    }
  ]
}
```

#### 2. `/api/recommendations` - AI Recommendations
**Query Parameters:**
```
GET /api/recommendations?timeframe=month&channel=mobile&topic=product
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "rec-1",
      "text": "Update mobile app UI for better user experience",
      "urgency": "medium",
      "impact": "medium",
      "timeframe": "month",
      "channel": "mobile",
      "topic": "product"
    }
  ]
}
```

#### 3. `/api/priorities` - Top Priorities
**Query Parameters:**
```
GET /api/priorities?timeframe=today&channel=direct&topic=finance
```

**Response:**
```json
{
  "success": true,
  "priorities": [
    {
      "id": "pri-1",
      "task": "Review Q4 financials and prepare budget",
      "deadline": "Today",
      "status": "in-progress",
      "timeframe": "today",
      "channel": "direct",
      "topic": "finance"
    }
  ]
}
```

## Database Changes

### New Columns Added

All user data tables now include three new filter columns:

#### `user_metrics` Table
```sql
ALTER TABLE user_metrics ADD COLUMN timeframe VARCHAR DEFAULT 'month';
ALTER TABLE user_metrics ADD COLUMN channel VARCHAR DEFAULT 'web';
ALTER TABLE user_metrics ADD COLUMN topic VARCHAR DEFAULT 'sales';
```

#### `user_recommendations` Table
```sql
ALTER TABLE user_recommendations ADD COLUMN timeframe VARCHAR DEFAULT 'week';
ALTER TABLE user_recommendations ADD COLUMN channel VARCHAR DEFAULT 'web';
ALTER TABLE user_recommendations ADD COLUMN topic VARCHAR DEFAULT 'sales';
```

#### `user_priorities` Table
```sql
ALTER TABLE user_priorities ADD COLUMN timeframe VARCHAR DEFAULT 'week';
ALTER TABLE user_priorities ADD COLUMN channel VARCHAR DEFAULT 'direct';
ALTER TABLE user_priorities ADD COLUMN topic VARCHAR DEFAULT 'operations';
```

#### `user_charts` Table
```sql
ALTER TABLE user_charts ADD COLUMN timeframe VARCHAR DEFAULT 'month';
ALTER TABLE user_charts ADD COLUMN channel VARCHAR DEFAULT 'web';
ALTER TABLE user_charts ADD COLUMN topic VARCHAR DEFAULT 'sales';
```

### Migration

Run the migration script to update existing databases:

```bash
cd python-backend
python scripts/migrate_filters.py
```

## Sample Data

The endpoints now return sample data with diverse filter combinations:

### Metrics Examples
- Revenue (Web/Sales/Week)
- Active Users (Mobile/Marketing/Month)
- Support Tickets (Email/Customer Service/Week)
- Server Uptime (Direct/Tech/Month)

### Recommendations Examples
- Optimize checkout flow (Web/Sales/Week)
- Update mobile app UI (Mobile/Product/Month)
- Improve customer support (Email/Customer Service/Week)
- Automate financial reporting (Direct/Finance/Month)

### Priorities Examples
- Review Q4 financials (Direct/Finance/Today)
- Mobile checkout optimization (Mobile/Sales/Week)
- Social media campaign (Social/Marketing/Month)
- Server performance fixes (Direct/Tech/Today)

## Filter Logic

The filtering works as follows:
1. Each endpoint accepts optional `timeframe`, `channel`, and `topic` query parameters
2. If a parameter is missing or set to 'all', no filtering is applied for that dimension
3. Items are included in results only if they match ALL specified filters
4. The filtering is applied after data generation/retrieval

## User Data CRUD

All user data creation endpoints now accept the new filter fields:

### Creating Metrics
```json
POST /api/user/metrics
{
  "name": "Customer Satisfaction",
  "value": "92%",
  "change": "+5%",
  "trend": "up",
  "timeframe": "quarter",
  "channel": "email",
  "topic": "customer_service"
}
```

### Creating Recommendations
```json
POST /api/user/recommendations
{
  "text": "Implement A/B testing for homepage",
  "urgency": "medium",
  "impact": "high",
  "timeframe": "month",
  "channel": "web",
  "topic": "marketing"
}
```

### Creating Priorities
```json
POST /api/user/priorities
{
  "task": "Update team documentation",
  "deadline": "Next week",
  "status": "pending",
  "timeframe": "week",
  "channel": "direct",
  "topic": "operations"
}
```

## Backward Compatibility

- All filter parameters are optional and default to 'all'
- Existing API calls without filter parameters continue to work
- New database columns have default values
- Migration script handles existing data gracefully

## Error Handling

The endpoints maintain existing error handling patterns:
- Invalid filter values are treated as 'all'
- Database errors are logged and return 500 status
- Malformed requests return appropriate error messages

## Testing

Test the filtering functionality:

```bash
# Test metrics filtering
curl "http://localhost:5000/api/metrics?timeframe=week&topic=sales"

# Test recommendations filtering  
curl "http://localhost:5000/api/recommendations?channel=mobile&urgency=high"

# Test priorities filtering
curl "http://localhost:5000/api/priorities?topic=tech&timeframe=today"
``` 