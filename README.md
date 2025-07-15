# Glanceable Dashboard

A modern, responsive dashboard application built with Next.js and FastAPI, featuring real-time data visualization, user-generated content management, and seamless cloud deployment.

## 🚀 Live Demo

- **Frontend:** https://glanceable-qh8novrij-xerk-dots-projects.vercel.app
- **Backend API:** https://glanceable-backend-985142625034.us-central1.run.app
- **API Documentation:** https://glanceable-qh8novrij-xerk-dots-projects.vercel.app/api-docs

## 📋 Features

### Core Functionality
- **Interactive Dashboard** - Real-time data visualization with customizable charts
- **Charts & Analytics** - Create, edit, and visualize data with bar and pie charts
- **Key Metrics** - Track important KPIs with trend indicators
- **Priority Management** - Organize and track tasks with status updates
- **AI Recommendations** - Smart suggestions for business improvements
- **Responsive Design** - Fully mobile-friendly interface

### Technical Features
- **Full CRUD Operations** - Create, read, update, delete for all data types
- **Real-time Data** - Live updates and synchronization
- **Data Persistence** - PostgreSQL database with SQLAlchemy ORM
- **API Documentation** - Interactive Swagger UI for API exploration
- **Cloud Deployment** - Production-ready with Docker and Cloud Run
- **CORS Support** - Cross-origin requests properly configured

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Vercel        │    │   Cloud Run     │    │   GCP SQL       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Nivo Charts for data visualization
- React Hook Form for form management
- Swagger UI for API documentation

**Backend:**
- FastAPI with Python 3.11
- SQLAlchemy 2.0 for ORM
- Pydantic for data validation
- Uvicorn ASGI server
- PostgreSQL database

**Infrastructure:**
- **Frontend:** Vercel (serverless deployment)
- **Backend:** Google Cloud Run (containerized)
- **Database:** Google Cloud SQL (PostgreSQL)
- **Container Registry:** Google Container Registry

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (local) or GCP account
- Docker (for containerization)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd python-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### Environment Variables

**Backend (.env):**
```env
PROJECT_ID=your-gcp-project-id
REGION=us-central1
INSTANCE_NAME=your-db-instance
DB_NAME=glanceable
DB_USER=postgres
DB_PASSWORD=your-password
```

## 🚢 Deployment

### Backend Deployment (Google Cloud Run)

```bash
# Build and push Docker image
cd python-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/glanceable-backend:latest

# Deploy to Cloud Run
gcloud run deploy glanceable-backend \
  --image gcr.io/PROJECT_ID/glanceable-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME
```

### Frontend Deployment (Vercel)

```bash
cd frontend
vercel --prod
```

## 📊 API Endpoints

### System Endpoints
- `GET /api/charts` - Get chart data with filtering
- `GET /api/metrics` - Get system metrics
- `GET /api/priorities` - Get system priorities
- `GET /api/recommendations` - Get system recommendations

### User Management Endpoints
- `GET /api/user/charts` - List user charts
- `POST /api/user/charts` - Create new chart
- `PUT /api/user/charts` - Update chart
- `DELETE /api/user/charts` - Delete chart

Similar CRUD endpoints exist for:
- `/api/user/metrics`
- `/api/user/priorities`
- `/api/user/recommendations`

### Health Check
- `GET /health` - Service health status

## 🎨 UI Components

### Dashboard Sections
1. **Key Metrics** - Display important KPIs with trend indicators
2. **Dynamic Chart Area** - Interactive charts with customization options
3. **Top Priorities** - Task management with status tracking
4. **AI Recommendations** - Smart suggestions and insights

### Chart Types
- **Bar Charts** - For categorical data comparison
- **Pie Charts** - For proportional data visualization
- **Custom Metrics** - User-defined KPI tracking

## 🔧 Configuration

### CORS Settings
The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://*.vercel.app` (production)
- Additional domains as needed

### Database Schema
- **Charts** - User-created visualizations
- **Metrics** - Key performance indicators
- **Priorities** - Task and priority management
- **Recommendations** - AI-generated suggestions

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd python-backend
pytest
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔐 Security

- **CORS Protection** - Configured for specific origins
- **Input Validation** - Pydantic schemas for data validation
- **SQL Injection Prevention** - SQLAlchemy ORM protection
- **Environment Variables** - Sensitive data stored securely

## 🚀 Performance

- **Server-Side Rendering** - Next.js SSR for fast initial loads
- **API Caching** - Optimized database queries
- **Image Optimization** - Next.js automatic image optimization
- **Bundle Optimization** - Code splitting and tree shaking

## 📈 Monitoring

- **Health Checks** - Built-in health monitoring
- **Error Handling** - Comprehensive error responses
- **Logging** - Structured logging for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with FastAPI and Next.js
- Charts powered by Nivo
- Hosted on Vercel and Google Cloud Platform
- Database provided by Google Cloud SQL