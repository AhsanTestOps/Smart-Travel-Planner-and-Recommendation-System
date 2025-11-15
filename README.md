# Smart Travel Planner and Recommendation System

A comprehensive AI-powered travel planning platform that helps users discover destinations, plan trips, and receive personalized travel recommendations.

## 🚀 Features

- **AI-Powered Itinerary Generation** - Get intelligent travel plans tailored to your preferences
- **Destination Discovery** - Browse and explore various travel destinations with detailed information
- **Trip Management** - Create, manage, and track your travel plans
- **Free Trip Planning** - Access trip planning tools without commitment
- **User Authentication** - Secure account management and personalized experiences
- **Interactive Maps** - Visualize destinations and routes on interactive maps

## 🛠️ Tech Stack

### Backend
- **Django** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL/SQLite** - Database
- **AI Integration** - DeepSeek API for intelligent recommendations

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Navigation
- **Context API** - State management

## 📁 Project Structure

```
travel/
├── backend/           # Django backend application
│   ├── accounts/      # User authentication & management
│   ├── ai_travel/     # AI-powered travel recommendations
│   ├── destinations/  # Destination data & management
│   ├── free_trips/    # Free trip planning features
│   ├── trips/         # Trip management
│   └── travel_backend/ # Django settings & configuration
├── frontend/          # React frontend application
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── context/    # React context providers
│       ├── pages/      # Application pages
│       └── utils/      # Utility functions
└── db/                # Database schemas & migrations
```

## 🚦 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

1. Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=your-database-url
AI_API_KEY=your-deepseek-api-key
```

2. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000/api
```

## 📝 API Documentation

The backend API provides the following main endpoints:

- `/api/accounts/` - User authentication and profile management
- `/api/destinations/` - Destination information and search
- `/api/trips/` - Trip CRUD operations
- `/api/ai-travel/` - AI-powered itinerary generation
- `/api/free-trips/` - Free trip planning tools

## 🤝 Contributing

This is a proprietary project. All rights reserved.

## 📄 License

Copyright (c) 2025 Ahsan. All Rights Reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## 👤 Author

**Ahsan** - *Full Stack Developer*

## 📧 Contact

For inquiries, please contact through the project repository.

---

**Note**: This project was developed as a Final Year Project (FYP) -
