import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Sparkles, MapPin, DollarSign, Calendar, Clock, 
  Star, TrendingUp, Users, Zap, ArrowRight,
  Brain, Globe, Navigation, PiggyBank
} from 'lucide-react';
import { useAITravel } from '../../context/AITravelContext';
import { useAuth } from '../../context/AuthContext';

const AITravelHome = () => {
  const navigate = useNavigate();
  
  // Add error handling for context
  let allItineraries = [];
  let loading = false;
  let isAuthenticated = false;
  
  try {
    const { allItineraries: contextItineraries = [], loading: contextLoading = false } = useAITravel();
    allItineraries = contextItineraries;
    loading = contextLoading;
  } catch (error) {
    console.error('Error accessing AITravel context:', error);
  }
  
  try {
    const { isAuthenticated: contextAuth = false } = useAuth();
    isAuthenticated = contextAuth;
  } catch (error) {
    console.error('Error accessing Auth context:', error);
  }
  
  const recentItineraries = allItineraries.slice(0, 3);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Planning",
      description: "Advanced AI analyzes millions of travel data points to create personalized itineraries",
      color: "text-purple-600"
    },
    {
      icon: PiggyBank,
      title: "Smart Budget Estimation",
      description: "Get detailed, accurate cost breakdowns for all aspects of your trip",
      color: "text-green-600"
    },
    {
      icon: Navigation,
      title: "Optimized Routes",
      description: "Efficient daily schedules that maximize your time and minimize travel stress",
      color: "text-blue-600"
    },
    {
      icon: Globe,
      title: "Global Destinations",
      description: "Comprehensive knowledge of destinations worldwide, from popular to hidden gems",
      color: "text-orange-600"
    }
  ];

  const stats = [
    {
      icon: Sparkles,
      value: "AI-Generated",
      label: "Personalized Itineraries",
      color: "text-purple-600"
    },
    {
      icon: Clock,
      value: "< 2 mins",
      label: "Average Generation Time",
      color: "text-blue-600"
    },
    {
      icon: DollarSign,
      value: "Accurate",
      label: "Budget Estimations",
      color: "text-green-600"
    },
    {
      icon: TrendingUp,
      value: "Smart",
      label: "Travel Optimization",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Travel Planning
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Let artificial intelligence create the perfect personalized itinerary for your next adventure. 
          Get detailed schedules, budget estimates, and local recommendations in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/ai-travel/generate')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate AI Itinerary
          </Button>
          {allItineraries.length > 0 && (
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/ai-travel/history')}
            >
              View My Itineraries
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6 pb-4">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose AI Travel Planning?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gray-50 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Itineraries */}
      {recentItineraries.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Recent AI Itineraries</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/ai-travel/history')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentItineraries.map((itinerary) => (
              <Card 
                key={itinerary.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/ai-travel/itinerary/${itinerary.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {itinerary.destination}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      Budget: ${itinerary.budget_usd ? itinerary.budget_usd.toLocaleString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-3 w-3" />
                      {itinerary.group_size} {itinerary.group_size === 1 ? 'traveler' : 'travelers'}
                    </div>
                    <Badge variant="outline" className="w-fit capitalize mt-2">
                      {itinerary.travel_style.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="text-center p-8">
          <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ready to Plan Your Perfect Trip?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of travelers who trust our AI to create amazing, personalized travel experiences. 
            {!isAuthenticated && " Create an account to save your itineraries and access them anytime!"}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/ai-travel/generate')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Planning Now
            </Button>
            {/*
            {!isAuthenticated && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/register')}
              >
                Create Free Account
              </Button>
            )}  */}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="font-semibold">Tell Us Your Preferences</h3>
            <p className="text-gray-600 text-sm">
              Share your destination, dates, budget, and travel style with our AI
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold">AI Creates Your Itinerary</h3>
            <p className="text-gray-600 text-sm">
              Our AI analyzes millions of data points to craft your perfect trip
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-green-600">3</span>
            </div>
            <h3 className="font-semibold">Enjoy Your Perfect Trip</h3>
            <p className="text-gray-600 text-sm">
              Get detailed schedules, budgets, and recommendations for an amazing journey
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITravelHome;
