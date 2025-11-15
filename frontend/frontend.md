# Smart Travel Planner Frontend

A React-based web application for planning trips with AI-generated itineraries and interactive maps.

## Features

- **Landing Home Page**: Beautiful marketing page with features, testimonials, and call-to-actions
- **User Authentication**: Secure login/signup with form validation
- **Trip Planning Form**: Input destination, dates, travelers, interests, and budget
- **Interactive Map**: View recommended locations with clickable markers using Leaflet
- **Saved Trips Dashboard**: Save and manage multiple trip plans
- **Responsive Design**: Works on desktop and mobile devices
- **Protected Routes**: Authentication-based access control

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Leaflet & React-Leaflet** - Interactive maps
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.jsx      # Navigation header with auth
│   └── ProtectedRoute.jsx # Route protection
├── context/            # React context providers
│   ├── TripContext.jsx # Trip state management
│   └── AuthContext.jsx # Authentication state
├── pages/              # Page components
│   ├── Home.jsx            # Landing page
│   ├── Login.jsx           # User login form
│   ├── Signup.jsx          # User registration form
│   ├── TripPlanForm.jsx    # Trip input form
│   ├── MapDisplay.jsx      # Interactive map
│   └── SavedTrips.jsx      # Saved trips dashboard
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Features Overview

### Home Page
- **Hero Section**: Compelling landing page with clear value proposition
- **Feature Showcase**: Highlights of AI-powered recommendations and smart planning
- **Popular Destinations**: Showcase of trending travel locations
- **How It Works**: Step-by-step guide for new users
- **Testimonials**: Social proof from satisfied travelers
- **Call-to-Actions**: Multiple conversion points for signup/login

### Authentication System
- **Login Page**: Secure login with email/password validation
- **Signup Page**: User registration with password strength indicator
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **User Profile**: Dropdown menu with user info and logout
- **Demo Mode**: Any email/password combination works for demo purposes

### Trip Planning Form
- Destination input
- Date selection (start/end dates)
- Number of travelers
- Interest selection (Adventure, Culture, Shopping, etc.)
- Budget slider ($100-$5000)

### Interactive Map
- Displays recommended locations as markers
- Clickable markers with location details
- Side panel with trip summary and recommendations
- Location details view
- Save trip functionality

### Saved Trips Dashboard
- Grid view of all saved trips
- Trip summary cards with key details
- View/delete trip actions
- Empty state for new users

## Data Storage

- **Authentication**: User data stored in browser's localStorage
- **Trip Data**: Trip details stored in browser's localStorage
- **Session Persistence**: User remains logged in across browser sessions
- **Local Development**: No backend required for demo functionality

## Customization

### Adding New Interest Categories
Edit the `interestOptions` array in `src/pages/TripPlanForm.jsx`:

```javascript
const interestOptions = [
  'Adventure',
  'Culture',
  'Shopping',
  // Add new interests here
];
```

### Customizing Map Appearance
Modify the `TileLayer` component in `src/pages/MapDisplay.jsx` to use different map tiles.

### Styling
- Colors and themes can be customized in `tailwind.config.js`
- Component styles are in `src/index.css`

## Future Enhancements

- Real AI integration for recommendations
- User authentication
- Trip sharing functionality
- Offline support
- Mobile app version
- Integration with booking platforms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
