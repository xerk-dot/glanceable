# Glanceable Dashboard - Frontend-Backend Integration

This document describes how the frontend and backend are connected and how to run the full stack.

## Architecture Overview

- **Frontend**: Next.js 15 application running on port 3000
- **Backend**: Python Flask application running on port 5001
- **Database**: DuckDB file-based database with sample data

## Backend Setup

### 1. Install Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
python3 init_db.py
```

This creates `glanceable.duckdb` with sample data:
- 1,000 transactions
- 2,000 user activities  
- 500 orders
- 90 days of realistic data

### 3. Start Backend Server

```bash
python3 app.py
```

The backend will run on `http://localhost:5001`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

The frontend is configured to connect to the backend via environment variables:

```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5001
API_URL=http://localhost:5001
```

### 3. Start Frontend Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Integration

The frontend connects to the backend through Next.js API routes that proxy requests:

### Endpoints Connected

1. **Metrics**: `/api/metrics` - Key dashboard metrics
2. **Recommendations**: `/api/recommendations` - AI-generated recommendations
3. **Priorities**: `/api/priorities` - Top priority tasks
4. **Charts**: `/api/charts` - Chart data for visualizations

### Data Flow

```
Frontend Components → Next.js API Routes → Python Backend → DuckDB Database
```

Each API route includes fallback to mock data if the backend is unavailable.

## Database Management

Use the database management script for common operations:

```bash
# Show database statistics
python3 manage_db.py stats

# Add more sample data
python3 manage_db.py add-data

# Reset database with fresh data
python3 manage_db.py reset

# Create backup
python3 manage_db.py backup
```

## Real-Time Features

The dashboard displays real-time data from the DuckDB database:

- **Active Users**: Count of unique users in the last hour
- **Weekly Revenue**: Sum of transaction amounts over 7 days
- **Pending Orders**: Count of orders with 'pending' status
- **Dynamic Charts**: Revenue by category, user segments, time series data

## Styling

The dashboard uses a custom purple and turquoise theme:
- Background: `#100454` (deep purple)
- Accents: `#00dac6` (turquoise)
- Borders: `#ffffff` (white)

## Testing the Connection

1. Start both servers
2. Visit `http://localhost:3000`
3. Check that metrics load with real data
4. Verify charts display actual database information
5. Test recommendations and priorities sections

## Troubleshooting

- **Port conflicts**: Backend uses port 5001 to avoid macOS AirPlay conflicts
- **Database locks**: Only one connection at a time; stop backend before running management scripts
- **Missing data**: Run `python3 init_db.py` to recreate sample data 