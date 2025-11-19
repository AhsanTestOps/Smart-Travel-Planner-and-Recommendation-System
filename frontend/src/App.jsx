import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionStatus from './components/ConnectionStatus';
import Home from './pages/Home';
import TripPlanForm from './pages/TripPlanForm';
import MapDisplay from './pages/MapDisplay_enhanced';
import SavedTrips from './pages/SavedTrips';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FreeTripPlanForm from './pages/FreeTripPlanForm_new';
import FreeMapDisplay from './pages/FreeMapDisplay_enhanced';
// AI Travel Components
import AITravelHome from './components/ai-travel/AITravelHome';
import AIItineraryGenerator from './components/ai-travel/AIItineraryGenerator';
import AIItineraryDisplay from './components/ai-travel/AIItineraryDisplay';
import AITravelHistory from './components/ai-travel/AITravelHistory';
import DestinationsPage from './pages/DestinationsPage';
import { TripProvider } from './context/TripContext';
import { AuthProvider } from './context/AuthContext';
import { FreeTripProvider } from './context/FreeTripContext';
import { AITravelProvider } from './context/AITravelContext';

function AppContent() {
  const location = useLocation();
  const hideHeader = ['/login', '/signup', '/free-plan', '/free-map'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && <Header />}
      <main className={hideHeader || isHomePage ? '' : 'container mx-auto px-4 py-8'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/plan" element={
            <ProtectedRoute>
              <TripPlanForm />
            </ProtectedRoute>
          } />
          <Route path="/map" element={<MapDisplay />} />
          <Route path="/saved-trips" element={
            <ProtectedRoute>
              <SavedTrips />
            </ProtectedRoute>
          } />
          <Route path="/destinations" element={<DestinationsPage />} />
          {/* Free trip planning routes (no authentication required) */}
          <Route path="/free-plan" element={<FreeTripPlanForm />} />
          <Route path="/free-map" element={<FreeMapDisplay />} />
          
          {/* AI Travel Routes */}
          <Route path="/ai-travel" element={
            <ErrorBoundary>
              <AITravelHome />
            </ErrorBoundary>
          } />
          <Route path="/ai-travel/generate" element={
            <ErrorBoundary>
              <AIItineraryGenerator />
            </ErrorBoundary>
          } />
          <Route path="/ai-travel/itinerary/:id" element={
            <ErrorBoundary>
              <AIItineraryDisplay />
            </ErrorBoundary>
          } />
          <Route path="/ai-travel/history" element={
            <ErrorBoundary>
              <AITravelHistory />
            </ErrorBoundary>
          } />
        </Routes>
      </main>
      <ConnectionStatus />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AITravelProvider>
          <TripProvider>
            <FreeTripProvider>
              <Router>
                <AppContent />
              </Router>
            </FreeTripProvider>
          </TripProvider>
        </AITravelProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
