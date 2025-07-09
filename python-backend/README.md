# Glanceable Backend

A clean, organized Python Flask backend for serving chart data and dashboard metrics.

## 📁 Project Structure

```
python-backend/
├── src/                    # Source code
│   ├── __init__.py        # Package initialization
│   ├── app.py             # Main Flask application
│   ├── chart_service.py   # Chart data service
│   ├── database.py        # Database manager
│   ├── user_data_db.py    # User data management
│   └── config.py          # Configuration settings
├── data/                   # Database files
│   ├── glanceable.duckdb  # Main database
│   └── user_data.duckdb   # User data database
├── scripts/               # Utility scripts
│   └── init_db.py         # Database initialization
├── server.py              # Main server entry point
├── init.py                # Database setup script
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## 🚀 Quick Start

1. **Install Dependencies:**
```bash
pip install -r requirements.txt
```

2. **Initialize Database:**
```bash
python init.py
```

3. **Start Server:**
```bash
python server.py
```

The server will start on `http://localhost:5000`

## 📊 API Endpoints

### Health Check
```
GET /health
```

### Chart Data
```
GET /api/charts/bar?metric=revenue&period=30d
GET /api/charts/pie?metric=user_segments&period=30d
GET /api/charts/line?metric=daily_users&period=30d
```

### Dashboard Data
```
GET /api/metrics           # Key metrics
GET /api/recommendations   # AI recommendations  
GET /api/priorities       # Top priorities
```

### User Data Management
```
GET/POST /api/user/charts        # User charts
GET/POST /api/user/metrics       # User metrics
GET/POST /api/user/priorities    # User priorities
```

## 🗄️ Database

The backend uses DuckDB for fast analytics:
- **Main Database**: `data/glanceable.duckdb` - Contains transactions, activities, orders
- **User Database**: `data/user_data.duckdb` - Contains user-specific dashboard data

### Sample Data
The database initialization creates:
- 1,000 transactions across 8 categories
- 2,000 user activities with 6 activity types  
- 500 orders with 5 status types

## 🔧 Configuration

Environment variables (optional):
```bash
PORT=5000                    # Server port
DATABASE_URL=duckdb://...    # Custom database URL
FLASK_ENV=development        # Environment mode
```

## 📈 Chart Service

The chart service provides simplified, hardcoded data for reliable chart rendering:
- **Consistent IDs**: Chart data uses human-readable IDs matching labels
- **Multiple Metrics**: Revenue, daily users, orders, user segments
- **Multiple Chart Types**: Bar, pie, and line charts supported

All chart data returns in the format:
```json
{
  "success": true,
  "data": [
    {"id": "Electronics", "label": "Electronics", "value": 36611},
    {"id": "Beauty", "label": "Beauty", "value": 32513}
  ]
}
``` 