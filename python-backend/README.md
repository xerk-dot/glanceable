# Chart Backend API

A Python Flask backend specifically designed for serving chart data from remote SQL databases.

## Features

- **Multiple Database Support**: PostgreSQL, MySQL, SQLite, and more
- **Chart Data Processing**: Bar charts, pie charts, line charts (time series)
- **Real-time Metrics**: Live data endpoints for dashboard updates
- **Connection Pooling**: Efficient database connection management
- **CORS Enabled**: Ready for frontend integration
- **Sample Data**: Fallback data generation when database is unavailable

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Chart Data Endpoints

#### Bar Charts
```
GET /api/charts/bar?metric=revenue&period=30d&category=electronics
```
Parameters:
- `metric`: revenue, transactions, user_activity
- `period`: 7d, 30d, 90d, 1y
- `category`: (optional) filter by category

#### Pie Charts
```
GET /api/charts/pie?metric=user_segments&period=30d
```
Parameters:
- `metric`: user_segments, revenue_by_segment, traffic_sources
- `period`: 7d, 30d, 90d, 1y

#### Line Charts (Time Series)
```
GET /api/charts/line?metric=daily_users&period=30d&granularity=day
```
Parameters:
- `metric`: daily_users, revenue, orders, conversion_rate
- `period`: 7d, 30d, 90d, 1y
- `granularity`: hour, day, week, month

#### Available Metrics
```
GET /api/charts/metrics
```
Returns all available metrics organized by chart type.

#### Real-time Data
```
GET /api/charts/realtime/active_users
```
Returns current real-time value for the specified metric.

## Database Configuration

The backend supports multiple database connections:

### Environment Variables

```bash
# Primary database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Analytics database (optional)
ANALYTICS_DATABASE_URL=postgresql://user:pass@analytics-host:5432/analytics

# Data warehouse (optional)
WAREHOUSE_DATABASE_URL=postgresql://user:pass@warehouse-host:5432/warehouse
```

### Supported Database URLs

**PostgreSQL:**
```
postgresql://username:password@host:port/database
```

**MySQL:**
```
mysql+mysqlconnector://username:password@host:port/database
```

**SQLite (Development):**
```
sqlite:///path/to/database.db
```

## Expected Database Schema

The backend expects the following tables for full functionality:

### transactions
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    amount DECIMAL(10,2),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_activities
```sql
CREATE TABLE user_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    activity_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### orders
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    status VARCHAR(50),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Installation & Setup

1. **Install Dependencies:**
```bash
cd python-backend
pip install -r requirements.txt
```

2. **Configure Environment:**
```bash
# Copy and edit the environment file
cp .env.example .env
# Edit .env with your database credentials
```

3. **Run Development Server:**
```bash
python run.py
```

Or using Flask directly:
```bash
flask --app app run --debug
```

## Production Deployment

### Using Gunicorn
```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

### Using Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]
```

## Frontend Integration

### Example JavaScript Usage

```javascript
// Get bar chart data
const barData = await fetch('http://localhost:5000/api/charts/bar?metric=revenue&period=30d')
  .then(res => res.json());

// Get real-time data
const realtimeData = await fetch('http://localhost:5000/api/charts/realtime/active_users')
  .then(res => res.json());

// Use with your charting library (e.g., Nivo, Chart.js, D3)
```

### Response Format

All endpoints return JSON in this format:
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "metric": "revenue",
    "period": "30d",
    "generated_at": "2024-01-15T10:30:00Z"
  }
}
```

## Development Features

- **Automatic Sample Data**: When database is not connected, returns realistic sample data
- **SQL Debugging**: Set `SQL_DEBUG=true` to log all SQL queries
- **Connection Testing**: Built-in connection health checks
- **Error Handling**: Graceful fallbacks and detailed error logging

## Logging

The backend uses Python's standard logging module. Set the log level via environment:
```bash
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARNING, ERROR
```

## Security Considerations

- Always use environment variables for database credentials
- Enable CORS only for trusted domains in production
- Use connection pooling to prevent connection exhaustion
- Implement rate limiting for production use
- Validate and sanitize all input parameters 