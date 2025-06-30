# Glanceable Dashboard

A dynamic, insightful Home Page that greets users with an immediate, high-level snapshot of key business metrics and AI-driven insights.

## Features

- **Fixed Overview Area** with Key Metrics, AI Recommendations, and Top Priorities
- **Customizable Chart Area** with full CRUD functionality and form-driven card creation
- **Quick Filters** for timeframe, channel, and topic
- **Minimalist, Fast-loading UI** with color cues for urgency

## Technical Stack

- **Frontend**: React + TypeScript + Next.js
- **Form Management**: react-hook-form
- **Charts**: Nivo
- **Styling**: TailwindCSS

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/glanceable.git
cd glanceable
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Architecture

- **React Components**: Modular, reusable components following best practices
- **API Routes**: Serverless functions for fetching data
- **State Management**: React hooks for local state management
- **Responsive Design**: Mobile-first approach using TailwindCSS

## Deployment

This application is deployed on Vercel. You can view the live demo at [https://glanceable.vercel.app](https://glanceable.vercel.app).

## Future Improvements

- Real backend integration with database
- User authentication and personalization
- More chart types and visualization options
- Drag-and-drop interface for rearranging cards
- Real-time data updates
