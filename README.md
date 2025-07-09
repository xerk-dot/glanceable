# Glanceable Dashboard

> **A modern, hybrid business intelligence dashboard that works both locally with a Python backend and standalone in production.**

Glanceable is a full-stack dashboard application that intelligently adapts to your deployment environment. For local development, it connects to a Python Flask backend with DuckDB for real data. In production, it runs as a standalone React application with beautiful static data visualizations.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-green?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Python-blue?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-DuckDB-orange?style=for-the-badge)

🌐 **Live Demo:** [https://glanceable.vercel.app/](https://glanceable.vercel.app/)

## ✨ Key Features

### 🎯 **Smart Dashboard**
- **Fixed Overview Area** with Key Metrics, AI Recommendations, and Top Priorities
- **Dynamic Chart Area** with real-time chart creation and customization
- **Quick Filters** for timeframe, channel, and topic analysis
- **Adaptive Data Sources** - real backend data locally, static data in production

### 📊 **Advanced Charts & Analytics**
- **Bar Charts** for comparative analysis and trends
- **Pie Charts** for distribution and segmentation insights  
- **Line Charts** for time-series and performance tracking
- **Real-time Metrics** with live data feeds (local development)
- **Responsive Design** optimized for all devices

### 🤖 **AI-Powered Insights**
- Intelligent recommendations based on data patterns
- Automated priority detection and alerting
- Smart categorization and trend analysis

### ⚡ **Deployment Flexibility**
- **Local Development:** Full-stack with Python backend and real database
- **Production:** Standalone frontend with beautiful static visualizations
- **Seamless Environment Detection** - automatically adapts to available resources

## 🏗️ Architecture

### 🎨 Frontend (React + Next.js)
```
frontend/
├── app/
│   ├── components/              # React UI components
│   │   ├── Dashboard.tsx        # Main dashboard layout
│   │   ├── ChartCard.tsx        # Chart display components
│   │   ├── KeyMetrics.tsx       # KPI dashboard
│   │   ├── AIRecommendations.tsx
│   │   ├── TopPriorities.tsx
│   │   └── ...
│   ├── api/                     # Next.js API routes (hybrid mode)
│   │   ├── charts/route.ts      # Chart data endpoints
│   │   ├── metrics/route.ts     # Metrics aggregation
│   │   ├── priorities/route.ts  # Priority calculations
│   │   └── recommendations/route.ts
│   ├── globals.css              # Tailwind CSS styles
│   ├── layout.tsx               # App layout
│   └── page.tsx                 # Main dashboard page
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

### 🐍 Backend (Python + Flask + DuckDB)
```
python-backend/
├── src/
│   ├── app.py                   # Main Flask application
│   ├── user_data_db.py          # Database connection & queries
│   └── __init__.py
├── scripts/
│   └── init_db.py               # Database initialization
├── data/                        # DuckDB database files
│   ├── glanceable.duckdb        # Main database
│   └── user_data.duckdb         # User analytics data
├── server.py                    # Development server entry point
├── main.py                      # Production/GCP entry point
├── requirements.txt             # Python dependencies
└── app.yaml                     # Google Cloud App Engine config
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0+ with npm/pnpm
- **Python** 3.9+ with pip
- **Git** for cloning the repository

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/glanceable.git
cd glanceable
```

### 2. Frontend Setup

```bash
cd frontend
npm install  # or pnpm install
```

### 3. Backend Setup (for Local Development)

```bash
cd python-backend
pip install -r requirements.txt

# Initialize database with sample data
python3 scripts/init_db.py
```

## 🖥️ Running Locally (Full-Stack Mode)

### Start the Backend Server
```bash
cd python-backend
python3 server.py
```
🔗 **Backend will run at:** http://localhost:5000

### Start the Frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
🌐 **Frontend will run at:** http://localhost:3000

### Verify Connection
```bash
# Test backend health
curl http://localhost:5000/health

# Test frontend API (should return backend data)
curl http://localhost:3000/api/metrics
```

## 🌍 Production Mode (Standalone Frontend)

### Run Frontend Standalone
```bash
cd frontend
npm run dev:standalone    # Development standalone mode
npm run build:standalone  # Production build without backend
```

### Deploy to Vercel
```bash
cd frontend
npm run build:standalone
# Deploy using Vercel CLI or connect GitHub repo to Vercel
```

## 📜 Available Scripts

### Frontend Scripts
```bash
npm run dev                # Full-stack development (connects to backend)
npm run dev:standalone     # Frontend-only development mode
npm run build              # Production build (expects backend)
npm run build:standalone   # Standalone production build
npm run start             # Start production server
npm run lint              # Run ESLint
```

### Backend Scripts
```bash
python3 server.py              # Development server with debug mode
python3 main.py                # Production server (GCP ready)
python3 scripts/init_db.py     # Initialize database with sample data
```

## 🎨 Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Next.js 15** - App Router with built-in API routes
- **TypeScript** - Type safety and developer experience  
- **TailwindCSS** - Utility-first styling framework
- **Nivo Charts** - Beautiful, responsive data visualizations
- **React Hook Form** - Performant form management

### Backend  
- **Python 3.9+** - Modern Python runtime
- **Flask 3.0** - Lightweight web framework with CORS
- **DuckDB** - Fast analytical database with excellent Python integration
- **Pandas** - Data analysis and aggregation
- **SQLAlchemy** - Database ORM for complex queries

### Deployment
- **Frontend:** Vercel (production), localhost:3000 (development)
- **Backend:** Google Cloud App Engine (production), localhost:5000 (development)
- **Database:** File-based DuckDB with 1000+ sample records

## 📊 Sample Data

The backend comes with pre-populated sample data for immediate testing:

- **1,000 Transactions** - Revenue, categories, user segments
- **2,000 User Activities** - Engagement metrics, activity types
- **500 Orders** - Conversion data, order statuses, amounts

Database tables:
```sql
transactions (id, user_id, amount, category, created_at)
user_activities (id, user_id, activity_type, created_at)
orders (id, user_id, status, total_amount, created_at)
```

## 📡 API Endpoints

### Backend Endpoints (localhost:5000)
```bash
GET /health                           # Service health check
GET /api/charts/bar?period=30d        # Bar chart data
GET /api/charts/pie?period=30d        # Pie chart data  
GET /api/charts/line?period=30d       # Line chart data
GET /api/metrics                      # Key performance metrics
GET /api/recommendations              # AI-powered insights
GET /api/priorities                   # Priority tasks/issues
```

### Frontend API Routes (localhost:3000)
```bash
GET /api/charts        # Hybrid: backend data or static fallback
GET /api/metrics       # KPI aggregation with intelligent fallback
GET /api/priorities    # Priority detection (backend preferred)
GET /api/recommendations  # AI recommendations (static in standalone)
```

## 🔧 Configuration

### Environment Detection

The application automatically detects its environment:

**Local Development (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Production (.env.production):**
```bash
NEXT_PUBLIC_API_URL=
# Empty API URL triggers standalone mode
```

### Backend Configuration
```bash
# Automatic DuckDB database paths:
# ./data/glanceable.duckdb - main application data
# ./data/user_data.duckdb - user analytics data

# Server configuration
PORT=5000                    # Development server port
FLASK_ENV=development        # Development mode with debug
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```
Automatically detects `build:standalone` for production builds.

### Backend (Google Cloud)
```bash
cd python-backend
gcloud app deploy app.yaml
```

### Local Production Testing
```bash
# Frontend production build
cd frontend && npm run build:standalone && npm start

# Backend production mode  
cd python-backend && python3 main.py
```

## 🔍 Troubleshooting

### Frontend won't connect to backend
```bash
# Check backend is running
curl http://localhost:5000/health

# Verify environment configuration
cat frontend/.env.local  # Should contain NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend database errors
```bash
# Reinitialize database
cd python-backend
rm -rf data/*.duckdb
python3 scripts/init_db.py
```

### Port conflicts
```bash
# Kill processes on ports 3000-5000
npx kill-port 3000
npx kill-port 5000
```

## 🛠️ Development Workflow

### Full-Stack Development
1. Start backend: `cd python-backend && python3 server.py`
2. Start frontend: `cd frontend && npm run dev`
3. Open: http://localhost:3000
4. Backend API available at: http://localhost:5000

### Frontend-Only Development
1. Start standalone: `cd frontend && npm run dev:standalone`
2. Open: http://localhost:3000
3. Uses static data, no backend required

### Adding New Features
1. **Backend:** Add logic to `src/app.py` and `src/user_data_db.py`
2. **Frontend:** Create components in `app/components/`
3. **API Integration:** Update API routes in `app/api/`

## 📈 Performance

- **Frontend:** Sub-second page loads with code splitting
- **Backend:** Handles 100+ concurrent requests with connection pooling
- **Database:** Optimized DuckDB queries for analytical workloads
- **Charts:** Smooth 60fps animations with thousands of data points
- **Hybrid Architecture:** Zero backend dependency in production

## 🎯 Use Cases

### Business Intelligence
- **Executive Dashboards** - High-level KPIs and trends
- **Sales Analytics** - Revenue tracking and forecasting  
- **User Engagement** - Activity metrics and retention analysis
- **Development & Demo** - Local full-stack, production lightweight

### Industries
- **E-commerce** - Sales, conversion, and customer analytics
- **SaaS** - User engagement, churn, and revenue metrics
- **Marketing** - Campaign performance and ROI tracking
- **Agencies** - Client demonstrations with beautiful static data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test both standalone and full-stack modes
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Why Glanceable?

> **"The perfect balance of powerful local development and lightweight production deployment."**

- ✅ **Hybrid Architecture** - Full backend locally, standalone in production
- ✅ **Zero Backend Dependency** - Deploy frontend anywhere, anytime
- ✅ **Real Data Development** - Work with actual database and APIs locally
- ✅ **Beautiful Static Mode** - Stunning visualizations even without backend
- ✅ **Developer Friendly** - Simple setup, clear documentation
- ✅ **Production Ready** - Deployed and tested in real environments

---

**Ready to build beautiful dashboards?** [Get started locally](#-running-locally-full-stack-mode) or [view the live demo](https://glanceable.vercel.app)

*Built with ❤️ for flexible, data-driven applications*