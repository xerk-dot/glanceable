# Glanceable FastAPI Backend

FastAPI backend for the Glanceable dashboard with GCP SQL database integration.

## Setup

1. **Install Dependencies**
   ```bash
   cd python-backend
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your GCP SQL credentials
   ```

3. **Local Development (SQLite)**
   ```bash
   # Set ENVIRONMENT=development in .env for SQLite
   python main.py
   ```

4. **Production (GCP SQL)**
   ```bash
   # Set ENVIRONMENT=production in .env
   # Configure GCP credentials and database password
   python main.py
   ```

## Database Configuration

### Local Development
- Uses SQLite database (`glanceable.db`)
- Automatically creates tables on startup

### Production (GCP SQL)
- Connects to PostgreSQL on Google Cloud SQL
- Requires GCP credentials and database configuration
- Project: `hanoverpark`
- Instance: `glanceable-db`
- Database: `glanceable`

## API Endpoints

### System Endpoints
- `GET /api/charts` - Get chart data
- `GET /api/metrics` - Get system metrics
- `GET /api/priorities` - Get system priorities
- `GET /api/recommendations` - Get system recommendations

### User Data CRUD
- `GET /api/user/charts` - List user charts with pagination/filters
- `POST /api/user/charts` - Create new chart
- `PUT /api/user/charts` - Update chart
- `DELETE /api/user/charts?id={id}` - Delete chart

- `GET /api/user/metrics` - List user metrics with pagination/filters
- `POST /api/user/metrics` - Create new metric
- `PUT /api/user/metrics` - Update metric
- `DELETE /api/user/metrics?id={id}` - Delete metric

- `GET /api/user/priorities` - List user priorities with pagination/filters
- `POST /api/user/priorities` - Create new priority
- `PUT /api/user/priorities` - Update priority
- `DELETE /api/user/priorities?id={id}` - Delete priority

- `GET /api/user/recommendations` - List user recommendations with pagination/filters
- `POST /api/user/recommendations` - Create new recommendation
- `PUT /api/user/recommendations` - Update recommendation
- `DELETE /api/user/recommendations?id={id}` - Delete recommendation

## Database Models

### Chart
- `id` (String, Primary Key)
- `title` (String, Required)
- `chart_type` (String, Required) - bar, pie, line
- `numeric_value` (String, Required) - count, average, sum, median
- `metric` (String, Required) - revenue, daily_users, orders
- `timeframe` (String) - month, week, quarter, year
- `channel` (String) - web, mobile, email, social, direct, organic
- `topic` (String) - sales, marketing, product, operations, finance, tech
- `description` (Text)
- `created_at`, `updated_at` (DateTime)

### Metric
- `id` (String, Primary Key)
- `title` (String, Required)
- `value` (String, Required)
- `change` (Float) - percentage change
- `change_type` (String) - positive, negative, neutral
- `unit` (String) - $, %, count
- `timeframe`, `channel`, `topic` (String)
- `description` (Text)
- `created_at`, `updated_at` (DateTime)

### Priority
- `id` (String, Primary Key)
- `title` (String, Required)
- `description` (Text)
- `deadline` (String)
- `priority` (String, Required) - high, medium, low
- `impact` (String, Required) - high, medium, low
- `status` (String, Required) - pending, in-progress, completed, planned
- `assignee` (String)
- `timeframe`, `channel`, `topic` (String)
- `created_at`, `updated_at` (DateTime)

### Recommendation
- `id` (String, Primary Key)
- `text` (Text, Required)
- `urgency` (String, Required) - high, medium, low
- `impact` (String, Required) - high, medium, low
- `category` (String) - optimization, feature, bug-fix
- `implemented` (Boolean)
- `timeframe`, `channel`, `topic` (String)
- `description` (Text)
- `created_at`, `updated_at` (DateTime)

## Environment Variables

```bash
# Environment
ENVIRONMENT=development  # or production

# GCP SQL (production)
DB_PASSWORD=your_password
PROJECT_ID=hanoverpark
REGION=us-central1
INSTANCE_NAME=glanceable-db
DB_NAME=glanceable
DB_USER=postgres

# Local SQLite (development)
DATABASE_URL=sqlite:///./glanceable.db

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

## Running

```bash
# Development
python main.py

# Production with custom port
uvicorn main:app --host 0.0.0.0 --port 8000

# With auto-reload for development
uvicorn main:app --reload
```

## API Documentation

Once running, visit:
- Interactive docs: `http://localhost:8000/docs`
- OpenAPI spec: `http://localhost:8000/openapi.json`